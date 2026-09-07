import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getGraph } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';


const postHandler = async (request: Request) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API Key is missing' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Parse stream parameter from URL
    const url = new URL(request.url);
    const isStream = url.searchParams.get('stream') === 'true';

    // Fetch the graph from the DB
    const graphData = await getGraph();
    let graphContext = 'INSTITUTIONAL MEMORY GRAPH CONTEXT:\n\n';
    graphContext += 'NODES (Entities, Documents, Decisions):\n';
    graphData.nodes.forEach(node => {
      graphContext += `- ID: ${node.id} | Type: ${node.type} | Data: ${JSON.stringify(node)}\n`;
    });
    graphContext += '\nEDGES (Relationships):\n';
    graphData.edges.forEach(edge => {
      graphContext += `- ${edge.source} -> [${edge.label}] -> ${edge.target}\n`;
    });

    const systemPrompt = `You are the "Why Chat", an AI assistant for an organization's Institutional Memory Graph.
Your sole purpose is to answer user questions about decisions, documents, and people using ONLY the provided graph context.

${graphContext}

RULES:
1. You MUST NOT hallucinate or guess. If you do not have enough evidence, state that clearly.
2. If you find the answer, explicitly mention the node labels you used.`;

    const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    if (isStream) {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: openAiMessages,
        stream: true,
        temperature: 0.1,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming fallback
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: openAiMessages,
        temperature: 0.1,
      });

      return NextResponse.json({
        role: 'assistant',
        content: response.choices[0]?.message?.content,
        citations: [],
        isLowConfidence: false,
      });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process chat' }, { status: 500 });
  }
};

export const POST = requireAuth(postHandler);
