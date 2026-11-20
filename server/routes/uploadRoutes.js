const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/uploadMiddleware');
const { verifyAdmin } = require('../middleware/authMiddleware');

// @desc    Upload dish image file
// @route   POST /api/upload
// @access  Admin Protected
router.post('/', verifyAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading dish image'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select an image file.'
      });
    }

    // Relative URL that will be served statically
    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: 'Dish image uploaded successfully!',
      imageUrl: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// @desc    Direct base64 image upload fallback
// @route   POST /api/upload/base64
// @access  Admin Protected
router.post('/base64', verifyAdmin, (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'Missing base64 data' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid base64 string format' });
    }

    const ext = matches[1].split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const safeFilename = 'dish-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + '.' + ext;
    const uploadDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${safeFilename}`;
    return res.status(201).json({
      success: true,
      message: 'Base64 image saved successfully!',
      imageUrl
    });
  } catch (error) {
    console.error('Base64 upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to process base64 image', error: error.message });
  }
});

module.exports = router;
