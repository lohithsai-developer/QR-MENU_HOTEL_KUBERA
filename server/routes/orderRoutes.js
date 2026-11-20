const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getStats
} = require('../controllers/orderController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public route to place orders & check table orders
router.post('/', createOrder);
router.get('/', getOrders); // Publicly accessible to allow customer table status polling, or admin view

// Admin protected routes
router.patch('/:id/status', verifyAdmin, updateOrderStatus);
router.get('/stats', verifyAdmin, getStats);

module.exports = router;
