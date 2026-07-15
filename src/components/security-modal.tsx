'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, KeyRound, Mail, Save } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(localStorage.getItem('store_auth_email') || 'admin@store.com');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    localStorage.setItem('store_auth_email', email.trim().toLowerCase());
    if (password) {
      localStorage.setItem('store_auth_password', password);
    }
    
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      {/* Backdrop clickable Area */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="w-full max-h-[92vh] sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-150 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Security Credentials</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/40">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs font-semibold text-emerald-605 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-955/20 p-3.5 rounded-2xl border border-emerald-250 dark:border-emerald-900/40">
              Credentials updated successfully! Closing settings...
            </p>
          )}

          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Access Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="border-t border-zinc-150 dark:border-zinc-800 my-4 pt-4">
            <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 leading-relaxed">
              Fill the password fields below only if you wish to change your current access password. Leave them blank to keep it.
            </p>
          </div>

          {/* New Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="Min 6 characters (Leave blank to keep)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-150 dark:border-zinc-805 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-zinc-250 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
