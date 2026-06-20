const Collection = require('../models/Collection');
const { cloudinary } = require('../config/cloudinary');

// GET /api/collections
const getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user._id })
      .populate('memoryCount')
      .sort({ createdAt: -1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/collections/:id
const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('memoryCount');
    if (!collection) return res.status(404).json({ message: 'Collection not found.' });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/collections
const createCollection = async (req, res) => {
  try {
    const { name, isPrivate } = req.body;
    const collection = await Collection.create({
      userId: req.user._id, name, isPrivate: isPrivate || false,
    });
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/collections/:id
const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!collection) return res.status(404).json({ message: 'Collection not found.' });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/collections/:id
const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, userId: req.user._id });
    if (!collection) return res.status(404).json({ message: 'Collection not found.' });
    if (collection.coverImagePublicId) {
      await cloudinary.uploader.destroy(collection.coverImagePublicId);
    }
    await collection.deleteOne();
    res.json({ message: 'Collection deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/collections/:id/cover
const uploadCollectionCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided.' });
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { coverImage: req.file.path, coverImagePublicId: req.file.filename },
      { new: true },
    );
    if (!collection) return res.status(404).json({ message: 'Collection not found.' });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCollections, getCollectionById, createCollection,
  updateCollection, deleteCollection, uploadCollectionCover,
};
