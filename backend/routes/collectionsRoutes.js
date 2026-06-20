const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const { uploadCollectionCover } = require('../config/cloudinary');
const {
  getAllCollections, getCollectionById, createCollection,
  updateCollection, deleteCollection, uploadCollectionCover: uploadCoverHandler,
} = require('../controllers/collectionsController');

router.use(protectRoute);

router.get('/',        getAllCollections);
router.get('/:id',     getCollectionById);
router.post('/',       createCollection);
router.put('/:id',     updateCollection);
router.delete('/:id',  deleteCollection);
router.post('/:id/cover', uploadCollectionCover.single('coverImage'), uploadCoverHandler);

module.exports = router;
