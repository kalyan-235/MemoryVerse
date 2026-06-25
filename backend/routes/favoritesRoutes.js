const express = require('express');
const router  = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const {
  getFavoriteMemories, getFavoriteDiaries,
  getFavoriteStories, toggleFavoriteStory,
} = require('../controllers/favoritesController');

router.use(protectRoute);

router.get('/memories', getFavoriteMemories);
router.get('/diaries',  getFavoriteDiaries);
router.get('/stories',  getFavoriteStories);
router.patch('/stories/:id/toggle', toggleFavoriteStory);

module.exports = router;
