const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Achievement, Badge } = require('../models/Achievement');

// Middleware to protect routes
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found, authentication failed' });
    }
    
    // Add user to request object
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });
    
    // Save user to database
    await user.save();
    
    // Create default achievements for the user
    await Achievement.createDefaultAchievements(user._id);
    
    // Create default badges if they don't exist
    await Badge.createDefaultBadges();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        level: user.level,
        xp: user.xp,
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        level: user.level,
        xp: user.xp,
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Get user data without password
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('achievements')
      .populate('badges');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    
    // Build update object
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (avatar) updateFields.avatar = avatar;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/check-in
// @desc    Daily check-in to update streak
// @access  Private
router.post('/check-in', auth, async (req, res) => {
  try {
    // Update user streak
    const user = await req.user.updateStreak();
    
    // Find streak-related achievements
    const streakAchievements = await Achievement.find({
      user: req.userId,
      category: 'Streak',
      isCompleted: false
    });
    
    // Update streak achievement progress
    for (const achievement of streakAchievements) {
      if (achievement.title === 'Consistency Champion') {
        await achievement.updateProgress(1);
      }
    }
    
    res.json({
      streakDays: user.streakDays,
      lastCheckIn: user.lastCheckIn
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.userId);
    
    // Get achievements stats
    const achievements = await Achievement.find({ user: req.userId });
    const completedAchievements = achievements.filter(a => a.isCompleted);
    
    // Get badges
    const earnedBadges = await Badge.find({
      _id: { $in: user.badges }
    });
    
    // Calculate XP needed for next level
    const xpForNextLevel = user.xpForNextLevel();
    const xpProgress = Math.round((user.xp / xpForNextLevel) * 100);
    
    res.json({
      level: user.level,
      xp: user.xp,
      xpForNextLevel,
      xpProgress,
      streakDays: user.streakDays,
      totalAchievements: achievements.length,
      completedAchievements: completedAchievements.length,
      totalBadges: earnedBadges.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;