import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'graphMock.json');

// Ensure the OpenAI API key is set
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API Key is missing. Please add it to .env.local' },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Load the graph data to use as context
    const graphDataRaw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const graphData = JSON.parse(graphDataRaw);

    // Format the graph data nicely for the LLM
    let graphContext = 'INSTITUTIONAL MEMORY GRAPH CONTEXT:\n\n';
    graphContext += 'NODES (Entities, Documents, Decisions):\n';
    graphData.nodes.forEach((node: Record<string, unknown>) => {
      graphContext += `- ID: ${node.id} | Type: ${node.type} | Data: ${JSON.stringify(node.data)}\n`;
    });
    graphContext += '\nEDGES (Relationships):\n';
    graphData.edges.forEach((edge: Record<string, unknown>) => {
      graphContext += `- ${edge.source} -> [${edge.label}] -> ${edge.target}\n`;
    });

    const systemPrompt = `You are the "Why Chat", an AI assistant for an organization's Institutional Memory Graph.
Your sole purpose is to answer user questions about decisions, documents, and people using ONLY the provided graph context.

${graphContext}

RULES:
1. You MUST NOT hallucinate or guess. If the answer cannot be confidently deduced from the graph context provided above, you must set "isLowConfidence" to true and state that you do not have enough evidence.
2. If you find the answer, you must provide the "citations" array with the precise labels of the nodes you used to answer the question.
3. You must respond in valid JSON matching this schema:
{
  "content": "Your natural language answer",
  "citations": ["Label of Node 1", "Label of Node 2"],
  "isLowConfidence": boolean
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        // Map frontend messages to OpenAI format (excluding citations/flags which the frontend adds to its state)
        ...messages.map((m: Record<string, string>) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const aiMessageStr = response.choices[0]?.message?.content;
    if (!aiMessageStr) {
      throw new Error('No content returned from OpenAI');
    }

    const parsedResponse = JSON.parse(aiMessageStr);

    return NextResponse.json({
      role: 'assistant',
      content: parsedResponse.content,
      citations: parsedResponse.citations || [],
      isLowConfidence: parsedResponse.isLowConfidence || false,
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to process chat';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
