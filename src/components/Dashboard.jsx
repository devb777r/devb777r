import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Search, Droplets, Trash2, Edit3, Save, X, PackageOpen, List, LayoutGrid, AlignJustify, Sun, Snowflake, Leaf, Flower2, User, UserCheck, Users, Building2, Factory } from 'lucide-react';
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
      p.name_en.toLowerCase().includes(searchLower) ||
      p.name_ar.toLowerCase().includes(searchLower) ||
      p.name_ar_market.toLowerCase().includes(searchLower) ||
      (p.code && p.code.toLowerCase().includes(searchLower))
    );
    const matchesGender = selectedGenders.length === 0 || selectedGenders.includes(p.gender);
    const perfumeSeasons = p.seasons || [];
    const matchesSeason = selectedSeasons.length === 0 || 
                         selectedSeasons.some(s => perfumeSeasons.includes(s));
    const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(p.provider);
    return matchesSearch && matchesGender && matchesSeason && matchesProvider;
  });

  if (activeTab === 'add') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {formData.id ? t('edit') : t('addPerfume')}
          </h2>
          <button onClick={() => { setActiveTab('inventory'); setFormData({id:null, name_en:'', name_ar:'', name_ar_market:'', price_usd:'', total_volume_kg:1, code:''}); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={savePerfume} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{t('englishName')}</label>
            <input type="text" name="name_en" value={formData.name_en} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-500" placeholder="e.g. Royal Amber" />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{t('arabicRealName')}</label>
            <input type="text" name="name_ar" value={formData.name_ar} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-arabic text-right placeholder-slate-400 dark:placeholder-slate-500" placeholder="عنبر ملكي" dir="rtl" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{t('arabicMarketName')}</label>
            <input type="text" name="name_ar_market" value={formData.name_ar_market} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-arabic text-right placeholder-slate-400 dark:placeholder-slate-500" placeholder="العنبر الفاخر" dir="rtl" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{t('totalPrice')} (For 1 kg)</label>
              <input type="number" step="0.01" name="price_usd" value={formData.price_usd} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-500" placeholder="e.g. 150" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{t('perfumeCode')}</label>
              <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-500 font-mono" placeholder="e.g. AH-102" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{t('description')}</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              rows={4}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none min-h-[120px] placeholder-slate-400 dark:placeholder-slate-500" 
              placeholder={t('descriptionPlaceholder') || "Enter perfume notes..."} 
            />
          </div>

          {/* Seasons Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{t('seasons')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'summer', icon: <Sun size={14} />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
                { id: 'winter', icon: <Snowflake size={14} />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
                { id: 'spring', icon: <Flower2 size={14} />, color: 'text-rose-400 bg-rose-50 dark:bg-rose-400/10 border-rose-200 dark:border-rose-400/20' },
                { id: 'fall', icon: <Leaf size={14} />, color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSeasonToggle(s.id)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                    formData.seasons.includes(s.id) 
                    ? `${s.color} ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-900 border-transparent scale-[1.02]` 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {s.icon}
                  {t(s.id)}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Company Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'RMI', icon: <Building2 size={14} />, color: 'text-slate-600 bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20' },
                { id: 'EMSA', icon: <Factory size={14} />, color: 'text-slate-600 bg-slate-100 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderSelect(p.id)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                    formData.provider === p.id 
                    ? `${p.color} ring-2 ring-offset-2 ring-slate-800 dark:ring-offset-slate-900 border-transparent scale-[1.02]` 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {p.icon}
                  {p.id}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{t('gender')}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'male', icon: <User size={14} />, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
                { id: 'female', icon: <UserCheck size={14} />, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
                { id: 'unisex', icon: <Users size={14} />, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20' }
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGenderSelect(g.id)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                    formData.gender === g.id 
                    ? `${g.color} ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-slate-900 border-transparent scale-[1.02]` 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {g.icon}
                  {t(g.id)}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full mt-6 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl p-4 font-bold text-lg shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
            <Save size={20} />
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
        <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 gap-3" : viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
          {filteredPerfumes.map((perfume, index) => {
            if (viewMode === 'compact') {
              return (
                <div key={perfume.id} className="bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 truncate pr-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs font-black text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                      #{perfume.display_id}
                    </span>
                    <span className={`font-bold text-slate-800 dark:text-slate-100 ${i18n.language === 'en' ? '' : 'font-arabic'} truncate text-lg`}>
                      {i18n.language === 'en' ? perfume.name_en : perfume.name_ar_market}
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 shrink-0 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    {perfume.code && (
                      <span className="text-xs font-black text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-1 rounded-md border border-primary-100 dark:border-primary-500/20 font-mono">
                        {perfume.code}
                      </span>
                    )}
                    <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">1 {t('ml')}</span>
                      <span className="text-primary-600 dark:text-primary-400 font-black text-sm">$ {(perfume.price_usd || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
            <div key={perfume.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
              <div>
                {/* Card Header -> Names */}
                <div className={`flex items-start mb-4 ${viewMode === 'grid' ? 'flex-col gap-3' : 'justify-between'}`}>
                  <div>
                    <h3 className={`font-bold ${viewMode === 'grid' ? 'text-lg' : 'text-xl'} text-slate-800 dark:text-slate-100 ${i18n.language === 'en' ? '' : 'font-arabic'} leading-tight flex items-center gap-2.5`}>
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/80 text-[11px] font-black text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                        #{perfume.display_id}
                      </span>
                      {i18n.language === 'en' ? perfume.name_en : perfume.name_ar_market}
                    </h3>
                    <div className={`flex flex-wrap gap-2 mt-2 ml-1`}>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                        {i18n.language === 'en' ? perfume.name_ar : perfume.name_en}
                      </span>
                      {i18n.language === 'ar' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-secondary-50 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-400 rounded-md">
                          {perfume.name_ar}
                        </span>
                      )}
                      {i18n.language === 'en' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-secondary-50 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-400 rounded-md">
                          {perfume.name_ar_market}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                        {perfume.provider === 'EMSA' ? <Factory size={10} /> : <Building2 size={10} />}
                        {perfume.provider || 'RMI'}
                      </span>
                    </div>

                    {perfume.description && (
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-1 italic whitespace-pre-wrap">
                        {perfume.description}
                      </p>
                    )}
                  </div>

                  {/* Actions (Edit / Delete) - Admin Only */}
                  {isAdmin && (
                    <div className={`flex gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl ${viewMode === 'grid' ? 'w-full justify-end' : ''}`}>
                      <button onClick={() => editPerfume(perfume)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" aria-label={t('edit')}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deletePerfume(perfume.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" aria-label={t('delete')}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* New Premium RTL-Optimized Value Badge */}
                <div className={`mt-2 mb-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 shadow-inner flex items-center justify-between ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">{t('standardUnit')}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-primary-600 text-white w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold shadow-sm shadow-primary-500/20">1</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold text-base tracking-tight">{t('ml')}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50 mx-2" />
                  
                  <div className={`flex flex-col ${i18n.language === 'ar' ? 'items-start text-left' : 'items-end text-right'}`}>
                    <span className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">{t('totalPrice')}</span>
                    <span className="text-3xl font-black text-primary-600 dark:text-primary-400 leading-none">${(perfume.price_usd || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Optional Perfume Code Badge */}
                {perfume.code && (
                  <div className="mt-2 mb-4 py-2 px-4 bg-primary-600/5 dark:bg-primary-400/5 border border-dashed border-primary-200 dark:border-primary-500/30 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">{t('perfumeCode')}</span>
                    <span className="font-mono font-black text-primary-700 dark:text-primary-300 bg-white dark:bg-slate-900 px-3 py-1 rounded shadow-sm border border-primary-100 dark:border-primary-500/20">
                      {perfume.code}
                    </span>
                  </div>
                )}
                </div>

                {/* Tags (Seasons / Gender) */}
                <div className="flex flex-wrap gap-1.5 mb-4 px-1">
                  {/* Seasons Tags */}
                  {(perfume.seasons || []).map(s => (
                    <span key={s} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all shadow-sm ${
                      s === 'summer' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' :
                      s === 'winter' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20' :
                      s === 'spring' ? 'bg-rose-50 dark:bg-rose-400/10 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-400/20' :
                      'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20'
                    }`}>
                      {s === 'summer' ? <Sun size={10} /> : s === 'winter' ? <Snowflake size={10} /> : s === 'spring' ? <Flower2 size={10} /> : <Leaf size={10} />}
                      {t(s)}
                    </span>
                  ))}

                  {perfume.gender && (
                    <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all shadow-sm ${
                      perfume.gender === 'male' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' :
                      perfume.gender === 'female' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' :
                      'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20'
                    }`}>
                      {perfume.gender === 'male' ? <User size={10} /> : perfume.gender === 'female' ? <UserCheck size={10} /> : <Users size={10} />}
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
