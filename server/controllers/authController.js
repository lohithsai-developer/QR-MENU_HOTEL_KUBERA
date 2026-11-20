const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kubera@2026';

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password'
      });
    }

    if (username.trim() !== ADMIN_USERNAME || password.trim() !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials. Please check your username and password.'
      });
    }

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      {
        role: 'admin',
        username: ADMIN_USERNAME,
        restaurant: 'Hotel Kubera (Eluru)'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Authentication successful. Welcome to Hotel Kubera Admin Portal.',
      token,
      admin: {
        username: ADMIN_USERNAME,
        role: 'admin',
        restaurant: 'Hotel Kubera (Eluru)'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication', error: error.message });
  }
};

// @desc    Verify current session
// @route   GET /api/auth/me
// @access  Admin Protected
const getMe = async (req, res) => {
  return res.json({
    success: true,
    admin: req.admin
  });
};

module.exports = { login, getMe };
