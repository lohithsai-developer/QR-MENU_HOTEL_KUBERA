const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/login', (req, res) => {
  // If visited directly in browser, redirect to the visual login page
  res.redirect('/login');
});
router.get('/me', verifyAdmin, getMe);

module.exports = router;
