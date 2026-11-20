// API Service for Hotel Kubera
const PROD_RENDER_URL = 'https://qr-menu-hotel-kubera.onrender.com';
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_API_URL || 
  (!isLocalhost ? PROD_RENDER_URL : '');

export const BACKEND_URL = RAW_BACKEND_URL ? RAW_BACKEND_URL.replace(/\/$/, '') : '';
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  if (BACKEND_URL) {
    return `${BACKEND_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
  return imagePath;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('kubera_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // --- Menu ---
  async getMenu(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.isVeg !== undefined && params.isVeg !== '') query.append('isVeg', params.isVeg);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/menu?${query.toString()}`);
    return res.json();
  },

  async createDish(dishData) {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(dishData)
    });
    return res.json();
  },

  async updateDish(id, updates) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async toggleStock(id) {
    const res = await fetch(`${API_BASE}/menu/${id}/toggle-stock`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  async deleteDish(id) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  // --- Category CRUD ---
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  async createCategory(categoryData) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(categoryData)
    });
    return res.json();
  },

  async updateCategory(id, updates) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  // --- Image Upload ---
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    });
    return res.json();
  },

  // --- Orders & Waiter Calls ---
  async placeOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  async getOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);

    const res = await fetch(`${API_BASE}/orders?${query.toString()}`);
    return res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/orders/stats`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  // --- Network & Wi-Fi IP ---
  async getNetworkIp() {
    try {
      const res = await fetch(`${API_BASE}/network-ip`);
      return await res.json();
    } catch {
      return { ip: '192.168.1.4', clientUrl: 'http://192.168.1.4:5173' };
    }
  },

  // --- Auth ---
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Server communication error: ' + err.message };
    }
  },

  async verifyAuth() {
    const token = localStorage.getItem('kubera_admin_token');
    if (!token) return { success: false };

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      return res.json();
    } catch {
      return { success: false };
    }
  },

  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.json();
    } catch {
      return { status: 'offline' };
    }
  }
};
