const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: 80,
  },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: count of memories in this collection
collectionSchema.virtual('memoryCount', {
  ref: 'Memory',
  localField: '_id',
  foreignField: 'collectionId',
  count: true,
});

module.exports = mongoose.model('Collection', collectionSchema);
