const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const { globalSearch } = require('../controllers/searchController');

router.get('/', protectRoute, globalSearch);

module.exports = router;
