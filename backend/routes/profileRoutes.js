const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const { uploadProfilePhoto: uploadPhotoMiddleware } = require('../config/cloudinary');
const {
  getProfile, updateProfile, uploadProfilePhoto,
  changePassword, deleteAccount,
} = require('../controllers/profileController');

router.use(protectRoute);

router.get('/',                  getProfile);
router.put('/',                  updateProfile);
router.post('/photo', uploadPhotoMiddleware.single('profileImage'), uploadProfilePhoto);
router.put('/change-password',   changePassword);
router.delete('/',               deleteAccount);

module.exports = router;
