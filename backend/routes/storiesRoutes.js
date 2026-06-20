const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const {
  getAllStories, getStoryById, createStory, updateStory,
  deleteStory, addChapter, updateChapter, searchStories,
} = require('../controllers/storiesController');

router.use(protectRoute);

router.get('/search',                 searchStories);
router.get('/',                       getAllStories);
router.get('/:id',                    getStoryById);
router.post('/',                      createStory);
router.put('/:id',                    updateStory);
router.delete('/:id',                 deleteStory);
router.post('/:id/chapters',          addChapter);
router.put('/:id/chapters/:index',    updateChapter);

module.exports = router;
