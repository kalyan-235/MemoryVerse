const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const {
  getAllDiaryEntries, getDiaryEntryById, getDiaryEntriesByDate,
  createDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
  toggleFavoriteDiaryEntry, searchDiaryEntries,
} = require('../controllers/diaryController');

router.use(protectRoute);

router.get('/search',    searchDiaryEntries);
router.get('/by-date',   getDiaryEntriesByDate);
router.get('/',          getAllDiaryEntries);
router.get('/:id',       getDiaryEntryById);
router.post('/',         createDiaryEntry);
router.put('/:id',       updateDiaryEntry);
router.delete('/:id',    deleteDiaryEntry);
router.patch('/:id/favorite', toggleFavoriteDiaryEntry);

module.exports = router;
