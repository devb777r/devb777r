import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Search, Droplets, Trash2, Edit3, Save, X, PackageOpen, List, LayoutGrid, AlignJustify, Sun, Snowflake, Leaf, Flower2, User, UserCheck, Users, Building2, Factory, ArrowRight, ArrowLeft, Weight, Venus, Mars, VenusAndMars, Filter } from 'lucide-react';
import CustomDialog from './CustomDialog';

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
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // State for deducting sales
  const [sellingId, setSellingId] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  
  // State for adding stock
  const [addingId, setAddingId] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    fetchPerfumes();
  }, []);

  const fetchPerfumes = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from('perfumes')
      .select('*')
      .order('display_id', { ascending: true });
      
    if (error) {
      showDialog('error', `Error fetching: ${error.message}`, t('error'));
    } else if (data) {
      setPerfumes(data);
    }
    if (!silent) setLoading(false);
  };

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

    if (formData.id) {
      const { error } = await supabase.from('perfumes').update(payload).eq('id', formData.id);
      if (error) {
        showDialog('error', `Error updating: ${error.message}`, t('error'));
      }
    } else {
      const { error } = await supabase.from('perfumes').insert([payload]);
      if (error) {
        showDialog('error', `Error inserting: ${error.message}`, t('error'));
      }
    }

    setFormData({ id: null, name_en: '', name_ar: '', name_ar_market: '', price_usd: '', total_volume_kg: 1, description: '', seasons: [], gender: 'unisex', provider: 'RMI', code: '' });
    setActiveTab('inventory');
    setSearchQuery(''); // Clear search so the new perfume is visible
    fetchPerfumes(true);
  };

  const deletePerfume = async (id) => {
    showDialog('delete', t('confirmDelete'), t('delete'), async () => {
      const { error } = await supabase.from('perfumes').delete().eq('id', id);
      if (error) {
        showDialog('error', `Error deleting: ${error.message}`, t('error'));
      } else {
        fetchPerfumes(true);
      }
    });
  };

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

  const editPerfume = async (perfume) => {
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
  };

  const handleDeductSales = async (id, currentVolume) => {
    const amount = Number(sellAmount);
    if (!amount || amount <= 0) {
      setSellingId(null);
      setSellAmount('');
      return;
    }
    const newVolume = Math.max(0, currentVolume - amount);
    await supabase.from('perfumes').update({ total_volume_kg: newVolume }).eq('id', id);
    await supabase.from('perfume_transactions').insert([{ perfume_id: id, amount_ml: amount, transaction_type: 'deduct' }]);
    setSellingId(null);
    setSellAmount('');
    fetchPerfumes(true);
  };

  const handleAddStock = async (id, currentVolume) => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) {
      setAddingId(null);
      setAddAmount('');
      return;
    }
    const newVolume = currentVolume + amount;
    await supabase.from('perfumes').update({ total_volume_kg: newVolume }).eq('id', id);
    await supabase.from('perfume_transactions').insert([{ perfume_id: id, amount_ml: amount, transaction_type: 'add' }]);
    setAddingId(null);
    setAddAmount('');
    fetchPerfumes(true);
  };

  const filteredPerfumes = perfumes.filter(p => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      (p.name_en || '').toLowerCase().includes(searchLower) ||
      (p.name_ar || '').toLowerCase().includes(searchLower) ||
      (p.name_ar_market || '').toLowerCase().includes(searchLower) ||
      (p.code || '').toLowerCase().includes(searchLower)
    );
    const matchesGender = selectedGenders.length === 0 || selectedGenders.includes(p.gender);
    const perfumeSeasons = p.seasons || [];
    const matchesSeason = selectedSeasons.length === 0 || 
                         selectedSeasons.some(s => perfumeSeasons.includes(s));
    const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(p.provider);
    return matchesSearch && matchesGender && matchesSeason && matchesProvider;
  });

  if (activeTab === 'add') {
    const resetForm = () => {
      setActiveTab('inventory');
      setFormData({ id: null, name_en: '', name_ar: '', name_ar_market: '', price_usd: '', total_volume_kg: 1, code: '', description: '', seasons: [], provider: 'RMI', gender: 'unisex' });
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">

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
            <button onClick={resetForm} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-95">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={savePerfume} className="space-y-4">

          {/* Section: Identity */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className={`flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Droplets size={14} className="text-primary-500" />
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {i18n.language === 'ar' ? 'الهوية' : 'Identity'}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {/* Arabic Market Name - Primary */}
              <div className="space-y-1.5">
                <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>{t('arabicMarketName')}</label>
                <input
                  type="text" name="name_ar_market" value={formData.name_ar_market}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl px-5 py-4 text-xl font-black text-slate-900 dark:text-white font-arabic text-right focus:outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600"
                  placeholder="العنبر الفاخر" dir="rtl"
                />
              </div>

              {/* English + Arabic Real Name side by side */}
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

          {/* Section: Pricing & Code */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className={`flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Weight size={14} className="text-primary-500" />
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {i18n.language === 'ar' ? 'السعر والرمز' : 'Pricing & Code'}
              </span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>
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

          {/* Section: Classification */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className={`flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Filter size={14} className="text-primary-500" />
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {i18n.language === 'ar' ? 'التصنيف' : 'Classification'}
              </span>
            </div>
            <div className="p-4 space-y-5">

              {/* Gender */}
              <div className="space-y-2">
                <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>{t('gender')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'male', icon: <Mars size={18} />, label: t('male'), color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30' },
                    { id: 'female', icon: <Venus size={18} />, label: t('female'), color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30' },
                    { id: 'unisex', icon: <VenusAndMars size={18} />, label: t('unisex'), color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/30' }
                  ].map(g => (
                    <button key={g.id} type="button" onClick={() => handleGenderSelect(g.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-2 transition-all font-bold text-xs ${
                        formData.gender === g.id ? `${g.color} scale-[1.03] shadow-md` : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      }`}>
                      {g.icon}
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seasons */}
              <div className="space-y-2">
                <label className={`text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 ${i18n.language === 'ar' ? 'text-right block' : ''}`}>{t('seasons')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'summer', icon: <Sun size={18} />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' },
                    { id: 'winter', icon: <Snowflake size={18} />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30' },
                    { id: 'spring', icon: <Flower2 size={18} />, color: 'text-rose-400 bg-rose-50 dark:bg-rose-400/10 border-rose-300 dark:border-rose-400/30' },
                    { id: 'fall', icon: <Leaf size={18} />, color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/30' }
                  ].map(s => (
                    <button key={s.id} type="button" onClick={() => handleSeasonToggle(s.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl border-2 transition-all font-bold text-xs ${
                        formData.seasons.includes(s.id) ? `${s.color} scale-[1.03] shadow-md` : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      }`}>
                      {s.icon}
                      {t(s.id)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider */}
              <div className="space-y-2">
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
                        formData.provider === p.id ? `${p.color} scale-[1.02] shadow-md` : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      }`}>
                      {p.icon}
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className={`flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <AlignJustify size={14} className="text-primary-500" />
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {i18n.language === 'ar' ? 'ملاحظات' : 'Notes'}
              </span>
            </div>
            <div className="p-4">
              <textarea
                name="description" value={formData.description}
                onChange={handleInputChange} rows={3}
                className={`w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none transition-all resize-none placeholder-slate-300 dark:placeholder-slate-600 ${i18n.language === 'ar' ? 'text-right' : ''}`}
                placeholder={i18n.language === 'ar' ? 'ملاحظات العطر...' : 'Perfume notes...'}
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Save Button */}
          <button type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-3xl py-5 font-black text-lg shadow-xl shadow-primary-500/30 active:scale-[0.98] transition-all flex justify-center items-center gap-3">
            <Save size={22} />
            {t('save')}
          </button>

        </form>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Spacer to account for the sticky header area height when searching */}
      {activeTab === 'inventory' && <div className="h-2" />}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <PackageOpen size={48} className="animate-pulse opacity-50" />
        </div>
      ) : filteredPerfumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-4">
          <PackageOpen size={64} className="opacity-20" />
          <p className="font-medium text-lg text-slate-500">{t('noItemsMessage')}</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-4" : "space-y-4"}>
          {filteredPerfumes.map((perfume, index) => {
            if (viewMode === 'list') {
              return (
                <div key={perfume.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all relative group">
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

                    <div className={`flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-[1.25rem] border-2 border-primary-500/10 dark:border-primary-400/10 shadow-lg dark:shadow-primary-900/10 shrink-0 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
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
                          s === 'winter' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-500' :
                          s === 'spring' ? 'bg-rose-50 dark:bg-rose-400/10 border-rose-100 dark:border-rose-400/20 text-rose-400' :
                          'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-600'
                        }`}>
                          {s === 'summer' ? <Sun size={14} /> : s === 'winter' ? <Snowflake size={14} /> : s === 'spring' ? <Flower2 size={14} /> : <Leaf size={14} />}
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
                      <div className={`flex gap-1.5 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <button onClick={() => editPerfume(perfume)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                          <Edit3 size={14} className="text-blue-500" />
                        </button>
                        <button onClick={() => deletePerfume(perfume.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
            <div key={perfume.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
              <div>
                {/* Card Header -> Names */}
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
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">EN</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {perfume.name_en || '---'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">AR</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-arabic">
                            {perfume.name_ar || '---'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl">
                        <button onClick={() => editPerfume(perfume)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all">
                          <Edit3 size={14} className="text-blue-500" />
                        </button>
                        <button onClick={() => deletePerfume(perfume.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all">
                          <Trash2 size={14} className="text-red-500" />
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

                  {perfume.description && (
                    <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic whitespace-pre-wrap ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {perfume.description}
                    </p>
                  )}
                </div>

                {/* Premium Value Badge */}
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
                    <span className="text-3xl font-black text-primary-600 dark:text-primary-400 leading-none">
                      ${(perfume.price_usd || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Prominent Code Badge */}
                {perfume.code && (
                  <div className={`mb-4 flex items-center gap-3 bg-primary-600/5 dark:bg-primary-400/5 border border-primary-500/10 rounded-[1.25rem] px-5 py-3 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-black text-primary-600/50 dark:text-primary-400/50 uppercase tracking-widest shrink-0">{t('perfumeCode')}</span>
                    <span className="font-mono font-black text-xl text-primary-700 dark:text-primary-300 tracking-widest">{perfume.code}</span>
                  </div>
                )}
              </div>

              {/* Tags (Seasons / Gender) */}
              <div className={`flex flex-wrap gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className="flex flex-wrap gap-1.5">
                  {(perfume.seasons || []).map(s => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">
                      {s === 'summer' ? <Sun size={12} className="text-amber-500" /> : s === 'winter' ? <Snowflake size={12} className="text-blue-500" /> : s === 'spring' ? <Flower2 size={12} className="text-rose-400" /> : <Leaf size={12} className="text-orange-500" />}
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
          })}
        </div>
      )}

      {/* Custom Global Dialog */}
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
