import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Check, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const EMOJI_PRESETS = ['🍢', '🔥', '🍛', '🍚', '🥣', '🫓', '🍨', '☕', '🍗', '🐟', '🥗', '🥘', '🥟', '🍤'];

export const CategoryManager = ({ categories, onRefreshCategories, dishes }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍢');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setName('');
    setIcon('🍢');
    setDescription('');
    setError('');
  };

  const handleOpenEdit = (cat) => {
    setIsAdding(false);
    setEditingId(cat.id || cat._id);
    setName(cat.name);
    setIcon(cat.icon || '🍽️');
    setDescription(cat.description || '');
    setError('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (editingId) {
        const res = await api.updateCategory(editingId, {
          name: name.trim(),
          icon,
          description: description.trim()
        });
        if (res.success) {
          onRefreshCategories();
          handleCancel();
        } else {
          setError(res.message || 'Failed to update category');
        }
      } else {
        const res = await api.createCategory({
          name: name.trim(),
          icon,
          description: description.trim()
        });
        if (res.success) {
          onRefreshCategories();
          handleCancel();
        } else {
          setError(res.message || 'Failed to add category');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Server error occurred while saving category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    const catId = cat.id || cat._id;
    const catName = cat.name;

    // Check if dishes belong to this category
    const count = dishes.filter(d => d.category.toLowerCase() === catName.toLowerCase()).length;
    const confirmMsg = count > 0
      ? `Category "${catName}" has ${count} dish(es) assigned to it. Are you sure you want to delete it?`
      : `Are you sure you want to delete category "${catName}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.deleteCategory(catId);
      if (res.success) {
        onRefreshCategories();
      } else {
        alert(res.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Banner & Add Button */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-kubera-burgundy" />
            Menu Category Manager
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage sections (e.g. Tikkas, Starters, Biryanis, Andhra Specials)
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleOpenAdd}
            className="py-2 px-3.5 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs sm:text-sm font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-200 stroke-[2.5]" />
            <span>Add New Category</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Card */}
      {(isAdding || editingId) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-kubera-burgundy/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="font-bold text-sm text-slate-900">
              {editingId ? 'Edit Category' : 'Create New Menu Category'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category Name * (e.g. Tikkas, Starters, Soups)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tikkas & Kebabs"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-kubera-burgundy focus:outline-none text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category Icon Emoji
                </label>
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl border border-stone-200 shrink-0">
                    {icon}
                  </span>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {EMOJI_PRESETS.slice(0, 10).map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setIcon(em)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition-all ${
                          icon === em ? 'border-kubera-burgundy bg-amber-50 shadow-2xs' : 'border-stone-200 bg-stone-50'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category Description / Tagline (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Charcoal-grilled royal tikkas & juicy kebabs"
                className="w-full p-2 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="py-2 px-3.5 rounded-xl bg-stone-100 text-slate-700 text-xs font-semibold hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="py-2 px-4 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-amber-200" />
                <span>{editingId ? 'Save Changes' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid (Mobile Friendly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const catName = typeof cat === 'string' ? cat : cat.name;
          const catIcon = typeof cat === 'object' && cat.icon ? cat.icon : '🍽️';
          const catDesc = typeof cat === 'object' && cat.description ? cat.description : '';
          const count = dishes.filter(d => d.category.toLowerCase() === catName.toLowerCase()).length;

          return (
            <div
              key={cat.id || cat._id || catName}
              className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between gap-3 hover:border-stone-300 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                  {catIcon}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {catName}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {catDesc || `${count} dish(es) listed`}
                  </p>
                  <span className="text-[10px] font-semibold text-kubera-burgundy">
                    {count} dishes
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
