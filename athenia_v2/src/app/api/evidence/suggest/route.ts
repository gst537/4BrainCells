import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAuth } from '../../../../lib/auth';

interface Suggestion {
  id: string;
  kind: 'person' | 'document' | 'decision';
  label: string;
  snippet: string;
  confidence: number;
}

// Heuristic fallback used when OpenAI is unavailable or fails — never blocks
// the upload flow, just produces a lower-confidence single suggestion for
// the document itself so the user still has something to review/confirm.
const heuristicFallback = (title: string, docType: string): { summary: string; suggestions: Suggestion[]; degraded: true } => ({
  summary: `Automatic entity extraction is unavailable right now. "${title}" was hashed and can be added to the vault as-is; review its content manually before linking it to graph nodes.`,
  suggestions: [
    {
      id: 'sugg-doc-1',
      kind: 'document',
      label: title,
      snippet: `Uploaded ${docType} document — no AI-suggested entities available.`,
      confidence: 30
    }
  ],
  degraded: true
});

const postHandler = async (request: Request) => {
  let title = 'Untitled Document';
  let docType = 'text';

  try {
    const body = await request.json();
    title = body.title || title;
    docType = body.docType || docType;
    const content: string = body.content || '';

    if (!content.trim()) {
      return NextResponse.json(heuristicFallback(title, docType));
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(heuristicFallback(title, docType));
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are helping populate an institutional memory knowledge graph from an uploaded document.
Read the document below and suggest CANDIDATE entities that a human should review before they are added to the graph.
Do not invent facts not present in the text.

Return strict JSON: { "summary": string, "suggestions": [ { "kind": "person"|"document"|"decision", "label": string, "snippet": string } ] }
- "person": a named individual who appears to have authored, approved, or is otherwise responsible for something in the document.
- "decision": a specific decision, choice, or approved course of action described in the document.
- "document" (at most 1): the document itself as a source-of-record entity.
- "snippet": a short supporting quote (<=200 chars) copied from the document text that justifies the suggestion.
- Suggest at most 8 entities total. If nothing qualifies, return an empty suggestions array.

DOCUMENT TITLE: ${title}
DOCUMENT CONTENT:
${content.slice(0, 12000)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return NextResponse.json(heuristicFallback(title, docType));

    const parsed = JSON.parse(raw);
    const suggestions: Suggestion[] = (parsed.suggestions || []).slice(0, 8).map((s: any, i: number) => ({
      id: `sugg-${i + 1}`,
      kind: ['person', 'document', 'decision'].includes(s.kind) ? s.kind : 'document',
      label: String(s.label || 'Untitled').slice(0, 120),
      snippet: String(s.snippet || '').slice(0, 300),
      confidence: 70
    }));

    return NextResponse.json({
      summary: parsed.summary || `Extracted ${suggestions.length} candidate entities from "${title}".`,
      suggestions,
      degraded: false
    });
  } catch (error) {
    console.error('Evidence suggest API failed, using heuristic fallback:', error);
    return NextResponse.json(heuristicFallback(title, docType));
  }
};

export const POST = requireAuth(postHandler);
