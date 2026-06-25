const Memory  = require('../models/Memory');
const Diary   = require('../models/Diary');
const Story   = require('../models/Story');

// GET /api/favorites/memories
const getFavoriteMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user._id, isFavorite: true })
      .sort({ updatedAt: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/favorites/diaries
const getFavoriteDiaries = async (req, res) => {
  try {
    const diaries = await Diary.find({ userId: req.user._id, isFavorite: true })
      .sort({ updatedAt: -1 });
    res.json(diaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/favorites/stories
const getFavoriteStories = async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.user._id, isFavorite: true })
      .sort({ updatedAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/favorites/stories/:id/toggle
const toggleFavoriteStory = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, userId: req.user._id });
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    story.isFavorite = !story.isFavorite;
    await story.save();
    res.json({ isFavorite: story.isFavorite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFavoriteMemories, getFavoriteDiaries, getFavoriteStories, toggleFavoriteStory };
