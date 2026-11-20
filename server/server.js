const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

const { connectDB, getDBStatus } = require('./config/db');
const menuRoutes = require('./routes/menuRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Helper to find local Wi-Fi / LAN IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let fallbackIp = '127.0.0.1';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prioritize Wi-Fi or Wireless interface
        if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless') || name.toLowerCase().includes('wlan')) {
          return iface.address;
        }
        fallbackIp = iface.address;
      }
    }
  }
  return fallbackIp;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directory exists
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve uploaded dish images statically
app.use('/uploads', express.static(uploadsPath));

// Serve public assets (such as Hotel Kubera logo)
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use('/public', express.static(publicPath));
}

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Network IP helper endpoint for mobile devices on same Wi-Fi
app.get('/api/network-ip', (req, res) => {
  const localIp = getLocalIpAddress();
  res.json({
    ip: localIp,
    clientUrl: `http://${localIp}:5173`,
    serverUrl: `http://${localIp}:${PORT}`,
    hostname: os.hostname()
  });
});

// Health & System status check
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'online',
    restaurant: 'Hotel Kubera (Eluru)',
    tagline: 'Taste the Wealth of Flavours',
    database: dbStatus,
    localIp: getLocalIpAddress(),
    timestamp: new Date().toISOString()
  });
});

// Production: Serve React frontend build if present
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start Server on 0.0.0.0
const startServer = async () => {
  await connectDB();
  const localIp = getLocalIpAddress();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🏛️  HOTEL KUBERA (ELURU) - DIGITAL QR SYSTEM ONLINE          ║
║   💎 "Taste the Wealth of Flavours"                            ║
║                                                                ║
║   Local:         http://localhost:${PORT}                         ║
║   Same Wi-Fi:    http://${localIp}:${PORT}                     ║
║   Mobile Menu:   http://${localIp}:5173                        ║
║   Database Mode: ${getDBStatus().mode.toUpperCase()}                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
  });
};

startServer();

module.exports = app;
