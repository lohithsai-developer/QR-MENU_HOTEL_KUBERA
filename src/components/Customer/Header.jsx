import React from 'react';
import { Search, Shield, Bookmark, Utensils } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Header = ({
  searchQuery,
  setSearchQuery,
  vegFilter,
  setVegFilter,
  onOpenAdminLogin
}) => {
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <header className="bg-white/95 backdrop-blur-md">
      {/* Row 1: Brand & Top Actions (Compact & Minimal) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between border-b border-stone-100">
        {/* Brand & Crest */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-kubera-burgundy shadow-2xs overflow-hidden shrink-0">
            <img
              src="/kubera-logo.jpg"
              alt="Hotel Kubera Crest"
              className="w-full h-full object-cover rounded-full bg-stone-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <h1 className="text-sm sm:text-base font-bold font-serif tracking-wide text-kubera-burgundy">
                HOTEL KUBERA
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
                Eluru
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 hidden xs:block">
              Taste the Wealth of Flavours
            </p>
          </div>
        </div>

        {/* Right Action Controls: Selection & Staff Portal */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* My Selection Shortlist Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs font-semibold shadow-2xs transition-transform active:scale-95"
            aria-label="View My Selection"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] sm:text-xs">Selection</span>
            {totalItemsCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-amber-300 text-slate-900 font-extrabold text-[10px]">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Admin Staff Portal */}
          <button
            onClick={onOpenAdminLogin}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-50 border border-stone-200 hover:border-kubera-burgundy text-slate-500 hover:text-kubera-burgundy flex items-center justify-center transition-colors"
            title="Hotel Staff & Manager Portal"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Combined Search & Dietary Filter (Single Slim Row!) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5">
        <div className="flex items-center gap-2">
          {/* Compact Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full h-8 pl-8 pr-6 text-xs rounded-lg bg-stone-100 border border-stone-200/70 focus:bg-white focus:border-kubera-burgundy focus:outline-none text-slate-800 placeholder:text-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Compact Slim Dietary Filter Segmented Bar */}
          <div className="h-8 inline-flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200/70 shrink-0">
            {/* All */}
            <button
              onClick={() => setVegFilter('')}
              className={`h-7 px-2.5 rounded-md text-[11px] font-bold transition-all ${
                vegFilter === ''
                  ? 'bg-kubera-burgundy text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>

            {/* Pure Veg */}
            <button
              onClick={() => setVegFilter('true')}
              className={`h-7 flex items-center gap-1 px-2 rounded-md text-[11px] font-bold transition-all ${
                vegFilter === 'true'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${vegFilter === 'true' ? 'bg-white' : 'bg-emerald-600'}`} />
              <span>Veg</span>
            </button>

            {/* Non-Veg */}
            <button
              onClick={() => setVegFilter('false')}
              className={`h-7 flex items-center gap-1 px-2 rounded-md text-[11px] font-bold transition-all ${
                vegFilter === 'false'
                  ? 'bg-rose-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-rose-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${vegFilter === 'false' ? 'bg-white' : 'bg-rose-600'}`} />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
