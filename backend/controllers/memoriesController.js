const Memory = require('../models/Memory');
const { cloudinary } = require('../config/cloudinary');

// GET /api/memories
const getAllMemories = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const memories = await Memory.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memories/:id
const getMemoryById = async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!memory) return res.status(404).json({ message: 'Memory not found.' });

    // Find adjacent memories for prev/next navigation
    const allIds = await Memory.find({ userId: req.user._id })
      .sort({ date: -1 }).select('_id');
    const currentIndex = allIds.findIndex((m) => m._id.equals(memory._id));
    const prevMemoryId = allIds[currentIndex + 1]?._id || null;
    const nextMemoryId = allIds[currentIndex - 1]?._id || null;

    res.json({ ...memory.toObject(), prevMemoryId, nextMemoryId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/memories
const createMemory = async (req, res) => {
  try {
    const { title, description, date, location, tags, collectionId } = req.body;
    const parsedTags = tags ? JSON.parse(tags) : [];

    const memoryData = {
      userId: req.user._id, title, description, date, location,
      tags: parsedTags, collectionId: collectionId || null,
    };

    if (req.file) {
      const isVideo = req.file.mimetype?.startsWith('video');
      if (isVideo) {
        memoryData.videoUrl = req.file.path;
        memoryData.videoPublicId = req.file.filename;
      } else {
        memoryData.imageUrl = req.file.path;
        memoryData.imagePublicId = req.file.filename;
      }
    }

    const memory = await Memory.create(memoryData);
    res.status(201).json(memory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/memories/:id
const updateMemory = async (req, res) => {
  try {
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!memory) return res.status(404).json({ message: 'Memory not found.' });
    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/memories/:id
const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!memory) return res.status(404).json({ message: 'Memory not found.' });

    // Remove media from Cloudinary
    if (memory.imagePublicId) await cloudinary.uploader.destroy(memory.imagePublicId);
    if (memory.videoPublicId) await cloudinary.uploader.destroy(memory.videoPublicId, { resource_type: 'video' });

    await memory.deleteOne();
    res.json({ message: 'Memory deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/memories/:id/favorite
const toggleFavoriteMemory = async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!memory) return res.status(404).json({ message: 'Memory not found.' });
    memory.isFavorite = !memory.isFavorite;
    await memory.save();
    res.json({ isFavorite: memory.isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memories/favorites
const getFavoriteMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user._id, isFavorite: true }).sort({ date: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memories/by-date?date=YYYY-MM-DD
const getMemoriesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const memories = await Memory.find({
      userId: req.user._id,
      date: { $gte: startOfDay, $lt: endOfDay },
    }).sort({ date: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memories/calendar-dates?year=2024&month=5
const getCalendarDates = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);

    const memories = await Memory.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lt: endOfMonth },
    }).select('date');

    const dateStrings = memories.map((m) => m.date.toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dateStrings)];
    res.json(uniqueDates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memories/collection/:collectionId
const getMemoriesByCollection = async (req, res) => {
  try {
    const memories = await Memory.find({
      userId: req.user._id,
      collectionId: req.params.collectionId,
    }).sort({ date: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMemories, getMemoryById, createMemory, updateMemory,
  deleteMemory, toggleFavoriteMemory, getFavoriteMemories,
  getMemoriesByDate, getCalendarDates, getMemoriesByCollection,
};
