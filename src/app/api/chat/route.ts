import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { searchNodes, getRelatedSubgraph, getEvidence } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

// ------------------------------------------------------------
// Guest rate limiting (unauthenticated demo access)
// ------------------------------------------------------------

const GUEST_LIMIT = 20;
const GUEST_WINDOW_MS = 60 * 60 * 1000;
const guestHits = new Map<string, { count: number; resetAt: number }>();

const checkGuestRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const entry = guestHits.get(ip);
  if (!entry || now > entry.resetAt) {
    guestHits.set(ip, { count: 1, resetAt: now + GUEST_WINDOW_MS });
    return true;
  }
  if (entry.count >= GUEST_LIMIT) return false;
  entry.count += 1;
  return true;
};

// ------------------------------------------------------------
// SSE plumbing
// ------------------------------------------------------------

const encoder = new TextEncoder();
const sseEvent = (data: unknown) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

interface Citation {
  id: string;
  docTitle: string;
  docType: string;
  snippet: string;
  author: string;
  date: string;
  hash: string;
  nodeId?: string;
  evidenceId?: string;
  refLabel?: string;
}

interface AnswerMeta {
  citations: Citation[];
  confidenceScore: number;
  confidenceLevel: 'strong' | 'weak' | 'not_found';
  graphFocusNodes: string[];
  fallbackReason?: string;
  degraded: boolean;
}

const streamAnswer = (text: string, meta: AnswerMeta) => {
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(sseEvent({ content: text }));
      controller.enqueue(sseEvent({ meta: true, ...meta }));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
};

// ------------------------------------------------------------
// Retrieval — bounded to the graph neighbourhood of the query
// ------------------------------------------------------------

interface RetrievedContext {
  /** Ranked direct hits — the answer must lead with these, not with neighbours. */
  matched: Record<string, unknown>[];
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
  citations: Citation[];
  contextText: string;
}

const NO_EVIDENCE_TEXT = (query: string) =>
  `⚠️ **Confidence Gate: No supporting evidence (Confidence: 8%)**\n\n` +
  `Nothing in the institutional graph is connected to "${query}".\n\n` +
  `Rather than assemble a plausible-sounding answer from unrelated records, this query is bounded. ` +
  `Either the relevant decision was never recorded, it is described in different terms, or the source ` +
  `documents have not been ingested yet.`;

/** Pulls the slice of the graph that can legitimately answer this question. */
const retrieveContext = async (queryText: string): Promise<RetrievedContext | null> => {
  const matched = await searchNodes(queryText, 18);
  if (matched.length === 0) return null;

  const { nodes, edges } = await getRelatedSubgraph(matched.map((n: { id: string }) => n.id));
  const allEvidence = await getEvidence();

  const nodeIds = new Set(nodes.map((n: { id: string }) => n.id));
  const wantedEvidenceIds = new Set(
    nodes.map((n: { evidenceId?: string }) => n.evidenceId).filter(Boolean) as string[]
  );

  // Evidence tied to a direct hit outranks evidence tied to a mere neighbour.
  const matchedIds = new Set(matched.map((n: { id: string }) => n.id));

  const citations: Citation[] = allEvidence
    .filter((e: { id: string; relatedDecisionId?: string }) =>
      wantedEvidenceIds.has(e.id) || (e.relatedDecisionId ? nodeIds.has(e.relatedDecisionId) : false))
    .sort((a: { relatedDecisionId?: string }, b: { relatedDecisionId?: string }) => {
      const aDirect = a.relatedDecisionId && matchedIds.has(a.relatedDecisionId) ? 0 : 1;
      const bDirect = b.relatedDecisionId && matchedIds.has(b.relatedDecisionId) ? 0 : 1;
      return aDirect - bDirect;
    })
    .slice(0, 6)
    .map((e: Record<string, string>, i: number) => ({
      id: `CIT-${i + 1}`,
      docTitle: e.title,
      docType: e.type,
      snippet: e.highlightSnippet,
      author: e.author,
      date: e.date,
      hash: e.hash,
      nodeId: e.relatedDecisionId || undefined,
      evidenceId: e.id,
      refLabel: `[Ref ${i + 1}]`
    }));

  // Compact context — only the fields that can ground an answer.
  const lines: string[] = ['RETRIEVED INSTITUTIONAL RECORDS (the ONLY permitted source):', ''];

  matched.slice(0, 12).forEach((n: Record<string, unknown>) => {
    lines.push(
      `- [${n.id}] (${n.type}) ${n.label}` +
      (n.status ? ` — status: ${n.status}` : '') +
      (n.date ? ` — ${n.date}` : '') +
      (n.owner ? ` — owner: ${n.owner}` : '')
    );
    if (n.description) lines.push(`    summary: ${n.description}`);
    if (n.rationale) lines.push(`    rationale: ${n.rationale}`);
  });

  lines.push('', 'RELATIONSHIPS:');
  edges.slice(0, 40).forEach((e: Record<string, unknown>) => {
    lines.push(`- ${e.source} —[${e.label}]→ ${e.target}${e.description ? ` (${e.description})` : ''}`);
  });

  if (citations.length) {
    lines.push('', 'SUPPORTING DOCUMENTS (cite these by their [Ref n] label):');
    citations.forEach(c => {
      lines.push(`- ${c.refLabel} ${c.docTitle} — ${c.author}, ${c.date}: "${c.snippet}"`);
    });
  }

  return { matched, nodes, edges, citations, contextText: lines.join('\n') };
};

