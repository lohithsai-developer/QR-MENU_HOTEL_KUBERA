const fs = require('fs');
const path = require('path');

const BACKUP_FILE = path.join(__dirname, 'db_backup.json');
const INITIAL_MENU_FILE = path.join(__dirname, 'initialMenu.json');

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Starters', icon: '🍢', description: 'Crispy appetizers & bites' },
  { id: 'cat-2', name: 'Tikkas', icon: '🔥', description: 'Charcoal-grilled kebabs & tikkas' },
  { id: 'cat-3', name: 'Andhra Specials', icon: '🌶️', description: 'Authentic fiery Godavari delicacies' },
  { id: 'cat-4', name: 'Biryanis & Pulaos', icon: '🍚', description: 'Aromatic slow-cooked dum biryanis' },
  { id: 'cat-5', name: 'Main Course', icon: '🍛', description: 'Rich gravies & royal curries' },
  { id: 'cat-6', name: 'Soups', icon: '🥣', description: 'Warming broths & herbal rasams' },
  { id: 'cat-7', name: 'Breads', icon: '🫓', description: 'Tandoori naans, rotis & parottas' },
  { id: 'cat-8', name: 'Desserts', icon: '🍨', description: 'Traditional royal sweets & kulfi' },
  { id: 'cat-9', name: 'Beverages', icon: '☕', description: 'Authentic filter coffee & coolers' }
];

