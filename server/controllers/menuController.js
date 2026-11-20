const Menu = require('../models/Menu');
const Category = require('../models/Category');
const localStore = require('../data/localStore');
const { getDBStatus } = require('../config/db');

// @desc    Get all menu items with optional category and search filters
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const { category, isVeg, search } = req.query;
    const { connected } = getDBStatus();

    if (connected) {
      const filter = {};
      if (category && category !== 'All') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }
      if (isVeg !== undefined && isVeg !== '') {
        filter.isVeg = isVeg === 'true';
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      const items = await Menu.find(filter).sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: items.length,
        data: items,
        source: 'mongodb'
      });
    }

    // Local Storage Fallback
    const items = localStore.getMenuItems({
      category,
      isVeg: (isVeg !== undefined && isVeg !== '') ? isVeg : undefined,
      search
    });
    return res.json({
      success: true,
      count: items.length,
      data: items,
      source: 'local_storage'
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve menu items', error: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const { connected } = getDBStatus();

    if (connected) {
      const item = await Menu.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Dish not found' });
      }
      return res.json({ success: true, data: item });
    }

    const item = localStore.getMenuItemById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving dish', error: error.message });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Admin Protected
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isVeg, spiceLevel, servingSize, image, isAvailable, isChefSpecial, preparationTime, tags } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required fields.'
      });
    }

    const dishData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      category: category.trim(),
      isVeg: isVeg === true || isVeg === 'true',
      spiceLevel: spiceLevel || 'Medium',
      servingSize: servingSize ? servingSize.trim() : 'Serves 1-2',
      image: image || '',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isChefSpecial: Boolean(isChefSpecial),
      preparationTime: preparationTime || '15-20 mins',
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags ? tags.split(',').map(t => t.trim()) : [])
    };

    const { connected } = getDBStatus();
    if (connected) {
      const newDish = await Menu.create(dishData);
      return res.status(201).json({
        success: true,
        message: `Dish "${newDish.name}" added successfully`,
        data: newDish
      });
    }

    const newDish = localStore.createMenuItem(dishData);
    return res.status(201).json({
      success: true,
      message: `Dish "${newDish.name}" added successfully to local store`,
      data: newDish
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ success: false, message: 'Failed to create menu item', error: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin Protected
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { connected } = getDBStatus();

    if (connected) {
      const updated = await Menu.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Dish not found' });
      }
      return res.json({ success: true, message: 'Dish updated successfully', data: updated });
    }

    const updated = localStore.updateMenuItem(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }
    return res.json({ success: true, message: 'Dish updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, message: 'Failed to update menu item', error: error.message });
  }
};

// @desc    Toggle dish availability (In Stock / Sold Out)
// @route   PATCH /api/menu/:id/toggle-stock
// @access  Admin Protected
const toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { connected } = getDBStatus();

    if (connected) {
      const item = await Menu.findById(id);
      if (!item) return res.status(404).json({ success: false, message: 'Dish not found' });
      item.isAvailable = !item.isAvailable;
      await item.save();
      return res.json({
        success: true,
        message: `Status updated: ${item.name} is now ${item.isAvailable ? 'In Stock' : 'Sold Out'}`,
        isAvailable: item.isAvailable,
        data: item
      });
    }

    const item = localStore.getMenuItemById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Dish not found' });
    const updated = localStore.updateMenuItem(id, { isAvailable: !item.isAvailable });
    return res.json({
      success: true,
      message: `Status updated: ${updated.name} is now ${updated.isAvailable ? 'In Stock' : 'Sold Out'}`,
      isAvailable: updated.isAvailable,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling availability', error: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin Protected
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { connected } = getDBStatus();

    if (connected) {
      const deleted = await Menu.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Dish not found' });
      return res.json({ success: true, message: 'Dish deleted successfully' });
    }

    const deleted = localStore.deleteMenuItem(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Dish not found' });
    return res.json({ success: true, message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete dish', error: error.message });
  }
};

// ================= CATEGORY CONTROLLER =================

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { connected } = getDBStatus();
    if (connected) {
      const dbCategories = await Category.find().sort({ displayOrder: 1, name: 1 });
      if (dbCategories.length > 0) {
        return res.json({ success: true, data: dbCategories });
      }
    }

    const storeCategories = localStore.getCategories();
    return res.json({ success: true, data: storeCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

// @desc    Create new category (Admin can add Tikkas, Starters, etc.)
// @route   POST /api/categories
// @access  Admin Protected
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const { connected } = getDBStatus();
    if (connected) {
      const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
      if (existing) {
        return res.status(400).json({ success: false, message: `Category "${name}" already exists.` });
      }
      const newCat = await Category.create({
        name: name.trim(),
        icon: icon || '🍽️',
        description: description ? description.trim() : ''
      });
      return res.status(201).json({
        success: true,
        message: `Category "${newCat.name}" added successfully!`,
        data: newCat
      });
    }

    try {
      const newCat = localStore.createCategory({ name, icon, description });
      return res.status(201).json({
        success: true,
        message: `Category "${newCat.name}" added successfully!`,
        data: newCat
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin Protected
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { connected } = getDBStatus();
    if (connected) {
      const updated = await Category.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.json({ success: true, message: 'Category updated successfully', data: updated });
    }

    const updated = localStore.updateCategory(id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, message: 'Category updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin Protected
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { connected } = getDBStatus();
    if (connected) {
      const deleted = await Category.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.json({ success: true, message: 'Category deleted successfully' });
    }

    const deleted = localStore.deleteCategory(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
