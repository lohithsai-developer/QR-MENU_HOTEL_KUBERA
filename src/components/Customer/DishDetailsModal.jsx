import React from 'react';
import { X, Plus, Minus, Clock, Users, Flame, Award, Sparkles, ChefHat } from 'lucide-react';
import { VegBadge } from '../Common/VegBadge';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../services/api';

export const DishDetailsModal = ({ isOpen, onClose, dish }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  if (!isOpen || !dish) return null;

  const cartItem = cartItems.find((i) => i.id === dish.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const imageUrl = getImageUrl(dish.image);

  // Process all tags
  const tagsList = Array.isArray(dish.tags) ? [...dish.tags] : [];
  if (dish.isChefSpecial && !tagsList.includes('Chef Special')) {
    tagsList.push('Chef Special');
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Dialog */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Top Image Banner */}
        <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-slate-400 p-4 text-center">
              <span className="text-4xl mb-1">🍽️</span>
              <span className="text-xs font-serif font-bold text-slate-500">HOTEL KUBERA KITCHEN</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-xs z-10"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges on Top Left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 flex-wrap max-w-[80%]">
            <VegBadge isVeg={dish.isVeg} size="md" />

            {tagsList.map((tag, idx) => {
              const lower = tag.toLowerCase();
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                    lower.includes('bestseller')
                      ? 'bg-amber-500'
                      : lower.includes('recommend') || lower.includes('chef')
                      ? 'bg-kubera-burgundy'
                      : 'bg-emerald-600'
                  }`}
                >
                  {lower.includes('bestseller') && <Flame className="w-2.5 h-2.5 fill-white" />}
                  {lower.includes('recommend') && <Award className="w-2.5 h-2.5 text-amber-200" />}
                  {lower.includes('must try') && <Sparkles className="w-2.5 h-2.5" />}
                  <span>{tag}</span>
                </span>
              );
            })}
          </div>

          {/* Title & Price on Image Bottom */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-0.5">
              {dish.category}
            </span>
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-base sm:text-lg font-serif font-bold leading-tight drop-shadow-sm">
                {dish.name}
              </h2>
              <span className="text-lg font-extrabold text-amber-300 drop-shadow-sm whitespace-nowrap">
                ₹{dish.price}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Key Attributes Row: Portion, Spice Level, Prep Time */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
            {/* Portion / Serving */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Portion
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>{dish.servingSize || 'Serves 1-2'}</span>
              </div>
            </div>

            {/* Spice Level */}
            <div className="space-y-0.5 border-x border-stone-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Spice Level
              </span>
              <span className="text-xs font-bold text-slate-800">
                {dish.spiceLevel === 'Extra Spicy'
                  ? '🌶️🌶️ Fiery'
                  : dish.spiceLevel === 'Spicy'
                  ? '🌶️ Spicy'
                  : '🌱 Mild'}
              </span>
            </div>

            {/* Preparation Time */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Prep Time
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 justify-center">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{dish.preparationTime || '15-20m'}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-kubera-burgundy" />
              <span>Description & Culinary Preparation</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal bg-stone-50/60 p-3 rounded-xl border border-stone-100">
              {dish.description ||
                'Prepared fresh to order using Hotel Kubera royal recipes, locally ground coastal Godavari masalas, and pristine ingredients.'}
            </p>
          </div>

          {/* Dietary & Freshness Note */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-2">
            <span className="text-base">✨</span>
            <p className="leading-snug">
              Freshly prepared by our culinary team upon order. Served piping hot to your table.
            </p>
          </div>
        </div>

        {/* Bottom Sticky Action Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Price
            </span>
            <span className="text-base font-extrabold text-kubera-burgundy">
              ₹{dish.price}
            </span>
          </div>

          {dish.isAvailable ? (
            quantity === 0 ? (
              <button
                onClick={() => addToCart(dish)}
                className="py-2.5 px-5 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />
                <span>Add to Selection</span>
              </button>
            ) : (
              <div className="h-9 px-3 rounded-xl bg-kubera-burgundy text-white font-extrabold text-xs shadow-md flex items-center justify-between gap-3">
                <button
                  onClick={() => updateQuantity(dish.id, quantity - 1)}
                  className="w-6 h-6 rounded hover:bg-black/20 flex items-center justify-center transition-transform active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="text-xs font-black select-none">{quantity} in Shortlist</span>
                <button
                  onClick={() => updateQuantity(dish.id, quantity + 1)}
                  className="w-6 h-6 rounded hover:bg-black/20 flex items-center justify-center transition-transform active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            )
          ) : (
            <div className="py-2 px-4 rounded-xl bg-stone-100 border border-stone-200 text-slate-400 font-bold text-xs uppercase tracking-wider">
              Currently Sold Out
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
