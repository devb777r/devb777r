import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Package, PlusCircle, LayoutDashboard, Sun, Moon, LogIn, LogOut, Search, List, LayoutGrid, Snowflake, Leaf, Flower2, User, UserCheck, Users, Filter, X, Building2, Factory, Venus, Mars, VenusAndMars } from 'lucide-react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'add'
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid'
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  
  // Set direction dynamically to LTR or RTL based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Handle Dark mode 
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Monitor Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('inventory');
  };

  const isAdmin = user !== null;

  return (
    <div className="custom-bg-pulse min-h-screen pb-20 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-500">
      {/* Unified Sticky Header Area */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 shadow-sm dark:shadow-none" dir="ltr">
        {/* Top Title Bar */}
        <header className="p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-slate-900 p-0.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <img src="logo.png" className="w-9 h-9 object-contain rounded-lg" alt="Logo" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">شركة الحرمين</h1>
            </div>
            

          </div>
        </header>

        {/* Secondary Navigation Bar (Search/Filters) - Only for Inventory */}
        {activeTab === 'inventory' && (
          <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-3 max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-5 pointer-events-none text-slate-400 dark:text-slate-500">
                    <Search size={20} />
                  </div>
                  <input 
                    type="text" 
                    className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-inner rounded-full py-2 px-4 ps-12 text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-sans"
                    placeholder={t('search')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full shrink-0 border border-slate-200 dark:border-slate-700 shadow-inner" dir="ltr">
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-md text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    aria-label="Detailed List View"
                  >
                    <List size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-md text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    aria-label="Grid View"
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>

              {/* Advanced Filter Tags */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1 -mx-1">
                <Filter size={16} className="text-primary-500 shrink-0" />
                
                <div className="flex gap-1.5 shrink-0">
                  {/* Provider Tags */}
                  {[
                    { id: 'RMI', icon: <Building2 size={14} className="text-primary-600 dark:text-primary-400" />, color: 'primary' },
                    { id: 'EMSA', icon: <Factory size={14} className="text-primary-600 dark:text-primary-400" />, color: 'primary' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProviders(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                        selectedProviders.includes(p.id) 
                          ? `bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200 shadow-md` 
                          : `bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`
                      }`}
                    >
                      {p.icon} {p.id}
                    </button>
                  ))}

                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />
                  
                  {/* Gender Tags */}
                  {[
                    { id: 'male', icon: <Mars size={14} className="text-indigo-600 dark:text-indigo-400" />, active: 'bg-indigo-600 border-indigo-700' },
                    { id: 'female', icon: <Venus size={14} className="text-rose-600 dark:text-rose-400" />, active: 'bg-rose-600 border-rose-700' },
                    { id: 'unisex', icon: <VenusAndMars size={14} className="text-cyan-600 dark:text-cyan-400" />, active: 'bg-cyan-600 border-cyan-700' }
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGenders(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                        selectedGenders.includes(g.id) 
                          ? `${g.active} text-white shadow-md` 
                          : `bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`
                      }`}
                    >
                      {g.icon} {t(g.id)}
                    </button>
                  ))}
                  
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />

                  {/* Season Tags */}
                  {[
                    { id: 'summer', icon: <Sun size={14} className="text-amber-500" />, active: 'bg-amber-600 border-amber-700' },
                    { id: 'winter', icon: <Snowflake size={14} className="text-blue-500" />, active: 'bg-blue-600 border-blue-700' },
                    { id: 'spring', icon: <Flower2 size={14} className="text-rose-500" />, active: 'bg-rose-600 border-rose-700' },
                    { id: 'fall', icon: <Leaf size={14} className="text-orange-500" />, active: 'bg-orange-600 border-orange-700' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSeasons(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                        selectedSeasons.includes(s.id) 
                          ? `${s.active} text-white shadow-md` 
                          : `bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm`
                      }`}
                    >
                      {s.icon} {t(s.id)}
                    </button>
                  ))}
                </div>

                {/* Clear All Button (Moved to end for stability) */}
                {(selectedGenders.length > 0 || selectedSeasons.length > 0 || selectedProviders.length > 0) && (
                  <button 
                    onClick={() => { setSelectedGenders([]); setSelectedSeasons([]); setSelectedProviders([]); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-500 border border-rose-100 dark:border-rose-900/40 shrink-0 transition-all animate-in fade-in zoom-in-90 duration-200 active:scale-95 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                  >
                    <X size={14} /> {t('clear')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="p-4 max-w-2xl mx-auto w-full">
        <Dashboard 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isAdmin={isAdmin} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedGenders={selectedGenders}
          selectedSeasons={selectedSeasons}
          selectedProviders={selectedProviders}
        />
      </main>

      {/* Mobile Bottom Navbar - Liquid Glass Floating Pill */}
      <nav className="fixed bottom-6 left-4 right-4 z-50 liquid-glass rounded-[2.5rem] max-w-lg mx-auto px-2 py-1.5" dir="ltr">
        <div className="flex justify-around items-center max-w-2xl mx-auto w-full relative">
          {/* Inventory Tab */}
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center w-20 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'inventory' ? 'text-primary-600 dark:text-primary-400 bg-white/50 dark:bg-white/10 shadow-sm scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <LayoutDashboard size={22} className={activeTab === 'inventory' ? 'mb-1' : 'mb-1'} />
            <span className="text-[10px] font-bold tracking-tight">{t('inventory')}</span>
          </button>



          {/* Settings / Language Tab */}
          <button 
            onClick={toggleLanguage}
            className="flex flex-col items-center justify-center w-20 py-2 rounded-2xl transition-all text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Languages size={22} className="mb-1" />
            <span className="text-[10px] font-bold tracking-tight">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Floating Add Action (Admin Only) */}
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('add')}
              className={`flex items-center justify-center -mt-10 bg-gradient-to-tr from-primary-600 to-cyan-500 dark:from-primary-500 dark:to-cyan-400 text-white rounded-full p-4 shadow-xl shadow-primary-500/40 hover:scale-110 active:scale-95 transition-all w-14 h-14 border-4 border-white dark:border-slate-900 z-10`}
            >
              <PlusCircle size={32} />
            </button>
          )}



          {/* Theme Toggle Tab */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex flex-col items-center justify-center w-20 py-2 rounded-2xl transition-all text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {isDarkMode ? <Sun size={22} className="mb-1 text-amber-400" /> : <Moon size={22} className="mb-1" />}
            <span className="text-[10px] font-bold tracking-tight">{isDarkMode ? t('lightMode') : t('darkMode')}</span>
          </button>

          {/* Login/Logout Tab */}
          {!isAdmin ? (
            <button 
              onClick={() => setShowLogin(true)}
              className="flex flex-col items-center justify-center w-20 py-2 rounded-2xl transition-all text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <LogIn size={22} className="mb-1" />
              <span className="text-[10px] font-bold tracking-tight">{t('login')}</span>
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-20 py-2 rounded-2xl transition-all text-red-400 hover:text-red-600"
            >
              <LogOut size={22} className="mb-1" />
              <span className="text-[10px] font-bold tracking-tight">{t('logout')}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
}

export default App;
