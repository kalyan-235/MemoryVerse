const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  isLocked: { type: Boolean, default: false },
}, { _id: false });

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Story title is required'],
    trim: true,
    maxlength: 150,
  },
  genre: { type: String, default: 'General', trim: true },
  logline: { type: String, default: '', maxlength: 300 },
  status: {
    type: String,
    enum: ['Draft', 'In Progress', 'Working on Chapter', 'Pausing', 'Completed'],
    default: 'Draft',
  },
  chapters: [chapterSchema],
  notes: { type: String, default: '' },
  outline: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Story', storySchema);
