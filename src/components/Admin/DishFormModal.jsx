import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, Check, AlertCircle, Link, Users, Plus, Tag } from 'lucide-react';
import { api } from '../../services/api';

const PRESET_DISH_IMAGES = [
  { label: 'Biryani / Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Prawns / Seafood', url: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Paneer / Veg Curry', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Tandoori Tikka', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80' },
  { label: 'Chicken Curry', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80' },
  { label: 'Naan / Breads', url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80' },
  { label: 'Dessert / Sweet', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80' },
  { label: 'Coffee / Drink', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' }
];

const SERVING_SIZE_PRESETS = ['Serves 1-2', 'Serves 2-3', 'Serves 1', 'Serves 3-4 (Family Pack)'];
const POPULAR_TAG_PRESETS = ['Bestseller', 'Recommended', 'Must Try', 'Chef Special', 'House Signature'];

export const DishFormModal = ({ isOpen, onClose, dishToEdit, onDishSaved, categories }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCatInput, setShowCustomCatInput] = useState(false);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [servingSize, setServingSize] = useState('Serves 1-2');
  const [tags, setTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [preparationTime, setPreparationTime] = useState('15-20 mins');

  // Image Upload State
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const categoryNames = categories.map(c => typeof c === 'string' ? c : c.name).filter(c => c !== 'All');

  useEffect(() => {
    if (dishToEdit) {
      setName(dishToEdit.name || '');
      setCategory(dishToEdit.category || 'Main Course');
      setPrice(dishToEdit.price || '');
      setDescription(dishToEdit.description || '');
      setIsVeg(dishToEdit.isVeg !== undefined ? dishToEdit.isVeg : true);
      setSpiceLevel(dishToEdit.spiceLevel || 'Medium');
      setServingSize(dishToEdit.servingSize || 'Serves 1-2');
      setTags(Array.isArray(dishToEdit.tags) ? [...dishToEdit.tags] : []);
      setIsChefSpecial(Boolean(dishToEdit.isChefSpecial));
      setIsAvailable(dishToEdit.isAvailable !== undefined ? dishToEdit.isAvailable : true);
      setPreparationTime(dishToEdit.preparationTime || '15-20 mins');
      setImageUrl(dishToEdit.image || '');
      setPreviewUrl(dishToEdit.image || '');
      setSelectedFile(null);
      setShowCustomCatInput(false);
    } else {
      setName('');
      setCategory(categoryNames[0] || 'Main Course');
      setCustomCategory('');
      setShowCustomCatInput(false);
      setPrice('');
      setDescription('');
      setIsVeg(true);
      setSpiceLevel('Medium');
      setServingSize('Serves 1-2');
      setTags(['Bestseller']);
      setIsChefSpecial(false);
      setIsAvailable(true);
      setPreparationTime('15-20 mins');
      setImageUrl('');
      setSelectedFile(null);
      setPreviewUrl('');
    }
    setError('');
  }, [dishToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, WEBP)');
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setError('');
    }
  };

  const handleToggleTag = (tag) => {
    setTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setError('Dish name and price are required.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      let finalImageUrl = imageUrl;

      if (selectedFile) {
        const uploadRes = await api.uploadImage(selectedFile);
        if (uploadRes.success && uploadRes.imageUrl) {
          finalImageUrl = uploadRes.imageUrl;
        } else {
          throw new Error(uploadRes.message || 'Image upload failed');
        }
      }

      const finalCategory = showCustomCatInput && customCategory.trim() ? customCategory.trim() : category;

      if (showCustomCatInput && customCategory.trim()) {
        try {
          await api.createCategory({ name: customCategory.trim() });
        } catch {
          // ignore duplicate
        }
      }

      const payload = {
        name: name.trim(),
        category: finalCategory || 'Main Course',
        price: Number(price),
        description: description.trim(),
        isVeg: Boolean(isVeg),
        spiceLevel,
        servingSize: servingSize.trim() || 'Serves 1-2',
        tags: tags,
        isChefSpecial: tags.includes('Chef Special') || tags.includes('Recommended') || Boolean(isChefSpecial),
        isAvailable: Boolean(isAvailable),
        preparationTime,
        image: finalImageUrl
      };

      let result;
      if (dishToEdit) {
        result = await api.updateDish(dishToEdit.id || dishToEdit._id, payload);
      } else {
        result = await api.createDish(payload);
      }

      if (result.success) {
        onDishSaved(result.data);
        onClose();
      } else {
        setError(result.message || 'Failed to save dish');
      }
    } catch (err) {
      console.error('Save dish error:', err);
      setError(err.message || 'An error occurred while saving the dish.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-2.5 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 z-10 max-h-[94vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-kubera-burgundy">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">
                {dishToEdit ? 'Edit Menu Dish' : 'Add New Dish to Hotel Kubera Menu'}
              </h2>
              <p className="text-xs text-slate-500">
                Update dish details, portion serving size, highlights & photography
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dish Image Section */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-kubera-burgundy" /> Dish Photography (Added by Admin)
              </label>

              <div className="flex bg-stone-200/80 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    imageTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    imageTab === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* Preview Box */}
              <div className="aspect-[16/10] sm:aspect-square w-full rounded-xl bg-white border border-stone-200 overflow-hidden relative flex items-center justify-center shadow-xs">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewUrl('')}
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400 text-xs">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <span>No Image Selected</span>
                  </div>
                )}
              </div>

              {/* Input & Upload Controls */}
              <div className="sm:col-span-2 space-y-2">
                {imageTab === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 hover:border-kubera-burgundy bg-white hover:bg-stone-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4 text-kubera-burgundy" />
                      <span>{selectedFile ? selectedFile.name : 'Choose Image File from Computer...'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP (Max 10MB). Stored securely on the server.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setPreviewUrl(e.target.value);
                        }}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-stone-200 text-slate-800 focus:border-kubera-burgundy"
                      />
                    </div>
                  </div>
                )}

                {/* Preset Suggestions */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1 font-medium">
                    Or select high-res food photo:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_DISH_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.url);
                          setPreviewUrl(preset.url);
                          setSelectedFile(null);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] bg-white hover:bg-stone-100 text-slate-700 hover:text-kubera-burgundy border border-stone-200 shadow-2xs font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dish Details: Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Murgh Malai Tikka"
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 focus:border-kubera-burgundy focus:outline-none text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Price (in ₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="350"
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 focus:border-kubera-burgundy focus:outline-none text-kubera-burgundy font-extrabold"
              />
            </div>
          </div>

          {/* Category & Portion Serving Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomCatInput(!showCustomCatInput)}
                  className="text-[11px] text-kubera-burgundy hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showCustomCatInput ? 'Select Existing' : '+ New Category'}</span>
                </button>
              </div>

              {showCustomCatInput ? (
                <input
                  type="text"
                  placeholder="e.g. Tikkas, Starters, Kebabs"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-white border border-stone-300 text-slate-900 font-medium focus:border-kubera-burgundy"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 text-slate-900 font-medium"
                >
                  {categoryNames.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                Portion / Serving Size (e.g. Serves 1-2)
              </label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="e.g. Serves 1-2"
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 focus:border-kubera-burgundy text-slate-900 font-medium"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {SERVING_SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setServingSize(preset)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${servingSize === preset ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-stone-50 text-slate-600 border-stone-200'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Special Tags Section (Bestseller, Recommended, Must Try) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-kubera-burgundy" /> Dish Badges & Tags (Bestseller, Recommended, etc.)
            </label>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAG_PRESETS.map((t) => {
                const isSelected = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleToggleTag(t)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${
                      isSelected
                        ? t === 'Bestseller'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : t === 'Recommended'
                          ? 'bg-kubera-burgundy text-white border-kubera-maroon shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input & Selected Chips */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag(e);
                  }
                }}
                placeholder="Type custom tag & press Add (e.g. Signature, Kid's Choice)..."
                className="flex-1 p-2 text-xs rounded-xl bg-white border border-stone-200 text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-semibold text-xs border border-stone-300"
              >
                Add Tag
              </button>
            </div>

            {/* Active Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-semibold self-center">Active Tags:</span>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-800 border border-stone-300 shadow-2xs"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dietary Type & Spice Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dietary Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsVeg(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    isVeg
                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-slate-600 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-white' : 'bg-emerald-600'}`}></span>
                  Vegetarian
                </button>
                <button
                  type="button"
                  onClick={() => setIsVeg(false)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    !isVeg
                      ? 'bg-rose-700 border-rose-800 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-slate-600 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${!isVeg ? 'bg-white' : 'bg-rose-600'}`}></span>
                  Non-Veg
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Spice Level
              </label>
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-white border border-stone-200 text-slate-800 font-medium"
              >
                <option value="Mild">🌱 Mild (Kid friendly)</option>
                <option value="Medium">🌶️ Medium Spiced</option>
                <option value="Spicy">🌶️🌶️ Authentic Andhra Spicy</option>
                <option value="Extra Spicy">🔥 Extra Fiery</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Dish Description & Ingredients
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the royal flavours, marinade, and presentation..."
              className="w-full p-2.5 text-xs rounded-xl bg-white border border-stone-200 focus:border-kubera-burgundy focus:outline-none text-slate-800"
            />
          </div>

          {/* In Stock Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold">In Stock (Available for shortlisting)</span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-stone-200 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-stone-100 text-slate-700 hover:bg-stone-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Dish...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-200" />
                  <span>{dishToEdit ? 'Save Changes' : 'Add Dish to Menu'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
