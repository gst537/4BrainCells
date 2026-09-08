'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GitBranch, Lock, ArrowRight, Activity, Users, Shield, Eye } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const executeLogin = async (loginUser: string, loginPass: string) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(username, password);
  };

  return (
    <div className="w-full flex-1 min-h-screen flex items-center justify-center bg-[#101010] relative p-4 select-none">
      
      <div className="relative w-full max-w-md z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-[#101010] border border-[#333333] rounded-xl flex items-center justify-center mb-4">
            <GitBranch className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Aletheia</h1>
          <p className="text-[#888888] text-sm">Institutional Memory & Decision Traceability</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#101010] border border-[#333333] rounded-xl p-6 shadow-xl">
          
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-[#333333]">
            <Lock className="h-4 w-4 text-[#888888]" />
            <h2 className="text-sm font-medium text-[#888888] tracking-wide">SECURE ACCESS</h2>
          </div>

          {/* Quick Login Section (Demo) */}
          <div className="mb-6">
            <label className="block text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-2">
              Demo Access (Hackathon)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => executeLogin('admin', 'admin')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center py-3 bg-[#101010] border border-[#333333] rounded-lg hover:border-white/40 transition-colors disabled:opacity-50"
              >
                <Shield className="h-4 w-4 text-cyan-400 mb-1" />
                <span className="text-[10px] font-medium text-white uppercase tracking-wider">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => executeLogin('contributor', 'admin')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center py-3 bg-[#101010] border border-[#333333] rounded-lg hover:border-white/40 transition-colors disabled:opacity-50"
              >
                <Users className="h-4 w-4 text-blue-400 mb-1" />
                <span className="text-[10px] font-medium text-white uppercase tracking-wider">Editor</span>
              </button>
              <button
                type="button"
                onClick={() => executeLogin('viewer', 'admin')}
                disabled={isLoading}
                className="flex flex-col items-center justify-center py-3 bg-[#101010] border border-[#333333] rounded-lg hover:border-white/40 transition-colors disabled:opacity-50"
              >
                <Eye className="h-4 w-4 text-zinc-400 mb-1" />
                <span className="text-[10px] font-medium text-white uppercase tracking-wider">Viewer</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 h-px bg-[#333333]"></div>
            <span className="text-xs font-mono text-[#555555] uppercase tracking-wider">OR MANUAL ENTRY</span>
            <div className="flex-1 h-px bg-[#333333]"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                Operator ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full h-10 bg-[#101010] border border-[#333333] rounded-lg px-3 text-sm text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-[#555555]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                Passkey
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full h-10 bg-[#101010] border border-[#333333] rounded-lg px-3 text-sm text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-[#555555]"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-white text-black font-semibold text-sm rounded-lg flex items-center justify-center space-x-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Memory Vault</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

// Simple icon for error
const AlertCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
