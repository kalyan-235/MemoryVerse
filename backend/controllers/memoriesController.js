const Memory = require('../models/Memory');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

// GET /api/memories
const getAllMemories = async (req, res) => {
  try {
    const { limit = 50, page = 1, map } = req.query;
    const filter = { userId: req.user._id };
    // map=true → home journey map only shows memories NOT in any collection
    if (map === 'true') filter.collectionId = null;

    const memories = await Memory.find(filter)
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

    // source=collection → prev/next within same collection only
    // source=map or default → prev/next within map memories (no collection) only
    const { source, collectionId } = req.query;

    let filter = { userId: req.user._id };
    if (source === 'collection' && (collectionId || memory.collectionId)) {
      filter.collectionId = collectionId || memory.collectionId;
    } else {
      filter.collectionId = null; // map memories only
    }

    const allIds = await Memory.find(filter).sort({ date: -1 }).select('_id');
    const idx = allIds.findIndex(m => m._id.equals(memory._id));

    res.json({
      ...memory.toObject(),
      prevMemoryId: allIds[idx + 1]?._id || null,
      nextMemoryId: allIds[idx - 1]?._id || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/memories  — accepts JSON with optional imageUrl/videoUrl already uploaded to Cloudinary
const createMemory = async (req, res) => {
  try {
    const {
      title, description, date, location, tags, collectionId,
      imageUrl, videoUrl, imagePublicId, videoPublicId,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Memory title is required.' });
    }

    let parsedTags = [];
    try { parsedTags = tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : []; } catch { parsedTags = []; }

    const memoryData = {
      userId:         req.user._id,
      title:          title.trim(),
      description:    description   || '',
      date:           date ? new Date(date) : new Date(),
      location:       location      || '',
      tags:           parsedTags,
      collectionId:   collectionId  || null,
      imageUrl:       imageUrl      || '',
      videoUrl:       videoUrl      || '',
      imagePublicId:  imagePublicId || '',
      videoPublicId:  videoPublicId || '',
    };

    // Fallback: if file was sent via multipart (old flow), upload via stream
    if (req.file && req.file.buffer && !imageUrl && !videoUrl) {
      const isVideo      = req.file.mimetype?.startsWith('video');
      const resourceType = isVideo ? 'video' : 'image';
      try {
        console.log(`📤 Fallback upload ${resourceType} to Cloudinary...`);
        const result = await uploadToCloudinary(req.file.buffer, 'memoryverse/memories', resourceType);
        if (isVideo) {
          memoryData.videoUrl      = result.secure_url;
          memoryData.videoPublicId = result.public_id;
        } else {
          memoryData.imageUrl      = result.secure_url;
          memoryData.imagePublicId = result.public_id;
        }
      } catch (uploadErr) {
        console.error('⚠️  Cloudinary fallback upload failed:', uploadErr.message);
      }
    }

    const memory = await Memory.create(memoryData);
    console.log(`✅ Memory created: "${memory.title}" | img: ${memory.imageUrl ? 'yes' : 'no'}`);
    res.status(201).json(memory);
  } catch (error) {
    console.error('❌ Create memory error:', error.message);
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
    if (memory.imagePublicId) await cloudinary.uploader.destroy(memory.imagePublicId);
    if (memory.videoPublicId) await cloudinary.uploader.destroy(memory.videoPublicId, { resource_type: 'video' });
    await memory.deleteOne();
    res.json({ message: 'Memory deleted.' });
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
    const start = new Date(date);
    const end   = new Date(date);
    end.setDate(end.getDate() + 1);
    const memories = await Memory.find({ userId: req.user._id, date: { $gte: start, $lt: end } }).sort({ date: -1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memories/calendar-dates?year=2024&month=5
const getCalendarDates = async (req, res) => {
  try {
    const { year, month } = req.query;
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 1);
    const memories = await Memory.find({ userId: req.user._id, date: { $gte: start, $lt: end } }).select('date');
    const unique = [...new Set(memories.map(m => m.date.toISOString().split('T')[0]))];
    res.json(unique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memories/collection/:collectionId
const getMemoriesByCollection = async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user._id, collectionId: req.params.collectionId }).sort({ date: -1 });
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
