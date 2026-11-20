const Order = require('../models/Order');
const localStore = require('../data/localStore');
const { getDBStatus } = require('../config/db');

// @desc    Place a new customer order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { tableNumber, items, customerNotes, customerName, customerPhone } = req.body;

    if (!tableNumber) {
      return res.status(400).json({ success: false, message: 'Table number is required to place an order.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    // Calculate subtotal & GST
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST (Restaurant standard)
    const totalAmount = subtotal + tax;

    const orderNumber = 'KUB-' + Math.floor(1000 + Math.random() * 9000);

    const orderPayload = {
      orderNumber,
      tableNumber: String(tableNumber),
      customerName: customerName || 'Guest',
      customerPhone: customerPhone || '',
      items: items.map(i => ({
        menuItemId: i.id || i.menuItemId || i._id,
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity),
        isVeg: i.isVeg !== undefined ? i.isVeg : true,
        specialInstructions: i.specialInstructions || ''
      })),
      subtotal,
      tax,
      totalAmount,
      customerNotes: customerNotes || '',
      status: 'pending',
      paymentStatus: 'unpaid'
    };

    const { connected } = getDBStatus();
    if (connected) {
      const order = await Order.create(orderPayload);
      return res.status(201).json({
        success: true,
        message: `Order #${order.orderNumber} placed successfully for Table ${tableNumber}! Sent directly to kitchen.`,
        data: order
      });
    }

    const order = localStore.createOrder(orderPayload);
    return res.status(201).json({
      success: true,
      message: `Order #${order.orderNumber} placed successfully for Table ${tableNumber}! Sent directly to kitchen.`,
      data: order
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
  }
};

// @desc    Get all orders (with filters)
// @route   GET /api/orders
// @access  Admin Protected / Public (for table tracker)
const getOrders = async (req, res) => {
  try {
    const { tableNumber, status } = req.query;
    const { connected } = getDBStatus();

    if (connected) {
      const filter = {};
      if (tableNumber) filter.tableNumber = String(tableNumber);
      if (status && status !== 'all') filter.status = status;

      const orders = await Order.find(filter).sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    }

    const orders = localStore.getOrders({ tableNumber, status });
    return res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

// @desc    Update order status (pending -> preparing -> completed -> cancelled)
// @route   PATCH /api/orders/:id/status
// @access  Admin Protected
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'preparing', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`
      });
    }

    const { connected } = getDBStatus();
    if (connected) {
      const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({
        success: true,
        message: `Order #${order.orderNumber} status changed to ${status}`,
        data: order
      });
    }

    const order = localStore.updateOrderStatus(id, status);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({
      success: true,
      message: `Order #${order.orderNumber} status changed to ${status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order status', error: error.message });
  }
};

// @desc    Get restaurant statistics
// @route   GET /api/orders/stats
// @access  Admin Protected
const getStats = async (req, res) => {
  try {
    const { connected } = getDBStatus();
    let orders = [];

    if (connected) {
      orders = await Order.find();
    } else {
      orders = localStore.getOrders();
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const preparingOrders = orders.filter(o => o.status === 'preparing').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const activeTables = Array.from(
      new Set(
        orders
          .filter(o => o.status === 'pending' || o.status === 'preparing')
          .map(o => o.tableNumber)
      )
    );

    return res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        preparingOrders,
        completedOrders,
        totalRevenue,
        activeTablesCount: activeTables.length,
        activeTables
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving stats', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  getStats
};
