import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Users, Flame, Award, Sparkles, Check, X, Tag } from 'lucide-react';
import { VegBadge } from '../Common/VegBadge';
import { DishFormModal } from './DishFormModal';
import { api, getImageUrl } from '../../services/api';

export const MenuManager = ({ dishes, categories, onRefreshMenu }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegFilter, setVegFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  // Normalize category names
  const categoryNames = [
    'All',
    ...categories.map(c => typeof c === 'string' ? c : c.name).filter(c => c !== 'All')
  ];

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategory === 'All' || dish.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesVeg =
      vegFilter === '' ||
      (vegFilter === 'true' && dish.isVeg) ||
      (vegFilter === 'false' && !dish.isVeg);
    const matchesSearch =
      !searchQuery ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (Array.isArray(dish.tags) && dish.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesVeg && matchesSearch;
  });

  const handleToggleStock = async (id) => {
    try {
      const res = await api.toggleStock(id);
      if (res.success) {
        onRefreshMenu();
      }
    } catch (err) {
      console.error('Toggle stock failed:', err);
    }
  };

  const handleDeleteDish = async (id, dishName) => {
    if (!window.confirm(`Are you sure you want to remove "${dishName}" from Hotel Kubera menu?`)) return;
    try {
      const res = await api.deleteDish(id);
      if (res.success) {
        onRefreshMenu();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingDish(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Filter & Add Dish Card */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
        {/* Row 1: Search Box & Add Dish Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name or tag..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-kubera-burgundy focus:outline-none text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Add Dish Action Button */}
          <button
            onClick={handleAddNew}
            className="py-2 px-3.5 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs sm:text-sm font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-200 stroke-[2.5]" />
            <span>Add New Dish</span>
          </button>
        </div>

        {/* Row 2: Category Scroll & Veg/Non-Veg Filter */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 flex-wrap sm:flex-nowrap">
          {/* Categories Pill Strip */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-kubera-burgundy text-white shadow-2xs'
                    : 'bg-stone-100 text-slate-600 hover:text-slate-900 border border-stone-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Veg / Non-Veg Pill */}
          <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs shrink-0 ml-auto">
            <button
              onClick={() => setVegFilter('')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${vegFilter === '' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('true')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${vegFilter === 'true' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'}`}
            >
              Veg
            </button>
            <button
              onClick={() => setVegFilter('false')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${vegFilter === 'false' ? 'bg-rose-700 text-white shadow-2xs' : 'text-slate-600'}`}
            >
              Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Dish Count Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-700">
          Showing {filteredDishes.length} Dish{filteredDishes.length === 1 ? '' : 'es'}
        </span>
        <span className="text-[11px] text-slate-400">
          Hotel Kubera Master Kitchen
        </span>
      </div>

      {/* ================= MOBILE VIEW: RESPONSIVE CARDS (block md:hidden) ================= */}
      <div className="block md:hidden space-y-2.5">
        {filteredDishes.length === 0 ? (
          <div className="py-12 text-center bg-white border border-stone-200 rounded-2xl p-4 text-slate-500 text-xs">
            No dishes found matching your search.
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const dishId = dish.id || dish._id;
            const tags = Array.isArray(dish.tags) ? dish.tags : [];

            return (
              <div
                key={dishId}
                className={`p-3 rounded-2xl bg-white border transition-all ${
                  !dish.isAvailable ? 'border-red-200 bg-red-50/20' : 'border-stone-200/90 shadow-2xs'
                }`}
              >
                {/* Top Section: Photo + Info + Price */}
                <div className="flex items-start gap-2.5">
                  {/* Photo */}
                  <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 relative">
                    {dish.image ? (
                      <img
                        src={getImageUrl(dish.image)}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        🍲
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <VegBadge isVeg={dish.isVeg} size="sm" />
                        <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                          {dish.name}
                        </h4>
                      </div>
                      <span className="font-extrabold text-kubera-burgundy text-sm whitespace-nowrap">
                        ₹{dish.price}
                      </span>
                    </div>

                    {/* Category & Portion Size Badges */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-slate-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/60">
                        {dish.category}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <Users className="w-2.5 h-2.5 text-amber-700" />
                        <span>{dish.servingSize || 'Serves 1-2'}</span>
                      </span>
                      {tags.slice(0, 1).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Short Description */}
                    {dish.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                        {dish.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Strip: Stock Status Toggle + Edit & Delete */}
                <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-stone-100">
                  {/* Stock Toggle Button */}
                  <button
                    onClick={() => handleToggleStock(dishId)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      dish.isAvailable
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 active:bg-emerald-100 shadow-2xs'
                        : 'bg-rose-50 border-rose-300 text-rose-800 active:bg-rose-100'
                    }`}
                  >
                    {dish.isAvailable ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>In Stock</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                        <span>Sold Out</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleEdit(dish)}
                    className="p-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-stone-200"
                    title="Edit Dish"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteDish(dishId, dish.name)}
                    className="p-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center transition-colors border border-rose-200"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= DESKTOP VIEW: FULL DATA TABLE (hidden md:block) ================= */}
      <div className="hidden md:block rounded-2xl bg-white border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-stone-200 font-bold">
              <tr>
                <th className="py-3 px-4">Dish & Photography</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Portion Size</th>
                <th className="py-3 px-4">Price (₹)</th>
                <th className="py-3 px-4 text-center">Availability Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDishes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No dishes found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDishes.map((dish) => {
                  const dishId = dish.id || dish._id;
                  const tags = Array.isArray(dish.tags) ? dish.tags : [];

                  return (
                    <tr
                      key={dishId}
                      className="hover:bg-stone-50/70 transition-colors"
                    >
                      {/* Name, Photo & Tags */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 relative">
                            {dish.image ? (
                              <img
                                src={getImageUrl(dish.image)}
                                alt={dish.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&auto=format&fit=crop&q=80';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-base">
                                🍲
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <VegBadge isVeg={dish.isVeg} size="sm" />
                              <span className="font-bold text-slate-900">
                                {dish.name}
                              </span>
                            </div>

                            {/* Tags in Table */}
                            {tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                {tags.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                              {dish.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-xs font-semibold">
                          {dish.category}
                        </span>
                      </td>

                      {/* Portion / Serving Size */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                          <Users className="w-3 h-3 text-amber-700" />
                          {dish.servingSize || 'Serves 1-2'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-extrabold text-kubera-burgundy whitespace-nowrap text-sm">
                        ₹{dish.price}
                      </td>

                      {/* In Stock / Sold Out Toggle */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStock(dishId)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            dish.isAvailable
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-2xs'
                              : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          {dish.isAvailable ? '✓ In Stock' : '✗ Sold Out'}
                        </button>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(dish)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
                            title="Edit Dish"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dishId, dish.name)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Dish Modal */}
      <DishFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        dishToEdit={editingDish}
        onDishSaved={() => {
          setIsFormOpen(false);
          onRefreshMenu();
        }}
        categories={categories}
      />
    </div>
  );
};
