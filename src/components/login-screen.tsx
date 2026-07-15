'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize default credentials if they don't exist yet
    if (!localStorage.getItem('store_auth_email')) {
      localStorage.setItem('store_auth_email', 'admin@store.com');
    }
    if (!localStorage.getItem('store_auth_password')) {
      localStorage.setItem('store_auth_password', 'admin123');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const storedEmail = localStorage.getItem('store_auth_email') || 'admin@store.com';
      const storedPassword = localStorage.getItem('store_auth_password') || 'admin123';

      if (email.trim().toLowerCase() === storedEmail.toLowerCase() && password === storedPassword) {
        localStorage.setItem('store_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid email address or password.');
      }
      setLoading(false);
    }, 600); // Premium animation response delay
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-all duration-300">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse delay-1000"></div>

      {/* Login Card Panel */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 space-y-6 z-10 transition-all duration-300">
        
        {/* Branding header */}
        <div className="text-center space-y-2 select-none">
          <div className="inline-flex items-center justify-center p-4 bg-blue-55 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400 mb-2 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Store Database Access</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Security verification required to unlock catalog logs</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-955/20 border border-rose-250 dark:border-rose-900/50 text-rose-600 dark:text-rose-455 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="e.g. manager@store.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Access Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>Unlock Admin Panel</span>
            )}
          </button>
        </form>

        {/* Demo Helper guide */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-2xl text-center text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed shadow-inner">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">Default Access Credentials:</span>
          <div className="mt-1 flex justify-center gap-3">
            <span>Email: <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-zinc-100 font-mono">admin@store.com</code></span>
            <span>Pass: <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-zinc-100 font-mono">admin123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
