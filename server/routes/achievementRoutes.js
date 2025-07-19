const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Achievement, AchievementTemplate } = require('../models/Achievement');

// Auth middleware
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

// @route   GET /api/achievements
// @desc    Get all achievements for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get query parameters
    const { category } = req.query;
    
    // Build query
    const query = { user: req.userId };
    
    if (category) {
      query.category = category;
    }
    
    // Get achievements
    const achievements = await Achievement.find(query).sort({ category: 1, createdAt: 1 });
    
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/achievements/:id
// @desc    Get a specific achievement
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const achievement = await Achievement.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    res.json(achievement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/achievements/templates
// @desc    Get all achievement templates
// @access  Private
router.get('/templates/all', auth, async (req, res) => {
  try {
    const templates = await AchievementTemplate.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/achievements/initialize
// @desc    Initialize achievements for a user
// @access  Private
router.post('/initialize', auth, async (req, res) => {
  try {
    // Check if user already has achievements
    const existingAchievements = await Achievement.find({ user: req.userId });
    
    if (existingAchievements.length > 0) {
      return res.status(400).json({ message: 'User already has achievements initialized' });
    }
    
    // Get all achievement templates
    const templates = await AchievementTemplate.find();
    
    // Create achievements for user based on templates
    const achievements = [];
    
    for (const template of templates) {
      const achievement = new Achievement({
        user: req.userId,
        title: template.title,
        description: template.description,
        category: template.category,
        icon: template.icon,
        targetValue: template.targetValue,
        currentValue: 0,
        isCompleted: false,
        xpReward: template.xpReward,
        badgeUrl: template.badgeUrl
      });
      
      await achievement.save();
      achievements.push(achievement);
    }
    
    res.status(201).json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/achievements/templates
// @desc    Create a new achievement template (admin only)
// @access  Private (admin)
router.post('/templates', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to create achievement templates' });
    }
    
    const { title, description, category, icon, targetValue, xpReward, badgeUrl } = req.body;
    
    // Create new achievement template
    const template = new AchievementTemplate({
      title,
      description,
      category,
      icon,
      targetValue,
      xpReward,
      badgeUrl
    });
    
    // Save template
    await template.save();
    
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/achievements/templates/:id
// @desc    Update an achievement template (admin only)
// @access  Private (admin)
router.put('/templates/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update achievement templates' });
    }
    
    const { title, description, category, icon, targetValue, xpReward, badgeUrl } = req.body;
    
    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (category) updateFields.category = category;
    if (icon) updateFields.icon = icon;
    if (targetValue) updateFields.targetValue = targetValue;
    if (xpReward) updateFields.xpReward = xpReward;
    if (badgeUrl) updateFields.badgeUrl = badgeUrl;
    
    // Update template
    const template = await AchievementTemplate.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({ message: 'Achievement template not found' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/achievements/templates/:id
// @desc    Delete an achievement template (admin only)
// @access  Private (admin)
router.delete('/templates/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete achievement templates' });
    }
    
    // Delete template
    const template = await AchievementTemplate.findByIdAndDelete(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Achievement template not found' });
    }
    
    res.json({ message: 'Achievement template deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/achievements/stats
// @desc    Get achievement statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get all user achievements
    const achievements = await Achievement.find({ user: req.userId });
    
    // Calculate statistics
    const totalAchievements = achievements.length;
    const completedAchievements = achievements.filter(a => a.isCompleted).length;
    const completionPercentage = (completedAchievements / totalAchievements) * 100;
    
    // Group by category
    const categories = {};
    for (const achievement of achievements) {
      if (!categories[achievement.category]) {
        categories[achievement.category] = {
          total: 0,
          completed: 0
        };
      }
      
      categories[achievement.category].total++;
      if (achievement.isCompleted) {
        categories[achievement.category].completed++;
      }
    }
    
    // Calculate category percentages
    for (const category in categories) {
      categories[category].percentage = 
        (categories[category].completed / categories[category].total) * 100;
    }
    
    // Get recently completed achievements
    const recentlyCompleted = await Achievement.find({
      user: req.userId,
      isCompleted: true
    }).sort({ completedAt: -1 }).limit(5);
    
    res.json({
      totalAchievements,
      completedAchievements,
      completionPercentage,
      categories,
      recentlyCompleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/achievements/:id/claim-reward
// @desc    Claim the reward for a completed achievement
// @access  Private
router.post('/:id/claim-reward', auth, async (req, res) => {
  try {
    // Find achievement
    const achievement = await Achievement.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check if achievement is completed
    if (!achievement.isCompleted) {
      return res.status(400).json({ message: 'Achievement not completed yet' });
    }
    
    // Check if reward already claimed
    if (achievement.rewardClaimed) {
      return res.status(400).json({ message: 'Reward already claimed' });
    }
    
    // Update achievement
    achievement.rewardClaimed = true;
    await achievement.save();
    
    // Award XP to user
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.xp': achievement.xpReward }
    });
    
    res.json({
      message: 'Reward claimed successfully',
      xpAwarded: achievement.xpReward
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/achievements/recent
// @desc    Get recently completed achievements
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get recently completed achievements
    const recentAchievements = await Achievement.find({
      user: req.userId,
      isCompleted: true
    }).sort({ completedAt: -1 }).limit(parseInt(limit));
    
    res.json(recentAchievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;