import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getGraph } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';
import { mockNodes, mockEdges, findOfflineAnswer } from '../../../data/mockData';
import { ChatMessage } from '../../../types';

// Simple in-memory sliding-window limiter for unauthenticated (guest) demo access.
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

const encoder = new TextEncoder();

const sseEvent = (data: unknown) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

// Streams a precalculated/offline ChatMessage using the same SSE shape as the
// live OpenAI path, so the client never has to special-case a "degraded" mode.
const streamOfflineAnswer = (answer: ChatMessage) => {
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(sseEvent({ content: answer.text }));
      controller.enqueue(
        sseEvent({
          meta: true,
          citations: answer.citations || [],
          confidenceScore: answer.confidenceScore ?? 0,
          confidenceLevel: answer.confidenceLevel ?? 'not_found',
          graphFocusNodes: answer.graphFocusNodes || [],
          fallbackReason: answer.fallbackReason,
          degraded: true
        })
      );
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};

export const POST = async (request: Request) => {
  const url = new URL(request.url);
  const isStream = url.searchParams.get('stream') === 'true';

  let messages: any[];
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

  // Auth is optional: authenticated users bypass the guest rate limit, but a
  // missing/expired token degrades to a rate-limited guest session instead of
  // rejecting the request outright.
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const isAuthenticated = token ? Boolean(verifyToken(token)) : false;

  if (!isAuthenticated) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkGuestRateLimit(ip)) {
      const limitMsg = findOfflineAnswer(lastUserMessage);
      limitMsg.fallbackReason = 'Guest query limit reached for this hour. Sign in for unlimited access.';
      return isStream
        ? streamOfflineAnswer(limitMsg)
        : NextResponse.json({
            role: 'assistant',
            content: limitMsg.text,
            citations: limitMsg.citations,
            confidenceScore: limitMsg.confidenceScore,
            confidenceLevel: limitMsg.confidenceLevel,
            degraded: true
          });
    }
  }

  // Try to build live graph context from Postgres; fall back to bundled mock
  // data if the DB is unreachable so the demo never hard-fails.
  let nodes = mockNodes;
  let edges = mockEdges;
  let dbAvailable = true;
  try {
    const graphData = await getGraph();
    if (graphData?.nodes?.length) {
      nodes = graphData.nodes as any;
      edges = graphData.edges as any;
    }
  } catch (err) {
    dbAvailable = false;
    console.warn('Chat API: DB unavailable, using bundled mock graph', err);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('Chat API: OPENAI_API_KEY missing, using offline fallback');
    const answer = findOfflineAnswer(lastUserMessage);
    return isStream ? streamOfflineAnswer(answer) : NextResponse.json({
      role: 'assistant',
      content: answer.text,
      citations: answer.citations,
      confidenceScore: answer.confidenceScore,
      confidenceLevel: answer.confidenceLevel,
      degraded: true
    });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let graphContext = 'INSTITUTIONAL MEMORY GRAPH CONTEXT:\n\n';
    graphContext += 'NODES (Entities, Documents, Decisions):\n';
    nodes.forEach((node: any) => {
      graphContext += `- ID: ${node.id} | Type: ${node.type} | Data: ${JSON.stringify(node)}\n`;
    });
    graphContext += '\nEDGES (Relationships):\n';
    edges.forEach((edge: any) => {
      graphContext += `- ${edge.source} -> [${edge.label}] -> ${edge.target}\n`;
    });

    const systemPrompt = `You are the "Why Chat", an AI assistant for an organization's Institutional Memory Graph.
Your sole purpose is to answer user questions about decisions, documents, and people using ONLY the provided graph context.

${graphContext}

RULES:
1. You MUST NOT hallucinate or guess. If you do not have enough evidence, state that clearly.
2. If you find the answer, explicitly mention the node labels you used.${!dbAvailable ? '\n3. Note: live database is unreachable; you are reasoning over a cached snapshot of the graph.' : ''}`;

    const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    if (isStream) {
      let stream;
      try {
        stream = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: openAiMessages,
          stream: true,
          temperature: 0.1
        });
      } catch (err) {
        console.error('Chat API: OpenAI stream call failed, using offline fallback', err);
        return streamOfflineAnswer(findOfflineAnswer(lastUserMessage));
      }

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
            const isLowConfidence = /not enough evidence|cannot find|no evidence|insufficient|do not have enough/i.test(fullText);
            controller.enqueue(
              sseEvent({
                meta: true,
                citations: [],
                confidenceScore: isLowConfidence ? 15 : 90,
                confidenceLevel: isLowConfidence ? 'not_found' : 'strong',
                graphFocusNodes: [],
                degraded: false
              })
            );
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (err) {
            console.error('Chat API: stream interrupted, sending offline fallback event', err);
            const answer = findOfflineAnswer(lastUserMessage);
            controller.enqueue(sseEvent({ content: answer.text }));
            controller.enqueue(
              sseEvent({
                meta: true,
                citations: answer.citations || [],
                confidenceScore: answer.confidenceScore ?? 0,
                confidenceLevel: answer.confidenceLevel ?? 'not_found',
                graphFocusNodes: answer.graphFocusNodes || [],
                fallbackReason: answer.fallbackReason,
                degraded: true
              })
            );
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
          'Connection': 'keep-alive'
        }
      });
    } else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: openAiMessages,
        temperature: 0.1
      });

      return NextResponse.json({
        role: 'assistant',
        content: response.choices[0]?.message?.content,
        citations: [],
        isLowConfidence: false
      });
    }
  } catch (error: any) {
    console.error('Chat API Error, degrading to offline fallback:', error);
    const answer = findOfflineAnswer(lastUserMessage);
    if (isStream) {
      return streamOfflineAnswer(answer);
    }
    return NextResponse.json({
      role: 'assistant',
      content: answer.text,
      citations: answer.citations,
      confidenceScore: answer.confidenceScore,
      confidenceLevel: answer.confidenceLevel,
      degraded: true
    });
  }
};
