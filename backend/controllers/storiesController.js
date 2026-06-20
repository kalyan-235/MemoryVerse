const Story = require('../models/Story');

// GET /api/stories
const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stories/:id
const getStoryById = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, userId: req.user._id });
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/stories
const createStory = async (req, res) => {
  try {
    const { title, genre, logline } = req.body;
    const story = await Story.create({
      userId: req.user._id,
      title,
      genre: genre || 'General',
      logline: logline || '',
      chapters: [{ title: 'Chapter 1', content: '' }],
    });
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/stories/:id
const updateStory = async (req, res) => {
  try {
    const story = await Story.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/stories/:id
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    res.json({ message: 'Story deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/stories/:id/chapters
const addChapter = async (req, res) => {
  try {
    const { title } = req.body;
    const story = await Story.findOne({ _id: req.params.id, userId: req.user._id });
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    story.chapters.push({ title: title || `Chapter ${story.chapters.length + 1}`, content: '' });
    await story.save();
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/stories/:id/chapters/:index
const updateChapter = async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, userId: req.user._id });
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    const chapterIndex = Number(req.params.index);
    if (!story.chapters[chapterIndex]) {
      return res.status(404).json({ message: 'Chapter not found.' });
    }
    story.chapters[chapterIndex].content = req.body.content;
    await story.save();
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stories/search?q=keyword
const searchStories = async (req, res) => {
  try {
    const { q } = req.query;
    const stories = await Story.find({
      userId: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
      ],
    });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStories, getStoryById, createStory, updateStory,
  deleteStory, addChapter, updateChapter, searchStories,
};
