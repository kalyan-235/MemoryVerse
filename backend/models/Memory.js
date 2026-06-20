const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Memory title is required'],
    trim: true,
    maxlength: 120,
  },
  description: { type: String, default: '', maxlength: 2000 },
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String, default: '' }, // Cloudinary public_id for deletion
  videoUrl: { type: String, default: '' },
  videoPublicId: { type: String, default: '' },
  location: { type: String, default: '', maxlength: 120 },
  tags: [{ type: String, lowercase: true, trim: true }],
  date: { type: Date, default: Date.now },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null,
  },
  isFavorite: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Index for calendar and date queries
memorySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Memory', memorySchema);
