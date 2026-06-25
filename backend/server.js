require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./config/db');

// Route imports
const authRoutes        = require('./routes/authRoutes');
const memoriesRoutes    = require('./routes/memoriesRoutes');
const collectionsRoutes = require('./routes/collectionsRoutes');
const diaryRoutes       = require('./routes/diaryRoutes');
const storiesRoutes     = require('./routes/storiesRoutes');
const searchRoutes      = require('./routes/searchRoutes');
const profileRoutes     = require('./routes/profileRoutes');
const favoritesRoutes   = require('./routes/favoritesRoutes');
const testRoutes        = require('./routes/testRoutes');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== API ROUTES =====
app.use('/api/auth',        authRoutes);
app.use('/api/memories',    memoriesRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/diary',       diaryRoutes);
app.use('/api/stories',     storiesRoutes);
app.use('/api/search',      searchRoutes);
app.use('/api/profile',     profileRoutes);
app.use('/api/favorites',   favoritesRoutes);
app.use('/api/test',        testRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '📖 MemoryVerse API is running' });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 MemoryVerse server running on http://localhost:${PORT}`);
  });
});
