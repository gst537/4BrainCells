'use client';

import { useState } from 'react';
import { Send, AlertTriangle, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  isLowConfidence?: boolean;
}

export default function WhyChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello. I can help you trace decisions using our curated graph ledger. Ask me why a decision was made.',
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setInput('');
    setIsLoading(true);

    const newMessages = [...messages, { role: 'user' as const, content: userQuery }];

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.error) {
          setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
        } else {
          setMessages((prev) => [...prev, data as Message]);
        }
      })
      .catch(() => {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'A network error occurred.' }]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            &quot;Why&quot; Chat
          </h2>
          <p className="text-xs text-slate-500">Ask about any decision in the ledger.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : msg.isLowConfidence 
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}
            >
              {msg.isLowConfidence && (
                <div className="flex items-center gap-2 mb-1 text-amber-600 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3" />
                  Low Confidence Fallback
                </div>
              )}
              {msg.content}
            </div>
            
            {msg.citations && (
              <div className="mt-1 flex flex-wrap gap-1">
                {msg.citations.map((cite, i) => (
                  <span key={i} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    Source: {cite}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-2 text-sm animate-pulse">
              Tracing graph connections...
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Why was Project Titan delayed?"
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
