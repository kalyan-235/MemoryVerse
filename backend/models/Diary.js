const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Diary entry title is required'],
    trim: true,
    maxlength: 150,
  },
  content: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  mood: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Index for date-based queries
diarySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Diary', diarySchema);
