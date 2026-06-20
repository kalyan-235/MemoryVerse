const Diary = require('../models/Diary');

// GET /api/diary
const getAllDiaryEntries = async (req, res) => {
  try {
    const entries = await Diary.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/diary/:id
const getDiaryEntryById = async (req, res) => {
  try {
    const entry = await Diary.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Diary entry not found.' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/diary/by-date?date=YYYY-MM-DD
const getDiaryEntriesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const entries = await Diary.find({
      userId: req.user._id,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/diary
const createDiaryEntry = async (req, res) => {
  try {
    const { title, content, date, mood } = req.body;
    const entry = await Diary.create({
      userId: req.user._id, title, content, date: date || Date.now(), mood,
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/diary/:id
const updateDiaryEntry = async (req, res) => {
  try {
    const entry = await Diary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!entry) return res.status(404).json({ message: 'Diary entry not found.' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/diary/:id
const deleteDiaryEntry = async (req, res) => {
  try {
    const entry = await Diary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Diary entry not found.' });
    res.json({ message: 'Diary entry deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/diary/:id/favorite
const toggleFavoriteDiaryEntry = async (req, res) => {
  try {
    const entry = await Diary.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Diary entry not found.' });
    entry.isFavorite = !entry.isFavorite;
    await entry.save();
    res.json({ isFavorite: entry.isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/diary/search?q=keyword
const searchDiaryEntries = async (req, res) => {
  try {
    const { q } = req.query;
    const entries = await Diary.find({
      userId: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ],
    }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDiaryEntries, getDiaryEntryById, getDiaryEntriesByDate,
  createDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
  toggleFavoriteDiaryEntry, searchDiaryEntries,
};
