const express = require('express');
const router = express.Router();
const { cloudinary } = require('../config/cloudinary');

// GET /api/test/cloudinary  — verifies credentials work
router.get('/cloudinary', async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ status: '✅ Cloudinary connected', result });
  } catch (err) {
    res.status(500).json({ status: '❌ Cloudinary failed', error: err.message });
  }
});

module.exports = router;