/**
 * Composes a grounded answer directly from retrieved records when the LLM is
 * unavailable. This is a summary of what was actually retrieved — never an
 * invented narrative — so the "no hallucination" guarantee still holds.
 */
const buildRetrievalOnlyAnswer = (queryText: string, ctx: RetrievedContext): { text: string; meta: AnswerMeta } => {
  // Lead with the best-ranked direct hit; neighbours are context, not the answer.
  const rankedDecisions = ctx.matched.filter((n: Record<string, unknown>) => n.type === 'decision');
  const primary = (rankedDecisions[0] || ctx.matched[0]) as Record<string, unknown> | undefined;

  const primaryId = primary?.id;
  const decisions = ctx.nodes.filter(
    (n: Record<string, unknown>) => n.type === 'decision' && n.id !== primaryId
  );
  const people = ctx.matched.filter((n: Record<string, unknown>) => n.type === 'person');

  if (!primary) {
    return {
      text: NO_EVIDENCE_TEXT(queryText),
      meta: {
        citations: [], confidenceScore: 8, confidenceLevel: 'not_found',
        graphFocusNodes: [], degraded: true,
        fallbackReason: 'No records retrieved for this query.'
      }
    };
  }

  const parts: string[] = [];
  parts.push(
    `**Answering from retrieved records only** — the language model is unavailable, so this is a ` +
    `direct summary of what the graph holds, not a generated narrative.\n`
  );

  parts.push(`**${primary.label}** (\`${primary.id}\`)${primary.status ? ` — status: ${primary.status}` : ''}`);
  if (primary.description) parts.push(`\n${primary.description}`);
  if (primary.rationale) parts.push(`\n**Recorded rationale:** ${primary.rationale}`);
  if (primary.owner) parts.push(`\n**Accountable owner:** ${primary.owner}`);

  if (decisions.length > 0) {
    parts.push(`\n**Connected decisions (${decisions.length}):**`);
    decisions.slice(0, 5).forEach((d: Record<string, unknown>) => {
      parts.push(`- ${d.label} (\`${d.id}\`)${d.status ? ` — ${d.status}` : ''}`);
    });
  }

  if (people.length) {
    parts.push(`\n**People linked to these records:** ${people.map((p: Record<string, unknown>) => `${p.label} (${p.subtitle})`).join(', ')}`);
  }

  const score = ctx.citations.length >= 2 ? 74 : ctx.citations.length === 1 ? 62 : 45;

  return {
    text: parts.join('\n'),
    meta: {
      citations: ctx.citations,
      confidenceScore: score,
      confidenceLevel: score >= 70 ? 'weak' : 'weak',
      graphFocusNodes: ctx.nodes.slice(0, 8).map((n: Record<string, unknown>) => String(n.id)),
      degraded: true,
      fallbackReason: 'Answer composed directly from retrieved records; no language model was available.'
    }
  };
};

// ------------------------------------------------------------
// Handler
// ------------------------------------------------------------

