import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Key, ShieldCheck, RefreshCw, Briefcase, Globe } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }
      // Trigger success hook
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network connection error. Ensure backend is online.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = (type: 'admin' | 'manager' | 'executive') => {
    setErrorMsg('');
    if (type === 'admin') {
      setEmail('admin@crm.com');
      setPassword('admin123');
    } else if (type === 'manager') {
      setEmail('manager@crm.com');
      setPassword('manager123');
    } else if (type === 'executive') {
      setEmail('executive@crm.com');
      setPassword('executive123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Immersive glow balls */}
      <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-16 -top-16 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-[#1f2937] p-8 rounded-2xl shadow-2xl space-y-6 relative z-10"
      >
        {/* Brand identity */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xl shadow-blue-600/20 mx-auto text-xl">
            C
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Access Enterprise CRM</h2>
          <p className="text-xs text-gray-400">Premium SaaS Portfolio Management Engine</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-lg text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="email@crm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b1120] border border-[#1f2937] hover:border-gray-600 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Security Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b1120] border border-[#1f2937] hover:border-gray-600 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/15 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Establishing Session...' : 'Authenticate'}</span>
          </button>
        </form>

        {/* Demo Fast Sandbox Autofill Row */}
        <div className="border-t border-[#1f2937] pt-4 space-y-2.5">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block text-center">Fast Demo Access Accounts</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAutofill('admin')}
              className="px-1.5 py-2 bg-[#0b1120] hover:bg-[#1f2937] border border-[#1f2937] text-[10px] font-bold text-gray-300 rounded hover:text-white transition-all cursor-pointer"
            >
              Sarah (Admin)
            </button>
            <button
              onClick={() => handleAutofill('manager')}
              className="px-1.5 py-2 bg-[#0b1120] hover:bg-[#1f2937] border border-[#1f2937] text-[10px] font-bold text-gray-300 rounded hover:text-white transition-all cursor-pointer"
            >
              Marcus (Mgr)
            </button>
            <button
              onClick={() => handleAutofill('executive')}
              className="px-1.5 py-2 bg-[#0b1120] hover:bg-[#1f2937] border border-[#1f2937] text-[10px] font-bold text-gray-300 rounded hover:text-white transition-all cursor-pointer"
            >
              Elena (Exec)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
