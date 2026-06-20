const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protectRoute – middleware that verifies the JWT token.
 * Attaches req.user if valid, otherwise returns 401.
 */
const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password -resetOtp -verifyOtp');
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please sign in again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ message: 'Invalid token. Please sign in again.' });
  }
};

module.exports = { protectRoute };
