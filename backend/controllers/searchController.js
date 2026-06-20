const Memory = require('../models/Memory');
const Diary = require('../models/Diary');
const Story = require('../models/Story');
const Collection = require('../models/Collection');

// GET /api/search?q=keyword&filter=all
const globalSearch = async (req, res) => {
  try {
    const { q, filter = 'all' } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters.' });
    }

    const searchRegex = { $regex: q, $options: 'i' };
    const userId = req.user._id;
    const results = { memories: [], diaries: [], stories: [], collections: [] };

    if (filter === 'all' || filter === 'memories') {
      results.memories = await Memory.find({
        userId,
        $or: [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }, { location: searchRegex }],
      }).sort({ date: -1 }).limit(20);
    }

    if (filter === 'all' || filter === 'diaries') {
      results.diaries = await Diary.find({
        userId,
        $or: [{ title: searchRegex }, { content: searchRegex }],
      }).sort({ date: -1 }).limit(20);
    }

    if (filter === 'all' || filter === 'stories') {
      results.stories = await Story.find({
        userId,
        $or: [{ title: searchRegex }, { genre: searchRegex }],
      }).sort({ createdAt: -1 }).limit(20);
    }

    if (filter === 'all' || filter === 'collections') {
      results.collections = await Collection.find({
        userId,
        name: searchRegex,
      }).limit(20);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { globalSearch };
