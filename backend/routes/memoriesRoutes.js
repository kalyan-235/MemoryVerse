const express = require('express');
const router  = express.Router();
const { protectRoute }      = require('../middleware/authMiddleware');
const { uploadMemoryMedia } = require('../config/cloudinary');
const {
  getAllMemories, getMemoryById, createMemory, updateMemory,
  deleteMemory, toggleFavoriteMemory, getFavoriteMemories,
  getMemoriesByDate, getCalendarDates, getMemoriesByCollection,
} = require('../controllers/memoriesController');

router.use(protectRoute);

// Named routes before /:id
router.get('/favorites',                getFavoriteMemories);
router.get('/by-date',                  getMemoriesByDate);
router.get('/calendar-dates',           getCalendarDates);
router.get('/collection/:collectionId', getMemoriesByCollection);
router.get('/',    getAllMemories);
router.get('/:id', getMemoryById);

// POST — multer reads file into memory buffer, then controller uploads to Cloudinary
// Works for both multipart/form-data (with image) and application/json (text only)
router.post('/',
  (req, res, next) => {
    const ct = req.headers['content-type'] || '';
    if (!ct.includes('multipart/form-data')) {
      // JSON request (no file) — skip multer
      return next();
    }
    // Multipart — store file buffer in memory
    uploadMemoryMedia.single('mediaFile')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error:', err.message);
        // Don't fail — continue without file
      }
      next();
    });
  },
  createMemory,
);

router.put('/:id',            updateMemory);
router.delete('/:id',         deleteMemory);
router.patch('/:id/favorite', toggleFavoriteMemory);

module.exports = router;
