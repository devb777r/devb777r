import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login({ onClose, isGate = false }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(t('invalidCredentials'));
      setLoading(false);
    } else {
      if (!isGate) onClose();
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center w-full ${isGate ? 'min-h-screen px-6' : 'p-8'}`}>

      {/* Logo + Brand */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-3xl bg-primary-500/20 blur-2xl scale-150" />
          <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 p-5 rounded-3xl shadow-2xl shadow-primary-500/40 ring-4 ring-white/10">
            <LogIn size={36} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
          {i18n.language === 'ar' ? 'مستودع العطور' : 'Perfume Storage'}
        </h1>
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
          {i18n.language === 'ar' ? 'سجّل الدخول للمتابعة' : 'Sign in to continue'}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 p-8">

        {error && (
          <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-3.5 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
              {t('email')}
            </label>
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
              <input
                type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
              {t('password')}
            </label>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
              <input
                type="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl py-4 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 disabled:opacity-60 text-white font-black py-4 rounded-3xl shadow-xl shadow-primary-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                {t('login')}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-400 dark:text-slate-600 font-medium tracking-wide">
        {i18n.language === 'ar' ? 'شركة الحرمين © 2025' : 'Al-Haramain Co. © 2025'}
      </p>
    </div>
  );

  if (isGate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950 flex items-center justify-center animate-in fade-in duration-500">
        {/* Decorative blobs */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {content}
      </div>
    </div>
  );
}
