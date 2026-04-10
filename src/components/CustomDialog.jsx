import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';

export default function CustomDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type = 'alert', // 'alert', 'confirm', 'delete'
  title, 
  message, 
  confirmText, 
  cancelText 
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const themes = {
    alert: {
      icon: <Info className="text-primary-500" size={32} />,
      btnColor: 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20',
    },
    confirm: {
      icon: <CheckCircle className="text-emerald-500" size={32} />,
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20',
    },
    delete: {
      icon: <Trash2 className="text-red-500" size={32} />,
      btnColor: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
    },
    error: {
      icon: <AlertTriangle className="text-amber-500" size={32} />,
      btnColor: 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 shadow-slate-500/20',
    }
  };

  const currentTheme = themes[type] || themes.alert;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
        onClick={type === 'alert' ? onClose : undefined}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm liquid-glass rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="mb-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-3xl shadow-inner border border-white/20 dark:border-slate-700/30">
            {currentTheme.icon}
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {title || (type === 'delete' ? t('delete') : t('appTitle'))}
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 px-2">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            {(type === 'confirm' || type === 'delete') && (
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                {cancelText || t('cancel')}
              </button>
            )}
            
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-[0.98] ${currentTheme.btnColor}`}
            >
              {confirmText || (type === 'alert' ? 'OK' : t('save'))}
            </button>
          </div>
        </div>

        {/* Close Button x */}
        {type === 'alert' && (
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
           >
             <X size={20} />
           </button>
        )}
      </div>
    </div>
  );
}
