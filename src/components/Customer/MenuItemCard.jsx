import React, { useState } from 'react';
import { Plus, Minus, Users, Flame, Award, Sparkles, ChevronRight, Info } from 'lucide-react';
import { VegBadge } from '../Common/VegBadge';
import { DishDetailsModal } from './DishDetailsModal';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../services/api';

export const MenuItemCard = ({ dish }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const cartItem = cartItems.find((i) => i.id === dish.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const imageUrl = getImageUrl(dish.image);

  // Extract a single clean primary tag to avoid visual clutter
  const rawTags = Array.isArray(dish.tags) ? dish.tags.map(t => String(t).toLowerCase()) : [];
  if (dish.isChefSpecial && !rawTags.includes('chef special') && !rawTags.includes('recommended')) {
    rawTags.push('chef special');
  }

  let primaryTag = null;
  if (rawTags.some(t => t.includes('bestseller'))) {
    primaryTag = { label: 'Bestseller', type: 'bestseller' };
  } else if (rawTags.some(t => t.includes('recommend') || t.includes('chef'))) {
    primaryTag = { label: 'Recommended', type: 'recommended' };
  } else if (rawTags.some(t => t.includes('must try'))) {
    primaryTag = { label: 'Must Try', type: 'must_try' };
  }

  return (
    <>
      <article
        className={`rounded-2xl bg-white border border-stone-200/80 p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-all duration-200 flex items-start justify-between gap-3 relative ${
          !dish.isAvailable ? 'opacity-60 grayscale-[35%]' : ''
        }`}
      >
        {/* Left: Dish Information (Name, Price, Tags, Portion & View Details) */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Top Meta Line: Veg/Non-Veg + Single Primary Tag */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <VegBadge isVeg={dish.isVeg} size="sm" />

            {primaryTag && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight ${
                  primaryTag.type === 'bestseller'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                    : primaryTag.type === 'recommended'
                    ? 'bg-rose-50 text-kubera-burgundy border border-rose-200/80'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                }`}
              >
                {primaryTag.type === 'bestseller' && <Flame className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />}
                {primaryTag.type === 'recommended' && <Award className="w-2.5 h-2.5 text-kubera-burgundy" />}
                {primaryTag.type === 'must_try' && <Sparkles className="w-2.5 h-2.5 text-emerald-600" />}
                <span>{primaryTag.label}</span>
              </span>
            )}

            {dish.spiceLevel === 'Extra Spicy' && (
              <span className="text-[10px] text-rose-700 font-bold">🌶️ Hot</span>
            )}
          </div>

          {/* Dish Title (Clickable to view details) */}
          <h3
            onClick={() => setIsDetailsOpen(true)}
            className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 mt-1 cursor-pointer hover:text-kubera-burgundy transition-colors"
          >
            {dish.name}
          </h3>

          {/* Price & Portion Size */}
          <div className="flex items-center gap-2 mt-1">
            <span className="font-extrabold text-kubera-burgundy text-sm sm:text-base">
              ₹{dish.price}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 font-medium bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/60">
              <Users className="w-2.5 h-2.5 text-slate-400" />
              <span>{dish.servingSize || 'Serves 1-2'}</span>
            </span>
          </div>

          {/* View Details Action Button (Replaces cluttered description in card) */}
          <div className="mt-1.5">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-kubera-burgundy hover:text-kubera-maroon hover:underline transition-colors cursor-pointer py-0.5"
            >
              <span>View Details</span>
              <ChevronRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Right: Compact Dish Photo + Integrated ADD Pill */}
        <div className="relative shrink-0 flex flex-col items-center">
          {/* Photo Container */}
          <div
            onClick={() => setIsDetailsOpen(true)}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/70 shadow-2xs relative cursor-pointer"
          >
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={dish.name}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-slate-400 p-2 text-center">
                <span className="text-xl mb-0.5">🍽️</span>
                <span className="text-[9px] font-serif font-bold text-slate-400 tracking-wider">KUBERA</span>
              </div>
            )}

            {/* Sold Out Overlay */}
            {!dish.isAvailable && (
              <div className="absolute inset-0 bg-stone-900/65 backdrop-blur-2xs flex items-center justify-center p-1 text-center">
                <span className="text-[10px] font-bold uppercase text-white tracking-wider bg-rose-600/90 px-1.5 py-0.5 rounded">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Compact Floating ADD Button */}
          <div className="absolute -bottom-2 z-10 w-[80px] sm:w-[86px]">
            {dish.isAvailable ? (
              quantity === 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(dish);
                  }}
                  className="w-full h-7 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 hover:border-kubera-burgundy text-kubera-burgundy font-extrabold text-[11px] uppercase tracking-wider shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1"
                  aria-label={`Add ${dish.name} to selection`}
                >
                  <Plus className="w-3 h-3 text-kubera-burgundy stroke-[3]" />
                  <span>ADD</span>
                </button>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-7 rounded-lg bg-kubera-burgundy text-white font-extrabold text-xs shadow-md flex items-center justify-between px-1.5"
                >
                  <button
                    onClick={() => updateQuantity(dish.id, quantity - 1)}
                    className="w-5 h-5 rounded hover:bg-black/20 flex items-center justify-center transition-transform active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3 stroke-[3]" />
                  </button>
                  <span className="text-xs font-black select-none">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(dish.id, quantity + 1)}
                    className="w-5 h-5 rounded hover:bg-black/20 flex items-center justify-center transition-transform active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              )
            ) : (
              <div className="w-full h-6 rounded-md bg-stone-200 text-slate-400 font-bold text-[9px] uppercase tracking-wider flex items-center justify-center">
                Unavailable
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Dish Details Modal / Bottom Sheet */}
      <DishDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        dish={dish}
      />
    </>
  );
};
