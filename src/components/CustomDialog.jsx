import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';

export default function CustomDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type = 'alert', // 'alert', 'confirm', 'delete', 'error'
  title, 
  message, 
  confirmText, 
  cancelText 
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const themes = {
    alert: {
      icon: <Info className="text-primary-500 animate-success-check" size={40} />,
      btnColor: 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20',
      accent: 'bg-primary-500/10'
    },
    confirm: {
      icon: <CheckCircle className="text-emerald-500 animate-success-check" size={40} />,
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20',
      accent: 'bg-emerald-500/10'
    },
    delete: {
      icon: <Trash2 className="text-red-500 animate-success-check" size={40} />,
      btnColor: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
      accent: 'bg-red-500/10'
    },
    error: {
      icon: <AlertTriangle className="text-amber-500 animate-success-check" size={40} />,
      btnColor: 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 shadow-slate-500/20',
      accent: 'bg-amber-500/10'
    }
  };

  const currentTheme = themes[type] || themes.alert;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop with Fade In */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={type === 'alert' ? onClose : undefined}
      />
      
      {/* Modal Card with Pop In */}
      <div className="relative w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/50 animate-spring-pop overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center relative z-10">
          <div className={`mb-6 p-5 rounded-[2rem] shadow-inner border border-white/40 dark:border-slate-700/50 ${currentTheme.accent}`}>
            {currentTheme.icon}
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            {title || (type === 'delete' ? t('delete') : t('appTitle'))}
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-10 px-2 font-medium">
            {message}
          </p>

          <div className="flex gap-4 w-full">
            {(type === 'confirm' || type === 'delete') && (
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                {cancelText || t('cancel')}
              </button>
            )}
            
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all active:scale-[0.96] ${currentTheme.btnColor}`}
            >
              {confirmText || (
                type === 'alert' || type === 'confirm' ? 'OK' : 
                type === 'delete' ? t('delete') : 
                t('save')
              )}
            </button>
          </div>
        </div>

        {/* Global Close Button for non-critical alerts */}
        {type === 'alert' && (
           <button 
             onClick={onClose}
             className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100/50 dark:bg-slate-800/50 rounded-xl"
           >
             <X size={20} />
           </button>
        )}
      </div>
    </div>
  );
}
