import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit3, Trash2, Weight, ArrowRight, ArrowLeft, Sun, Snowflake, Mars, Venus, VenusAndMars, Factory, Building2, User, UserCheck, Users } from 'lucide-react';

const PerfumeItem = React.memo(({ perfume, viewMode, isAdmin, onEdit, onDelete, index }) => {
  if (!perfume) return null;
  const { t, i18n } = useTranslation();

  if (viewMode === 'list') {
    return (
      <div 
        className="luxury-card-container rounded-3xl p-4 group staggered-item luxury-card-hover"
      >
        {/* Top Row: Info and Arrow Price Badge */}
        <div className={`flex justify-between items-center gap-4 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex flex-col truncate ${i18n.language === 'ar' ? 'items-end text-right' : 'items-start text-left'}`}>
             <h3 className="font-arabic font-bold text-xl text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
              {perfume.name_ar_market || '---'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">EN: {perfume.name_en || '---'}</span>
            </div>
          </div>

          <div className={`flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-[1.25rem] border-2 border-primary-500/10 dark:border-primary-400/10 shadow-lg dark:shadow-primary-900/10 shrink-0 touch-active-luxury ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="flex flex-col items-center gap-1">
              <Weight size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter leading-none">1 {t('ml')}</span>
            </div>
            
            {i18n.language === 'ar' ? <ArrowLeft size={18} className="text-primary-500" /> : <ArrowRight size={18} className="text-primary-500" />}
            
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-primary-600/60 uppercase leading-none mb-1">{t('totalPrice')}</span>
              <span className="text-2xl font-black text-primary-600 dark:text-primary-400 leading-none tracking-tighter">${(perfume.price_usd || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Description Row (New for List Mode) */}
        {perfume.description && (
          <div className={`mt-3 px-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-sm text-slate-950 dark:text-white font-bold leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {perfume.description}
            </p>
          </div>
        )}

        {/* Bottom Row: Tags, ID and Actions */}
        <div className={`flex justify-between items-center mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/50 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 flex-wrap ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <span className="flex-shrink-0 flex items-center justify-center h-5 px-2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
              #{perfume.display_id}
            </span>

            {perfume.code && (
              <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-primary-600/10 dark:bg-primary-400/10 text-sm font-black text-primary-700 dark:text-primary-300 border border-primary-500/20 tracking-widest font-mono">
                {perfume.code}
              </span>
            )}
            
            {(perfume.seasons || []).map(s => (
              <span key={s} className={`flex items-center justify-center w-7 h-7 rounded-full border shadow-sm ${
                s === 'summer' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-500' :
                'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-500'
              }`}>
                {s === 'summer' ? <Sun size={14} /> : <Snowflake size={14} />}
              </span>
            ))}
            
            {perfume.gender && (
              <span className={`flex items-center justify-center w-7 h-7 rounded-full border shadow-sm ${
                perfume.gender === 'male' ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600' :
                perfume.gender === 'female' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-500' :
                'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20 text-cyan-600'
              }`}>
                {perfume.gender === 'male' ? <Mars size={14} /> : perfume.gender === 'female' ? <Venus size={14} /> : <VenusAndMars size={14} />}
              </span>
            )}

            <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-primary-500/5 text-[10px] font-black text-primary-600 dark:text-primary-400 border border-primary-500/10 tracking-widest uppercase">
              {perfume.provider === 'EMSA' ? <Factory size={12} className="text-indigo-500" /> : <Building2 size={12} className="text-cyan-500" />}
              {perfume.provider || 'RMI'}
            </span>
          </div>

          {isAdmin && (
            <div className={`flex gap-3 ms-4 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={() => onEdit(perfume)} 
                className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-all touch-active-luxury flex items-center justify-center min-w-[44px] min-h-[44px]"
                aria-label={t('edit')}
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={() => onDelete(perfume.id)} 
                className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all touch-active-luxury flex items-center justify-center min-w-[44px] min-h-[44px]"
                aria-label={t('delete')}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div 
      className="luxury-card-container rounded-[2rem] p-6 group flex flex-col justify-between staggered-item luxury-card-hover h-full"
    >
      <div>
        <div className="flex flex-col gap-4">
          <div className={`flex justify-between items-start ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div>
              <div className={`flex items-center gap-2 mb-1.5 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-primary-500/10 text-[11px] font-black text-primary-600 dark:text-primary-400 border border-primary-500/20">
                  #{perfume.display_id}
                </span>
                <h3 className="font-arabic font-bold text-2xl text-slate-900 dark:text-white leading-tight">
                  {perfume.name_ar_market || '---'}
                </h3>
              </div>
              <div className={`flex flex-wrap gap-2 mt-2 ${i18n.language === 'ar' ? 'justify-end' : ''}`}>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 touch-active-luxury">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">EN</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{perfume.name_en || '---'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">AR</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-arabic">{perfume.name_ar || '---'}</span>
                </div>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => onEdit(perfume)} 
                  className="p-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-700/50 rounded-xl shadow-sm transition-all flex items-center justify-center min-w-[44px] min-h-[44px]"
                  aria-label={t('edit')}
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(perfume.id)} 
                  className="p-3 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/50 rounded-xl shadow-sm transition-all flex items-center justify-center min-w-[44px] min-h-[44px]"
                  aria-label={t('delete')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'justify-end' : ''}`}>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
              {perfume.provider === 'EMSA' ? <Factory size={10} className="text-indigo-500" /> : <Building2 size={10} className="text-cyan-500" />}
              {perfume.provider || 'RMI'}
            </span>
          </div>
          {perfume.description && <p className={`text-sm text-slate-950 dark:text-white font-bold leading-relaxed line-clamp-3 whitespace-pre-wrap mt-3 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{perfume.description}</p>}
        </div>
        <div className="mt-6 mb-6 grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] p-4 border border-slate-100 dark:border-slate-800/60 shadow-inner flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">{t('standardUnit')}</span>
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 shadow-sm">1</div>
               <span className="text-slate-900 dark:text-white font-black text-xl uppercase tracking-tighter">{t('ml')}</span>
            </div>
          </div>
          <div className="bg-primary-600/5 dark:bg-primary-400/5 rounded-[1.5rem] p-4 border border-primary-500/10 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            <span className="text-[10px] uppercase font-black text-primary-600/60 dark:text-primary-400/60 tracking-widest mb-1">{t('totalPrice')}</span>
            <span className="text-3xl font-black text-primary-600 dark:text-primary-400 leading-none">${(perfume.price_usd || 0).toLocaleString()}</span>
          </div>
        </div>
        {perfume.code && (
          <div className={`mb-4 flex items-center gap-3 bg-primary-600/5 dark:bg-primary-400/5 border border-primary-500/10 rounded-[1.25rem] px-5 py-3 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] font-black text-primary-600/50 dark:text-primary-400/50 uppercase tracking-widest shrink-0">{t('perfumeCode')}</span>
            <span className="font-mono font-black text-xl text-primary-700 dark:text-primary-300 tracking-widest">{perfume.code}</span>
          </div>
        )}
      </div>
      <div className={`flex flex-wrap gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
        <div className="flex flex-wrap gap-1.5">
          {(perfume.seasons || []).map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">
              {s === 'summer' ? <Sun size={12} className="text-amber-500" /> : <Snowflake size={12} className="text-blue-500" />}
              {t(s)}
            </span>
          ))}
        </div>
        {perfume.gender && (
          <span className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
            perfume.gender === 'male' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' :
            perfume.gender === 'female' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' :
            'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20'
          }`}>
            {perfume.gender === 'male' ? <User size={12} className="text-indigo-500" /> : perfume.gender === 'female' ? <UserCheck size={12} className="text-rose-500" /> : <Users size={12} className="text-cyan-500" />}
            {t(perfume.gender)}
          </span>
        )}
      </div>
    </div>
  );
});

PerfumeItem.displayName = 'PerfumeItem';

export default PerfumeItem;
