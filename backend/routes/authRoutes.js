const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/authMiddleware');
const {
  registerUser, verifyEmailOtp, loginUser, getCurrentUser,
  forgotPassword, verifyResetOtp, resetPassword, resendOtp,
} = require('../controllers/authController');

router.post('/register',           registerUser);
router.post('/verify-email',       verifyEmailOtp);
router.post('/login',              loginUser);
router.get('/me',                  protectRoute, getCurrentUser);
router.post('/forgot-password',    forgotPassword);
router.post('/verify-reset-otp',   verifyResetOtp);
router.post('/reset-password',     resetPassword);
router.post('/resend-otp',         resendOtp);

module.exports = router;