class LocalStore {
  constructor() {
    this.menuItems = [];
    this.orders = [];
    this.categories = [];
    this.serviceRequests = [];
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
        const data = JSON.parse(raw);
        this.menuItems = data.menuItems || [];
        this.orders = data.orders || [];
        this.categories = data.categories && data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES;
        this.serviceRequests = data.serviceRequests || [];
        console.log(`[LocalStore] Loaded ${this.menuItems.length} menu items, ${this.categories.length} categories, and ${this.orders.length} orders from local file.`);
      } else if (fs.existsSync(INITIAL_MENU_FILE)) {
        const raw = fs.readFileSync(INITIAL_MENU_FILE, 'utf8');
        this.menuItems = JSON.parse(raw);
        this.categories = DEFAULT_CATEGORIES;
        this.orders = [];
        this.serviceRequests = [];
        this.save();
        console.log(`[LocalStore] Seeded ${this.menuItems.length} menu items and ${this.categories.length} categories.`);
      }
    } catch (err) {
      console.error('[LocalStore] Error during init:', err.message);
      this.menuItems = [];
      this.categories = DEFAULT_CATEGORIES;
      this.orders = [];
      this.serviceRequests = [];
    }
  }

  save() {
    try {
      const data = {
        menuItems: this.menuItems,
        categories: this.categories,
        orders: this.orders,
        serviceRequests: this.serviceRequests,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[LocalStore] Error saving to disk:', err.message);
    }
  }

  // --- Category Operations ---
  getCategories() {
    return [...this.categories];
  }

  createCategory(categoryData) {
    const name = categoryData.name ? categoryData.name.trim() : '';
    if (!name) return null;

    // Check duplicate
    const exists = this.categories.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      throw new Error(`Category "${name}" already exists.`);
    }

    const newCategory = {
      id: 'cat-' + Date.now(),
      name,
      icon: categoryData.icon || '🍽️',
      description: categoryData.description || '',
      displayOrder: this.categories.length + 1,
      createdAt: new Date().toISOString()
    };
    this.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  updateCategory(id, updates) {
    const index = this.categories.findIndex(c => c.id === id || c._id === id);
    if (index === -1) return null;

    this.categories[index] = {
      ...this.categories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.categories[index];
  }

  deleteCategory(id) {
    const index = this.categories.findIndex(c => c.id === id || c._id === id);
    if (index === -1) return false;
    this.categories.splice(index, 1);
    this.save();
    return true;
  }

  // --- Menu Operations ---
  getMenuItems(filter = {}) {
    let result = [...this.menuItems];
    if (filter.category && filter.category !== 'All') {
      result = result.filter(item => item.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.isVeg !== undefined && filter.isVeg !== null && filter.isVeg !== '') {
      const isVegBool = filter.isVeg === 'true' || filter.isVeg === true;
      result = result.filter(item => Boolean(item.isVeg) === isVegBool);
    }
    if (filter.search) {
      const query = filter.search.toLowerCase();
      result = result.filter(
        item => item.name.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query))
      );
    }
    return result;
  }

  getMenuItemById(id) {
    return this.menuItems.find(item => item.id === id || item._id === id);
  }

  createMenuItem(itemData) {
    const newItem = {
      id: 'dish-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: itemData.name,
      description: itemData.description || '',
      price: Number(itemData.price),
      category: itemData.category || 'Main Course',
      isVeg: itemData.isVeg === true || itemData.isVeg === 'true',
      spiceLevel: itemData.spiceLevel || 'Medium',
      servingSize: itemData.servingSize || 'Serves 1-2',
      image: itemData.image || '',
      isAvailable: itemData.isAvailable !== undefined ? Boolean(itemData.isAvailable) : true,
      isChefSpecial: Boolean(itemData.isChefSpecial),
      preparationTime: itemData.preparationTime || '15-20 mins',
      tags: Array.isArray(itemData.tags) ? itemData.tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.menuItems.unshift(newItem);
    this.save();
    return newItem;
  }

  updateMenuItem(id, updates) {
    const index = this.menuItems.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.isVeg !== undefined) updates.isVeg = updates.isVeg === true || updates.isVeg === 'true';
    if (updates.isAvailable !== undefined) updates.isAvailable = Boolean(updates.isAvailable);
    if (updates.isChefSpecial !== undefined) updates.isChefSpecial = Boolean(updates.isChefSpecial);
    if (updates.servingSize !== undefined) updates.servingSize = String(updates.servingSize);

    this.menuItems[index] = {
      ...this.menuItems[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.menuItems[index];
  }

  deleteMenuItem(id) {
    const index = this.menuItems.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return false;
    this.menuItems.splice(index, 1);
    this.save();
    return true;
  }

  // --- Order & Waiter Service Call Operations ---
  getOrders(filter = {}) {
    let result = [...this.orders];
    if (filter.status && filter.status !== 'all') {
      result = result.filter(order => order.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id || o._id === id || o.orderNumber === id);
  }

  createOrder(orderData) {
    const orderNumber = 'KUB-' + Math.floor(1000 + Math.random() * 9000);
    const subtotal = Number(orderData.subtotal) || 0;
    const tax = Number(orderData.tax) || Math.round(subtotal * 0.05);
    const totalAmount = Number(orderData.totalAmount) || (subtotal + tax);

    const newOrder = {
      id: 'ord-' + Date.now(),
      orderNumber,
      customerName: orderData.customerName || 'Guest',
      customerPhone: orderData.customerPhone || '',
      tableNumber: orderData.tableNumber ? String(orderData.tableNumber) : 'Dine-In',
      items: Array.isArray(orderData.items) ? orderData.items : [],
      subtotal,
      tax,
      totalAmount,
      customerNotes: orderData.customerNotes || '',
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(id, status) {
    const order = this.orders.find(o => o.id === id || o._id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // Waiter Call / Service Alert
  createServiceRequest(requestData) {
    const request = {
      id: 'req-' + Date.now(),
      type: requestData.type || 'Take Order', // 'Take Order' | 'Water' | 'Bill' | 'Assistance'
      tableNumber: requestData.tableNumber ? String(requestData.tableNumber) : 'General',
      notes: requestData.notes || '',
      itemsCount: requestData.itemsCount || 0,
      estimatedBill: requestData.estimatedBill || 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.serviceRequests.unshift(request);
    this.save();
    return request;
  }

  getServiceRequests() {
    return [...this.serviceRequests];
  }

  updateServiceRequestStatus(id, status) {
    const req = this.serviceRequests.find(r => r.id === id);
    if (!req) return null;
    req.status = status;
    this.save();
    return req;
  }
}

const localStore = new LocalStore();
module.exports = localStore;
