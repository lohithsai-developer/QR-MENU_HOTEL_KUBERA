import React, { useState, useEffect } from 'react';
import { Header } from './components/Customer/Header';
import { CategoryPills } from './components/Customer/CategoryPills';
import { MenuItemCard } from './components/Customer/MenuItemCard';
import { CartModal } from './components/Customer/CartModal';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AdminLoginPage } from './components/Admin/AdminLoginPage';
import { AdminNavbar } from './components/Admin/AdminNavbar';
import { LiveOrdersFeed } from './components/Admin/LiveOrdersFeed';
import { MenuManager } from './components/Admin/MenuManager';
import { CategoryManager } from './components/Admin/CategoryManager';
import { QRCodeGenerator } from './components/Admin/QRCodeGenerator';
import { RestaurantStats } from './components/Admin/RestaurantStats';
import { useCart } from './context/CartContext';
import { api } from './services/api';
import { Sparkles, ArrowRight, Utensils, Award, Shield, Bookmark, Flame } from 'lucide-react';

export function App() {
  const {
    totalItemsCount,
    grandTotal,
    setIsCartOpen
  } = useCart();

  // Navigation State: 'customer' | 'admin'
  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    return (path.startsWith('/admin') || path.startsWith('/login')) ? 'admin' : 'customer';
  });

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('kubera_admin_token'));
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('menu'); // 'menu' | 'categories' | 'qr' | 'overview'

  // Menu Data State
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(''); // '' | 'true' | 'false'
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Pending orders count for admin badge
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Load menu items & categories from API
  const loadMenu = async (isRetry = false) => {
    try {
      setIsLoadingMenu(true);
      setLoadError(null);
      // Fetch all items matching dietary & search filters so all categories are available in single-page orderly scroll
      const [menuRes, catRes] = await Promise.all([
        api.getMenu({ category: 'All', isVeg: vegFilter, search: searchQuery }),
        api.getCategories()
      ]);

      if (menuRes && menuRes.data) {
        setDishes(menuRes.data);
      }
      if (catRes && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Failed to load menu data:', err);
      if (!isRetry) {
        setTimeout(() => loadMenu(true), 2500);
      } else {
        setLoadError('Cloud server is waking up. Please tap to retry.');
      }
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [vegFilter, searchQuery]);

  // Handle smooth scroll when category pill is tapped
  const handleSelectCategory = (catName) => {
    setActiveCategory(catName);
    if (catName === 'All') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const catId = `category-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const targetEl = document.getElementById(catId);
      if (targetEl) {
        const headerOffset = 115;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Scroll spy: auto-highlight category pill based on scroll position
  useEffect(() => {
    if (currentView !== 'customer' || isLoadingMenu) return;

    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      const headerOffset = 135;

      // When near the top, highlight 'All' (which shows Suggested Items)
      if (scrollY < 180) {
        setActiveCategory('All');
        return;
      }

      // Check category sections in reverse order
      const validCategories = categories
        .map(c => typeof c === 'string' ? c : c.name)
        .filter(c => c !== 'All');

      for (let i = validCategories.length - 1; i >= 0; i--) {
        const catName = validCategories[i];
        const catId = `category-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const el = document.getElementById(catId);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= headerOffset + 40) {
            setActiveCategory(catName);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView, categories, isLoadingMenu]);

  // Check admin session & pending orders
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('kubera_admin_token');
      if (token) {
        const verifyRes = await api.verifyAuth();
        if (verifyRes.success) {
          setIsAdminAuthenticated(true);
        } else {
          localStorage.removeItem('kubera_admin_token');
          setIsAdminAuthenticated(false);
        }
      }

      try {
        const ordersRes = await api.getOrders({ status: 'pending' });
        if (ordersRes.success && ordersRes.data) {
          setPendingOrdersCount(ordersRes.data.length);
        }
      } catch (e) {
        // quiet
      }
    };

    checkAdmin();
    const interval = setInterval(checkAdmin, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin');
    window.history.pushState({}, '', '/admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('kubera_admin_token');
    localStorage.removeItem('kubera_admin_user');
    setIsAdminAuthenticated(false);
    setCurrentView('customer');
    window.history.pushState({}, '', '/');
  };

  // Convert categories array to plain category name strings for the category bar
  const categoryNames = [
    'All',
    ...categories.map(c => typeof c === 'string' ? c : c.name).filter(c => c !== 'All')
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {currentView === 'admin' ? (
        !isAdminAuthenticated ? (
          /* ================= DEDICATED ADMIN LOGIN PAGE ================= */
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToCustomer={() => {
              window.history.pushState({}, '', '/');
              setCurrentView('customer');
            }}
          />
        ) : (
          /* ================= ADMIN DASHBOARD VIEW ================= */
          <div className="flex-1 flex flex-col pb-20 md:pb-8">
            <AdminNavbar
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              pendingOrdersCount={pendingOrdersCount}
              onLogout={handleAdminLogout}
              onViewCustomerMenu={() => {
                window.history.pushState({}, '', '/');
                setCurrentView('customer');
              }}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 md:pb-8 overflow-x-hidden">
              {adminTab === 'menu' && (
                <MenuManager
                  dishes={dishes}
                  categories={categories}
                  onRefreshMenu={loadMenu}
                />
              )}
              {adminTab === 'categories' && (
                <CategoryManager
                  categories={categories}
                  onRefreshCategories={loadMenu}
                  dishes={dishes}
                />
              )}
              {adminTab === 'qr' && <QRCodeGenerator />}
              {adminTab === 'overview' && <RestaurantStats />}
            </main>
          </div>
        )
      ) : (
        /* ================= CUSTOMER MENU VIEW ================= */
        <div className="flex-1 flex flex-col relative pb-28">
          {/* Unified Solid Sticky Top Bar (Header + Dietary Filters + Dynamic Admin Categories) */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200">
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              vegFilter={vegFilter}
              setVegFilter={setVegFilter}
              onOpenAdminLogin={() => {
                window.history.pushState({}, '', '/admin');
                setCurrentView('admin');
              }}
            />
            {/* Fixed Horizontal Categories Bar - dynamically populated from admin categories */}
            <CategoryPills
              categories={categoryNames}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
            />
          </div>

          {/* Luxury Light Hero Banner (Desktop / Tablet only to keep mobile simple & minimal) */}
          <section className="hidden sm:block relative overflow-hidden pt-4 pb-2 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="relative rounded-2xl p-4 sm:p-6 overflow-hidden border border-stone-200 bg-white shadow-2xs">
                <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-5 pointer-events-none">
                  <img src="/kubera-logo.jpg" alt="" className="w-full h-full object-contain" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Welcome to Hotel Kubera • Eluru's Premier Dining Landmark</span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-serif font-bold text-slate-900">
                      Taste the Wealth of Flavours
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      Explore authentic Godavari seafood, tandoor tikkas, and royal dum biryanis. Shortlist dishes and show them to your waiter.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2.5 shadow-2xs">
                      <Award className="w-5 h-5 text-amber-600" />
                      <div className="text-left text-xs">
                        <span className="font-bold text-slate-900 block">Chef Recommended</span>
                        <span className="text-[10px] text-amber-800 font-semibold">Royyala Vepudu & Dum Biryani</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Menu Items Container (Single-Page Orderly Scroll: Suggested Items first, followed by Categories) */}
          <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 flex-1 w-full">
            {isLoadingMenu ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-7 h-7 mx-auto border-2 border-kubera-burgundy border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Loading Hotel Kubera Menu...</p>
              </div>
            ) : loadError && dishes.length === 0 ? (
              <div className="py-12 px-4 text-center bg-white border border-amber-200/90 rounded-2xl space-y-3 shadow-xs max-w-md mx-auto">
                <div className="text-3xl">🍲</div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Connecting to Hotel Kubera</h4>
                <p className="text-xs text-slate-500">
                  {loadError}
                </p>
                <button
                  type="button"
                  onClick={() => loadMenu(true)}
                  className="px-4 py-2 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs font-bold shadow-xs transition-colors"
                >
                  🔄 Tap to Reload Menu
                </button>
              </div>
            ) : dishes.length === 0 ? (
              <div className="py-14 text-center bg-white border border-stone-200 rounded-2xl space-y-2 shadow-2xs">
                <div className="text-2xl">🔍</div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800">No dishes match your filter</h4>
                <p className="text-[11px] text-slate-400">
                  Try clearing your search query or dietary filters.
                </p>
              </div>
            ) : (
              <div>
                {/* 1. TOP SECTION: CHEF'S SUGGESTED & RECOMMENDED ITEMS */}
                {(() => {
                  const suggestedDishes = dishes.filter(d => {
                    const tags = Array.isArray(d.tags) ? d.tags.map(t => String(t).toLowerCase()) : [];
                    return (
                      Boolean(d.isChefSpecial) ||
                      tags.some(t => t.includes('bestseller') || t.includes('recommend') || t.includes('must try'))
                    );
                  });

                  if (suggestedDishes.length === 0 || searchQuery) return null;

                  return (
                    <section id="section-suggested" className="mb-6 pt-1">
                      <div className="flex items-center justify-between mb-2.5 px-0.5 border-b border-amber-200/80 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900">
                            Chef's Recommended & Suggestions
                          </h3>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            Popular
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">({suggestedDishes.length})</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                        {suggestedDishes.map((dish) => (
                          <MenuItemCard key={`sugg-${dish.id || dish._id}`} dish={dish} />
                        ))}
                      </div>
                    </section>
                  );
                })()}

                {/* 2. ORDERLY CATEGORY SECTIONS (SCROLLABLE IN ONE PAGE) */}
                {(() => {
                  const orderedCategories = categories
                    .map(c => (typeof c === 'string' ? { name: c, icon: '🍽️' } : c))
                    .filter(c => c.name !== 'All');

                  const renderedSections = orderedCategories.map((cat) => {
                    const catName = cat.name;
                    const catIcon = cat.icon || '🍽️';
                    const catDesc = cat.description || '';
                    const catDishes = dishes.filter(
                      d => d.category.toLowerCase() === catName.toLowerCase()
                    );

                    if (catDishes.length === 0) return null;

                    const catSlug = `category-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

                    return (
                      <section
                        key={catName}
                        id={catSlug}
                        className="mb-6 scroll-mt-28"
                      >
                        <div className="flex items-center justify-between mb-2.5 px-0.5 border-b border-stone-200/90 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{catIcon}</span>
                            <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900">
                              {catName}
                            </h3>
                            <span className="text-xs text-slate-400 font-semibold">({catDishes.length})</span>
                          </div>
                          {catDesc && (
                            <span className="text-[11px] text-slate-400 hidden sm:inline">{catDesc}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                          {catDishes.map((dish) => (
                            <MenuItemCard key={dish.id || dish._id} dish={dish} />
                          ))}
                        </div>
                      </section>
                    );
                  });

                  // Render any dishes that belong to other custom categories
                  const knownNames = new Set(orderedCategories.map(c => c.name.toLowerCase()));
                  const otherDishes = dishes.filter(d => !knownNames.has(d.category.toLowerCase()));

                  return (
                    <>
                      {renderedSections}
                      {otherDishes.length > 0 && (
                        <section id="category-other" className="mb-6 scroll-mt-28">
                          <div className="flex items-center justify-between mb-2.5 px-0.5 border-b border-stone-200/90 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">✨</span>
                              <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900">
                                Special Delicacies
                              </h3>
                              <span className="text-xs text-slate-400 font-semibold">({otherDishes.length})</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                            {otherDishes.map((dish) => (
                              <MenuItemCard key={dish.id || dish._id} dish={dish} />
                            ))}
                          </div>
                        </section>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </main>

          {/* Floating Shortlist Bottom Bar */}
          {totalItemsCount > 0 && (
            <div className="fixed bottom-3 left-0 right-0 z-40 px-3 sm:px-4 flex justify-center pointer-events-none">
              <button
                onClick={() => setIsCartOpen(true)}
                className="pointer-events-auto w-full max-w-md p-3 rounded-2xl bg-kubera-burgundy hover:bg-kubera-maroon text-white font-bold shadow-xl flex items-center justify-between gap-3 transition-transform active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-300 text-slate-900 flex items-center justify-center font-black text-xs shadow-2xs">
                    {totalItemsCount}
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] text-amber-200 uppercase tracking-wider block font-semibold">
                      My Selection
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      ₹{grandTotal} <span className="text-[10px] font-normal text-amber-200/90">(est. bill)</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-200">
                  <span>View Slip</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </div>
              </button>
            </div>
          )}

          {/* Shortlist Modal */}
          <CartModal />

          {/* Admin Login Modal */}
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onLoginSuccess={handleAdminLoginSuccess}
          />
        </div>
      )}

      {/* Global Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-kubera-burgundy">Hotel Kubera (Eluru)</span>
            <span>•</span>
            <span className="text-slate-500">Taste the Wealth of Flavours</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Authentic Andhra & Multi-Cuisine</span>
            <span>•</span>
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setCurrentView(currentView === 'admin' ? 'customer' : 'admin');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="text-kubera-burgundy hover:underline flex items-center gap-1 font-semibold"
            >
              <Shield className="w-3 h-3" />
              <span>{currentView === 'admin' ? 'Switch to Customer View' : 'Manager / Staff Portal'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
