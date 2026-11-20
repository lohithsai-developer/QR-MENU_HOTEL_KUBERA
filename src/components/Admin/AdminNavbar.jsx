import React from 'react';
import { ChefHat, Utensils, QrCode, BarChart3, LogOut, ArrowLeft, Tag } from 'lucide-react';

export const AdminNavbar = ({
  activeTab,
  setActiveTab,
  pendingOrdersCount,
  onLogout,
  onViewCustomerMenu
}) => {
  const tabs = [
    {
      id: 'menu',
      label: 'Dishes',
      desktopLabel: 'Menu Dishes (CRUD)',
      icon: Utensils
    },
    {
      id: 'categories',
      label: 'Categories',
      desktopLabel: 'Category Manager',
      icon: Tag
    },
    {
      id: 'qr',
      label: 'QR Codes',
      desktopLabel: 'QR Standee Generator',
      icon: QrCode
    },
    {
      id: 'overview',
      label: 'Tables',
      desktopLabel: 'Restaurant Tables',
      icon: BarChart3
    }
  ];

  return (
    <>
      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-kubera-burgundy shadow-2xs overflow-hidden shrink-0">
                <img
                  src="/kubera-logo.jpg"
                  alt="Hotel Kubera"
                  className="w-full h-full object-cover rounded-full bg-stone-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-serif font-bold text-sm sm:text-base text-kubera-burgundy tracking-wide">
                    HOTEL KUBERA
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden xs:block mt-0.5">
                  Eluru Management Hub
                </p>
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs (Hidden on mobile, bottom bar handles it) */}
            <div className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-kubera-burgundy text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-slate-500'}`} />
                    <span>{tab.desktopLabel}</span>
                    {tab.badge && (
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Actions (View Customer Menu & Logout) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onViewCustomerMenu}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-slate-700 text-xs font-semibold transition-colors"
                title="Open Customer Menu"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Customer Menu</span>
                <span className="sm:hidden text-[11px]">Menu</span>
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Secondary Mobile Horizontal Scrollable Tab Strip */}
          <div className="md:hidden flex items-center gap-1 mt-2 pt-2 border-t border-stone-100 overflow-x-auto no-scrollbar py-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-kubera-burgundy text-white shadow-2xs'
                      : 'bg-stone-100 text-slate-600 hover:bg-stone-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar for Instant One-Thumb Switching */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-1 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-kubera-burgundy font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-kubera-burgundy stroke-[2.5]' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-kubera-burgundy mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
