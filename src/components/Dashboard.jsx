import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import { supabase } from '../lib/supabase';
import { Search, Droplets, Trash2, Edit3, Save, X, PackageOpen, List, LayoutGrid, AlignJustify, Sun, Snowflake, Leaf, Flower2, User, UserCheck, Users, Building2, Factory, ArrowRight, ArrowLeft, Weight, Venus, Mars, VenusAndMars, Filter } from 'lucide-react';
import CustomDialog from './CustomDialog';
import PerfumeItem from './PerfumeItem';

export default function Dashboard({ 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode,
  selectedGenders,
  selectedSeasons,
  selectedProviders
}) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const PAGE_SIZE = 50;

  // Form states for ADD / EDIT
  const [formData, setFormData] = useState({
    id: null,
    name_en: '',
    name_ar: '',
    name_ar_market: '',
    price_usd: '',
    total_volume_kg: 1,
    description: '',
    seasons: [],
    gender: 'unisex',
    provider: 'RMI',
    code: ''
  });

  // Dialog state
  const [dialog, setDialog] = useState({ 
    isOpen: false, 
    type: 'alert', 
    title: '', 
    message: '', 
    onConfirm: null 
  });

  const showDialog = (type, message, title = '', onConfirm = null) => {
    setDialog({ isOpen: true, type, message, title, onConfirm });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Fetch Global Count
  const { data: globalCount = 0 } = useQuery({
    queryKey: ['globalCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('perfumes')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count;
    }
  });

  // Fetch Perfumes with Infinite Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['perfumes', searchQuery, selectedGenders, selectedSeasons, selectedProviders],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase.rpc('filter_perfumes', {
        search_text: searchQuery || '',
        gender_list: selectedGenders,
        provider_list: selectedProviders,
        season_list: selectedSeasons,
        page_num: pageParam,
        page_size: PAGE_SIZE
      });
      if (error) throw error;
      
      const resultCount = data.length > 0 ? Number(data[0].total_result_count) : 0;
      return {
        items: data,
        totalCount: resultCount,
        nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const perfumes = useMemo(() => {
    try {
      if (!data?.pages) return [];
      const items = data.pages.flatMap(page => page?.items || []);
      return items.filter(item => item && item.id); // Ensure only valid items
    } catch (e) {
      console.error("Perfumes memo error:", e);
      return [];
    }
  }, [data]);
  
  const totalCount = useMemo(() => {
    try {
      if (!data?.pages || data.pages.length === 0) return 0;
      return Number(data.pages[0]?.totalCount) || 0;
    } catch (e) {
      return perfumes.length || 0;
    }
  }, [data, perfumes.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const savePerfume = async (e) => {
    e.preventDefault();
    const payload = { 
      name_en: formData.name_en, 
      name_ar: formData.name_ar, 
      name_ar_market: formData.name_ar_market,
      price_usd: Number(formData.price_usd) || 0, 
      total_volume_kg: 1,
      description: formData.description,
      seasons: formData.seasons,
      gender: formData.gender,
      provider: formData.provider,
      code: formData.code?.trim() || null
    };

    try {
      if (formData.id) {
        const { error } = await supabase.from('perfumes').update(payload).eq('id', formData.id);
        if (error) throw error;
        showDialog('alert', `${payload.name_ar_market} (#${payload.code || '---'}) ${t('updatedSuccessfully') || (i18n.language === 'ar' ? 'تم التحديث بنجاح' : 'Updated Successfully')}`, t('success'), () => {
          setActiveTab('inventory');
          setFormData({ id: null, name_en: '', name_ar: '', name_ar_market: '', price_usd: '', total_volume_kg: 1, description: '', seasons: [], gender: 'unisex', provider: 'RMI', code: '' });
          if (searchQuery) setSearchQuery(''); 
          queryClient.invalidateQueries({ queryKey: ['perfumes'] });
          queryClient.invalidateQueries({ queryKey: ['globalCount'] });
        });
      } else {
        const { error } = await supabase.from('perfumes').insert([payload]);
        if (error) throw error;
        showDialog('alert', `${payload.name_ar_market} (#${payload.code || '---'}) ${t('addedSuccessfully') || (i18n.language === 'ar' ? 'تمت الإضافة بنجاح' : 'Added Successfully')}`, t('success'), () => {
          setActiveTab('inventory');
          setFormData({ id: null, name_en: '', name_ar: '', name_ar_market: '', price_usd: '', total_volume_kg: 1, description: '', seasons: [], gender: 'unisex', provider: 'RMI', code: '' });
          if (searchQuery) setSearchQuery(''); 
          queryClient.invalidateQueries({ queryKey: ['perfumes'] });
          queryClient.invalidateQueries({ queryKey: ['globalCount'] });
        });
      }
    } catch (err) {
      showDialog('error', `Error saving: ${err.message}`, t('error'));
    }
  };

  const deletePerfume = useCallback(async (id) => {
    showDialog('delete', t('confirmDelete'), t('confirmDeleteTitle') || (i18n.language === 'ar' ? 'حذف العطر' : 'Delete Perfume'), async () => {
      // Optimistic Delete UI part
      // Note: We don't do full optimistic renumbering here as it's complex for infinite lists, 
      // but we remove the item from view. The page will refetch and show correct numbers.
      queryClient.setQueriesData({ queryKey: ['perfumes'] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            items: page.items.filter(item => item.id !== id),
            totalCount: Math.max(0, (page.totalCount || 0) - 1)
          }))
        };
      });

      const { error } = await supabase.rpc('delete_perfume_and_sync', { target_id: id });
      if (error) {
        showDialog('error', `Error deleting: ${error.message}`, t('error'));
        // Rollback
        queryClient.invalidateQueries({ queryKey: ['perfumes'] });
      } else {
        // Refresh to show renumbered items
        queryClient.invalidateQueries({ queryKey: ['perfumes'] });
        queryClient.invalidateQueries({ queryKey: ['globalCount'] });
      }
    });
  }, [queryClient, t, i18n.language]);

  const editPerfume = useCallback((perfume) => {
    setFormData({
      id: perfume.id,
      name_en: perfume.name_en,
      name_ar: perfume.name_ar,
      name_ar_market: perfume.name_ar_market,
      price_usd: perfume.price_usd || '',
      total_volume_kg: perfume.total_volume_kg,
      description: perfume.description || '',
      seasons: perfume.seasons || [],
      gender: perfume.gender || 'unisex',
      provider: perfume.provider || 'RMI',
      code: perfume.code || ''
    });
    setActiveTab('add');
  }, [setActiveTab]);

  const handleSeasonToggle = (season) => {
    setFormData(prev => {
      const seasons = prev.seasons.includes(season)
        ? prev.seasons.filter(s => s !== season)
        : [...prev.seasons, season];
      return { ...prev, seasons };
    });
  };

  const handleGenderSelect = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const handleProviderSelect = (provider) => {
    setFormData(prev => ({ ...prev, provider }));
  };

  // Skeleton Loaders for different view modes
  const ListSkeleton = () => (
    <div className="luxury-card-container rounded-3xl p-5 staggered-item h-[240px]">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-1/2"></div>
        </div>
      </div>
      <div className="h-28 bg-slate-50 dark:bg-slate-800/30 rounded-2xl mb-4"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-slate-100 dark:bg-slate-800/50 rounded-full w-20"></div>
      </div>
    </div>
  );

  const GridSkeleton = () => (
    <div className="luxury-card-container rounded-[2rem] p-6 staggered-item h-[520px] flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3 flex-1">
          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-lg w-[80%]"></div>
          <div className="h-5 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-[60%]"></div>
        </div>
      </div>
      <div className="h-64 bg-slate-50 dark:bg-slate-800/30 rounded-3xl mb-4"></div>
      <div className="mt-auto flex gap-2">
        <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-24"></div>
        <div className="h-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-24 ml-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {activeTab === 'add' ? (
        <div className="animate-slide-view space-y-4 pb-20">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-950 rounded-3xl p-6 overflow-hidden shadow-xl shadow-primary-500/20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white blur-2xl" />
            </div>
            <div className={`relative flex items-center justify-between ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className={i18n.language === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-primary-200 text-xs font-black uppercase tracking-widest mb-1">
                  {formData.id ? t('edit') : t('addPerfume')}
                </p>
                <h2 className="text-white text-2xl font-black leading-tight">
                  {formData.name_ar_market || (i18n.language === 'ar' ? 'عطر جديد' : 'New Perfume')}
                </h2>
                {formData.code && (
                  <span className="inline-block mt-2 font-mono text-sm font-black text-primary-200 bg-white/10 px-3 py-1 rounded-full tracking-widest">
                    {formData.code}
                  </span>
                )}
              </div>
              <button onClick={() => setActiveTab('inventory')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-95">
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={savePerfume} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Identity */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col luxury-card-hover">
                <div className={`flex items-center gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <Droplets size={16} className="text-primary-500" />
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {i18n.language === 'ar' ? 'الهوية' : 'Identity'}
                  </span>
                </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>{t('arabicMarketName')}</label>
                  <input
                    type="text" name="name_ar_market" value={formData.name_ar_market}
                    onChange={handleInputChange} required
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl px-5 py-4 text-xl font-black text-slate-900 dark:text-white font-arabic text-right focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                    placeholder="العنبر الفاخر" dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>{t('englishName')}</label>
                    <input
                      type="text" name="name_en" value={formData.name_en}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                      placeholder="Royal Amber"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 block text-right">{t('arabicRealName')}</label>
                    <input
                      type="text" name="name_ar" value={formData.name_ar}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 font-arabic text-right focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                      placeholder="عنبر ملكي" dir="rtl"
                    />
                  </div>
                </div>
              </div>
            </div>

              {/* Pricing & Code */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col luxury-card-hover">
                <div className={`flex items-center gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <Weight size={16} className="text-primary-500" />
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {i18n.language === 'ar' ? 'السعر والرمز' : 'Pricing & Code'}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-1.5 text-right">
                    <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'block' : 'text-left'}`}>
                      {i18n.language === 'ar' ? 'السعر $ / كجم' : 'Price $ / KG'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 font-black text-lg">$</span>
                      <input
                        type="number" step="0.01" name="price_usd" value={formData.price_usd}
                        onChange={handleInputChange} required
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl pl-9 pr-4 py-4 text-2xl font-black text-primary-600 dark:text-primary-400 focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>{t('perfumeCode')}</label>
                    <input
                      type="text" name="code" value={formData.code}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl px-4 py-4 text-lg font-black font-mono text-slate-800 dark:text-slate-100 focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600 tracking-widest"
                      placeholder="AH-102"
                    />
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden md:col-span-2 lg:col-span-1 luxury-card-hover">
                <div className={`flex items-center gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <Filter size={16} className="text-primary-500" />
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {i18n.language === 'ar' ? 'التصنيف' : 'Classification'}
                  </span>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <label className={`text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>{t('gender')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'male', icon: <Mars size={18} />, label: t('male'), color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30' },
                        { id: 'female', icon: <Venus size={18} />, label: t('female'), color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30' },
                        { id: 'unisex', icon: <VenusAndMars size={18} />, label: t('unisex'), color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/30' }
                      ].map(g => (
                        <button key={g.id} type="button" onClick={() => handleGenderSelect(g.id)}
                          className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-2 transition-all font-bold text-xs ${
                            formData.gender === g.id ? `${g.color} scale-[1.03] shadow-md border-current` : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                          }`}>
                          {g.icon}
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>{t('seasons')}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'summer', icon: <Sun size={18} />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' },
                        { id: 'winter', icon: <Snowflake size={18} />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30' },
                      ].map(s => (
                        <button key={s.id} type="button" onClick={() => handleSeasonToggle(s.id)}
                          className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-2 transition-all font-bold text-xs ${
                            formData.seasons.includes(s.id) ? `${s.color} scale-[1.03] shadow-md border-current` : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                          }`}>
                          {s.icon}
                          {t(s.id)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 md:col-span-2 lg:col-span-1">
                    <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>
                      {i18n.language === 'ar' ? 'المورد' : 'Provider'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'RMI', icon: <Building2 size={18} />, color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-500/30' },
                        { id: 'EMSA', icon: <Factory size={18} />, color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-500/30' }
                      ].map(p => (
                        <button key={p.id} type="button" onClick={() => handleProviderSelect(p.id)}
                          className={`flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 transition-all font-black text-sm ${
                            formData.provider === p.id ? `${p.color} scale-[1.02] shadow-md border-current` : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                          }`}>
                          {p.icon}
                          {p.id}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden md:col-span-2 lg:col-span-3 luxury-card-hover">
                <div className={`flex items-center gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <AlignJustify size={16} className="text-primary-500" />
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {i18n.language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </span>
                </div>
                <div className="p-4">
                  <textarea
                    name="description" value={formData.description}
                    onChange={handleInputChange} rows={3}
                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl px-6 py-4 text-base text-slate-700 dark:text-slate-200 focus:outline-none transition-all resize-none placeholder-slate-300 dark:placeholder-slate-600 shadow-inner ${i18n.language === 'ar' ? 'text-right' : ''}`}
                    placeholder={i18n.language === 'ar' ? 'ملاحظات العطر...' : 'Perfume notes...'}
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-3xl py-5 font-black text-lg shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex justify-center items-center gap-3 touch-active-luxury">
              <Save size={22} />
              {t('save')}
            </button>
          </form>
        </div>
      ) : (
        <div className="animate-slide-view">
          {/* Spacer to account for the sticky header area height when searching */}
          <div className="h-2" />

          {isLoading && perfumes.length === 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {[...Array(6)].map((_, i) => viewMode === 'list' ? <ListSkeleton key={i} /> : <GridSkeleton key={i} />)}
            </div>
          ) : perfumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-4">
              <PackageOpen size={64} className="opacity-20" />
              <p className="font-medium text-lg text-slate-500">{t('noItemsMessage')}</p>
            </div>
          ) : (
            <>
              {/* Luxury Results Badges - Left Aligned */}
              <div className={`flex flex-col gap-2 mb-6 px-2 animate-slide-view ${i18n.language === 'ar' ? 'items-end' : 'items-start'}`}>
                {/* Total Inventory Badge */}
                <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/30 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {i18n.language === 'ar' ? 'إجمالي العطور' : 'Total Inventory'}
                  </span>
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md bg-slate-800 dark:bg-slate-200 text-[10px] font-black text-white dark:text-slate-900">
                    {globalCount}
                  </span>
                </div>

                {/* Filtered Results Badge */}
                {(searchQuery || selectedGenders.length > 0 || selectedSeasons.length > 0 || selectedProviders.length > 0) && (
                  <div className="flex items-center gap-3 bg-white/40 dark:bg-primary-950/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 dark:border-primary-500/20 shadow-xl shadow-primary-500/5">
                    <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-primary-600 dark:bg-primary-500 text-[12px] font-black text-white shadow-lg shadow-primary-500/30">
                      {totalCount}
                    </span>
                    <span className="text-[13px] font-black text-slate-800 dark:text-primary-100 tracking-tight font-arabic">
                      {totalCount === 1 ? 'عطر متوفر حالياً' : 'عطراً متوفرة في النتائج'}
                    </span>
                  </div>
                )}
              </div>

              {/* Virtuoso Implementation */}
              {viewMode === 'list' ? (
                <Virtuoso
                  useWindowScroll
                  className="view-mode-list"
                  data={perfumes}
                  totalCount={Math.min(totalCount, perfumes.length)}
                  overscan={8000}
                  increaseViewportBy={{ top: 8000, bottom: 8000 }}
                  initialItemCount={40}
                  scrollSeekConfiguration={{
                    enter: (velocity) => Math.abs(velocity) > 1000,
                    exit: (velocity) => Math.abs(velocity) < 100
                  }}
                  components={{
                    ScrollSeekPlaceholder: () => (
                      <div className="pb-6">
                        <ListSkeleton />
                      </div>
                    )
                  }}
                  computeItemKey={(index) => index}
                  endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                  itemContent={(index, perfume) => {
                    return (
                      <div className="pb-6">
                        {perfume ? (
                          <PerfumeItem
                            perfume={perfume}
                            viewMode={viewMode}
                            isAdmin={isAdmin}
                            onEdit={editPerfume}
                            onDelete={deletePerfume}
                            index={index}
                          />
                        ) : (
                          <ListSkeleton />
                        )}
                      </div>
                    );
                  }}
                />
              ) : (
                <VirtuosoGrid
                  useWindowScroll
                  className="view-mode-grid"
                  data={perfumes}
                  totalCount={Math.min(totalCount, perfumes.length)}
                  overscan={8000}
                  increaseViewportBy={{ top: 8000, bottom: 8000 }}
                  initialItemCount={40}
                  scrollSeekConfiguration={{
                    enter: (velocity) => Math.abs(velocity) > 1000,
                    exit: (velocity) => Math.abs(velocity) < 100
                  }}
                  components={{
                    ScrollSeekPlaceholder: () => (
                      <GridSkeleton />
                    )
                  }}
                  computeItemKey={(index) => index}
                  endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                  listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
                  itemContent={(index, perfume) => {
                    return perfume ? (
                      <PerfumeItem
                        perfume={perfume}
                        viewMode={viewMode}
                        isAdmin={isAdmin}
                        onEdit={editPerfume}
                        onDelete={deletePerfume}
                        index={index}
                      />
                    ) : (
                      <GridSkeleton />
                    );
                  }}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Sticky Bottom Loader */}
      {isFetchingNextPage && (
        <div className="sticky-loader-bottom">
          <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('loading')}...</span>
        </div>
      )}

      {/* Custom Global Dialog - Renders on TOP of both pages */}
      <CustomDialog 
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
      />
    </div>
  );
}
