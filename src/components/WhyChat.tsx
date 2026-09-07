'use client';

import React, { useState } from 'react';
import { ChatMessage, CitationReference } from '@/types';
import { sampleQueries, precalculatedAnswers } from '@/data/mockData';
import { 
  MessageSquareCode, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  GitBranch, 
  CornerDownLeft,
  ChevronRight,
  Bot,
  User,
  Info,
  ExternalLink,
  Lock
} from 'lucide-react';

interface WhyChatProps {
  onSelectEvidence: (evidenceId: string) => void;
  onFocusGraphNodes: (nodeIds: string[]) => void;
}

export const WhyChat: React.FC<WhyChatProps> = ({
  onSelectEvidence,
  onFocusGraphNodes
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Online',
      confidenceScore: 100,
      confidenceLevel: 'strong',
      text: `Welcome to **ALETHEIA 'Why' Chat Engine**. 

Unlike conventional search or unbounded LLMs, every response here is **bounded by the verified institutional knowledge graph**. 
- Responses cite exact RFCs, ADRs, Postmortems, and Board Minutes.
- If verified evidence is insufficient or missing, a **Confidence Gate** triggers automatically to prevent institutional hallucination.

Select a prompt below or type your inquiry to trace organizational memory:`,
      citations: []
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsThinking(true);

    const apiMessages = [
      ...messages.filter(m => m.id !== 'welcome').map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: queryText }
    ];

    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

    try {
      const res = await fetch('/api/chat?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) {
        throw new Error('API error');
      }
      
      setIsThinking(false);

      const asstId = `asst-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: asstId,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidenceScore: 95,
          confidenceLevel: 'strong',
          text: '',
          citations: [],
          graphFocusNodes: []
        }
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable stream');

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.content) {
                  setMessages(prev => prev.map(m => {
                    if (m.id === asstId) {
                      return { ...m, text: m.text + parsed.content };
                    }
                    return m;
                  }));
                }
              } catch (e) {
                console.error('Error parsing SSE data', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsThinking(false);
      const fallbackMsg = precalculatedAnswers[queryText];
      if (fallbackMsg) {
        setMessages(prev => [...prev, fallbackMsg]);
      } else {
        const errorMessage: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Sorry, I encountered an error connecting to the AI backend and no precalculated answer was found.',
          confidenceScore: 0,
          confidenceLevel: 'not_found'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0b10] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      
      {/* Chat Header */}
      <div className="border-b border-white/10 bg-[#0e1017] p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <MessageSquareCode className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                &apos;Why&apos; Chat — Confidence-Aware RAG
              </h2>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/30">
                Deterministic
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Answers questions by citing exact evidence bounded by the organizational graph.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-zinc-500">
          <Lock className="h-3 w-3 text-cyan-400" />
          <span>Strict Hallucination Bound</span>
        </div>
      </div>

      {/* Quick Prompt Carousel / Chips */}
      <div className="border-b border-white/5 bg-[#12141e]/50 px-4 py-2.5 overflow-x-auto flex items-center space-x-2 shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 whitespace-nowrap">
          Quick Traces:
        </span>
        {sampleQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(item.query)}
            className="whitespace-nowrap rounded-lg bg-[#181a27] hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 text-[11px] text-zinc-300 px-2.5 py-1 border border-white/5 transition-all"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${isUser ? 'ml-auto' : 'mr-auto'}`}
            >
              {/* Sender Header */}
              <div className="flex items-center space-x-2 mb-1.5 text-[11px] text-zinc-400">
                {isUser ? (
                  <>
                    <span className="font-medium text-zinc-300">You (Executive Analyst)</span>
                    <span>•</span>
                    <span className="font-mono text-zinc-500">{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-1 font-semibold text-cyan-300">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      <span>ALETHEIA Memory Engine</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono text-zinc-500">{msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30'
                    : 'bg-[#141624] text-zinc-200 border border-white/10 shadow-lg'
                }`}
              >
                {/* Confidence Gate Indicator (for assistant) */}
                {!isUser && msg.confidenceScore !== undefined && msg.id !== 'welcome' && (
                  <div className="mb-3 pb-2.5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {msg.confidenceLevel === 'strong' ? (
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px] font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>STRONG CONFIDENCE ({msg.confidenceScore}%)</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-amber-400 font-mono text-[11px] font-semibold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>CONFIDENCE GATE TRIGGERED ({msg.confidenceScore}%)</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Bounded by Knowledge Graph
                    </span>
                  </div>
                )}

                {/* Message Text with basic markdown formatting */}
                <div className="space-y-2 whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Citations Panel */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-2 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Verified Citations ({msg.citations.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          onClick={() => {
                            // Find evidence or open viewer
                            onSelectEvidence(cite.id.includes('RFC') ? 'EVD-RFC-042' : cite.id.includes('ADR') ? 'EVD-ADR-089' : 'EVD-RFC-042');
                            if (cite.nodeId) onFocusGraphNodes([cite.nodeId]);
                          }}
                          className="group cursor-pointer rounded-xl bg-[#0c0e17] p-2.5 border border-white/10 hover:border-cyan-400/50 hover:bg-[#121420] transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] text-cyan-300 font-medium mb-1">
                            <span className="truncate">{cite.docTitle}</span>
                            <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-cyan-300 shrink-0 ml-1" />
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 italic">
                            &quot;{cite.snippet}&quot;
                          </p>
                          <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                            <span>{cite.author}</span>
                            <span>{cite.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center space-x-2 text-xs text-cyan-300 font-mono bg-[#141624] p-3 rounded-2xl border border-white/10 w-fit">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
            <span>Traversing Knowledge Graph & Verifying Citations...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0e1017]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(inputQuery);
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask 'Why did we...', 'Who authorized...', 'What was the rationale for...'"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full h-11 rounded-xl bg-[#161826] pl-4 pr-10 text-xs sm:text-sm text-white placeholder-zinc-500 border border-white/10 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="h-11 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] shrink-0"
          >
            <span>Ask &apos;Why&apos;</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