export const POST = async (request: Request) => {
  const url = new URL(request.url);
  const isStream = url.searchParams.get('stream') === 'true';

  let messages: { role: string; content: string }[];
  try {
    const body = await request.json();
    messages = body?.messages;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  // Auth is optional; unauthenticated callers get a rate-limited guest session.
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const isAuthenticated = token ? Boolean(verifyToken(token)) : false;

  if (!isAuthenticated) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkGuestRateLimit(ip)) {
      const meta: AnswerMeta = {
        citations: [], confidenceScore: 0, confidenceLevel: 'not_found',
        graphFocusNodes: [], degraded: true,
        fallbackReason: 'Guest query limit reached for this hour. Sign in for unlimited access.'
      };
      const text = 'Guest query limit reached for this hour. Sign in to continue querying institutional memory.';
      return isStream ? streamAnswer(text, meta) : NextResponse.json({ role: 'assistant', content: text, ...meta });
    }
  }

  // ---- Retrieval ----
  let ctx: RetrievedContext | null = null;
  try {
    ctx = await retrieveContext(lastUserMessage);
  } catch (err) {
    console.error('Chat API: retrieval failed', err);
  }

  if (!ctx) {
    const meta: AnswerMeta = {
      citations: [], confidenceScore: 8, confidenceLevel: 'not_found',
      graphFocusNodes: [], degraded: false,
      fallbackReason: `Confidence gate: no institutional records connected to "${lastUserMessage}".`
    };
    const text = NO_EVIDENCE_TEXT(lastUserMessage);
    return isStream ? streamAnswer(text, meta) : NextResponse.json({ role: 'assistant', content: text, ...meta });
  }

  const focusNodes = ctx.nodes.slice(0, 8).map((n: Record<string, unknown>) => String(n.id));

  // ---- No model available: answer from retrieval alone ----
  if (!process.env.OPENAI_API_KEY) {
    const { text, meta } = buildRetrievalOnlyAnswer(lastUserMessage, ctx);
    return isStream ? streamAnswer(text, meta) : NextResponse.json({ role: 'assistant', content: text, ...meta });
  }

  // ---- Grounded generation ----
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt =
      `You are ALETHEIA's "Why Chat". You answer questions about an organisation's decisions using ` +
      `ONLY the retrieved institutional records below.\n\n${ctx.contextText}\n\n` +
      `RULES:\n` +
      `1. Never invent facts, names, dates, or numbers that are not in the records above.\n` +
      `2. Cite supporting documents inline using their [Ref n] labels.\n` +
      `3. Name the specific record ids (e.g. DEC-...) that ground each claim.\n` +
      `4. If the records do not actually answer the question, say so plainly and explain what is missing.\n` +
      `5. Be concise and precise. No marketing language.`;

    const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }) as OpenAI.Chat.ChatCompletionMessageParam)
    ];

    if (isStream) {
      let stream;
      try {
        stream = await openai.chat.completions.create({
          model: 'gpt-4o-mini', messages: openAiMessages, stream: true, temperature: 0.1
        });
      } catch (err) {
        console.error('Chat API: OpenAI unavailable — answering from retrieval', err);
        const { text, meta } = buildRetrievalOnlyAnswer(lastUserMessage, ctx);
        return streamAnswer(text, meta);
      }

      const retrieved = ctx;
      const readable = new ReadableStream({
        async start(controller) {
          try {
            let fullText = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                controller.enqueue(sseEvent({ content }));
              }
            }
            const lowConfidence =
              /not enough evidence|do not have enough|cannot find|no evidence|insufficient|does not answer|not recorded/i
                .test(fullText);
            controller.enqueue(sseEvent({
              meta: true,
              citations: retrieved.citations,
              confidenceScore: lowConfidence ? 22 : retrieved.citations.length >= 2 ? 92 : 78,
              confidenceLevel: lowConfidence ? 'not_found' : 'strong',
              graphFocusNodes: focusNodes,
              degraded: false
            }));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (err) {
            console.error('Chat API: stream interrupted — falling back to retrieval', err);
            const { text, meta } = buildRetrievalOnlyAnswer(lastUserMessage, retrieved);
            controller.enqueue(sseEvent({ content: text }));
            controller.enqueue(sseEvent({ meta: true, ...meta }));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } finally {
            controller.close();
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive'
        }
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', messages: openAiMessages, temperature: 0.1
    });
    return NextResponse.json({
      role: 'assistant',
      content: response.choices[0]?.message?.content,
      citations: ctx.citations,
      confidenceScore: ctx.citations.length >= 2 ? 92 : 78,
      confidenceLevel: 'strong',
      graphFocusNodes: focusNodes,
      degraded: false
    });
  } catch (error) {
    console.error('Chat API error — answering from retrieval:', error);
    const { text, meta } = buildRetrievalOnlyAnswer(lastUserMessage, ctx);
    return isStream ? streamAnswer(text, meta) : NextResponse.json({ role: 'assistant', content: text, ...meta });
  }
};
