import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORY_ICONS = {
  'All': '✨',
  'Starters': '🍢',
  'Tikkas': '🔥',
  'Andhra Specials': '🌶️',
  'Biryanis & Pulaos': '🍚',
  'Main Course': '🍛',
  'Soups': '🥣',
  'Breads': '🫓',
  'Desserts': '🍨',
  'Beverages': '☕'
};

export const CategoryPills = ({ categories, activeCategory, onSelectCategory }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Keep active category pill visible as user scrolls down the page
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeBtn = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

  return (
    <nav className="py-1.5 px-3 sm:px-4 border-t border-stone-100 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto relative flex items-center">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-stone-200 text-slate-600 hover:bg-kubera-burgundy hover:text-white transition-all shrink-0 mr-1 shadow-2xs"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Scrollable Categories Strip (Slim & Minimal) */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full py-0.5"
        >
          {categories.map((cat) => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            const catIcon = typeof cat === 'object' && cat.icon ? cat.icon : CATEGORY_ICONS[catName] || '🍽️';
            const isActive = activeCategory.toLowerCase() === catName.toLowerCase();

            return (
              <button
                key={catName}
                data-category={catName}
                data-active={isActive}
                onClick={() => onSelectCategory(catName)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-kubera-burgundy text-white shadow-2xs border border-kubera-burgundy'
                    : 'bg-stone-100 text-slate-600 hover:text-slate-900 hover:bg-stone-200/70 border border-stone-200/60'
                }`}
              >
                <span className="text-[11px]">{catIcon}</span>
                <span>{catName}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white border border-stone-200 text-slate-600 hover:bg-kubera-burgundy hover:text-white transition-all shrink-0 ml-1 shadow-2xs"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
};
