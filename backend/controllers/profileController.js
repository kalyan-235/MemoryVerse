const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// GET /api/profile
const getProfile = async (req, res) => {
  res.json(req.user);
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'bio'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    }).select('-password -resetOtp -verifyOtp');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/profile/photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided.' });

    // Delete old profile image from Cloudinary if exists
    const oldUser = await User.findById(req.user._id);
    if (oldUser.profileImage) {
      // Extract public_id from URL and delete
      const publicId = oldUser.profileImage.split('/').pop().split('.')[0];
      if (publicId) await cloudinary.uploader.destroy(`memoryverse/profiles/${publicId}`);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: req.file.path },
      { new: true },
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/profile/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/profile
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password is incorrect.' });
    }

    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePhoto, changePassword, deleteAccount };
