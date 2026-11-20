const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem
} = require('../controllers/menuController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Admin protected routes
router.post('/', verifyAdmin, createMenuItem);
router.put('/:id', verifyAdmin, updateMenuItem);
router.patch('/:id/toggle-stock', verifyAdmin, toggleStock);
router.delete('/:id', verifyAdmin, deleteMenuItem);

module.exports = router;
