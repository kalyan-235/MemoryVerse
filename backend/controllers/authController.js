const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, buildOtpEmailHtml } = require('../utils/sendEmail');

/** Generate a signed JWT for a user */
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

/** Generate a 6-digit numeric OTP */
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await User.create({
      name, email, password,
      verifyOtp: otp, verifyOtpExpiry: otpExpiry,
    });

    // Send OTP email — don't block registration if email fails
    try {
      await sendEmail({
        to: email,
        subject: 'Verify your MemoryVerse account',
        html: buildOtpEmailHtml(name, otp, 'verify'),
      });
    } catch (emailError) {
      console.error('⚠️  Failed to send verification email:', emailError.message);
      // In development, log the OTP to console so you can still verify
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 DEV OTP for ${email}: ${otp}`);
      }
    }

    res.status(201).json({
      message: 'Account created. Please check your email for the verification OTP.',
      // Send OTP in response during development so testing is easy
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/verify-email
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email is already verified.' });
    if (user.verifyOtp !== otp || user.verifyOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.isEmailVerified = true;
    user.verifyOtp = undefined;
    user.verifyOtpExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid email or password.' });

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before signing in.' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        profileImage: user.profileImage, bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getCurrentUser = async (req, res) => {
  res.json(req.user);
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Don't reveal if email exists (security)
    if (!user) return res.json({ message: 'If this email exists, a reset OTP has been sent.' });

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: 'Reset your MemoryVerse password',
        html: buildOtpEmailHtml(user.name, otp, 'reset'),
      });
    } catch (emailError) {
      console.error('⚠️  Failed to send reset email:', emailError.message);
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 DEV Reset OTP for ${email}: ${otp}`);
      }
    }

    res.json({
      message: 'If this email exists, a reset OTP has been sent.',
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/verify-reset-otp
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset OTP.' });
    }
    res.json({ message: 'OTP verified. You may now set a new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset OTP.' });
    }
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully. Please sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please sign in.' });
    }

    const otp = generateOtp();
    user.verifyOtp = otp;
    user.verifyOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: 'Your new MemoryVerse OTP',
        html: buildOtpEmailHtml(user.name, otp, 'verify'),
      });
    } catch (emailError) {
      console.error('⚠️  Failed to resend OTP email:', emailError.message);
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 DEV Resend OTP for ${email}: ${otp}`);
      }
    }

    res.json({
      message: 'New OTP sent to your email.',
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser, verifyEmailOtp, loginUser, getCurrentUser,
  forgotPassword, verifyResetOtp, resetPassword, resendOtp,
};
