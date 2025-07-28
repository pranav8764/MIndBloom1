const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT authentication middleware.
 * Expects Authorization header in the form: `Bearer <token>`.
 * On success attaches `req.user` (full user doc) and `req.userId` (ObjectId) then calls `next()`.
 * On failure responds with 401.
 */
module.exports = async function auth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found, authentication failed' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Authentication failed', error: err.message });
  }
}
