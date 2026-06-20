const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const { uploadMemoryMedia } = require('../config/cloudinary');
const {
  getAllMemories, getMemoryById, createMemory, updateMemory,
  deleteMemory, toggleFavoriteMemory, getFavoriteMemories,
  getMemoriesByDate, getCalendarDates, getMemoriesByCollection,
} = require('../controllers/memoriesController');

// All routes require authentication
router.use(protectRoute);

router.get('/favorites',              getFavoriteMemories);
router.get('/by-date',                getMemoriesByDate);
router.get('/calendar-dates',         getCalendarDates);
router.get('/collection/:collectionId', getMemoriesByCollection);
router.get('/',                       getAllMemories);
router.get('/:id',                    getMemoryById);
router.post('/', uploadMemoryMedia.single('mediaFile'), createMemory);
router.put('/:id',                    updateMemory);
router.delete('/:id',                 deleteMemory);
router.patch('/:id/favorite',         toggleFavoriteMemory);

module.exports = router;
