const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Achievement, AchievementTemplate } = require('../models/Achievement');

// Import centralized auth middleware
const auth = require('../middleware/auth');

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
    const completionPercentage = totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0;
    
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
    }).sort({ completedDate: -1 }).limit(5);
    
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
    }).sort({ completedDate: -1 }).limit(parseInt(limit));
    
    res.json(recentAchievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/achievements/templates/all
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
    
    // Create default achievements for the user
    const defaultAchievements = [
      {
        user: req.userId,
        title: 'First Steps',
        description: 'Complete your first journal entry',
        category: 'Journaling',
        target: 1,
        currentValue: 0,
        xpReward: 50
      },
      {
        user: req.userId,
        title: 'Consistency Champion',
        description: 'Complete daily check-ins for 7 consecutive days',
        category: 'Streak',
        target: 7,
        currentValue: 0,
        xpReward: 200
      },
      {
        user: req.userId,
        title: 'Gratitude Guru',
        description: 'Record 10 gratitude entries in your journal',
        category: 'Journaling',
        target: 10,
        currentValue: 0,
        xpReward: 150
      },
      {
        user: req.userId,
        title: 'Challenge Accepted',
        description: 'Join your first wellness challenge',
        category: 'Challenges',
        target: 1,
        currentValue: 0,
        xpReward: 100
      },
      {
        user: req.userId,
        title: 'Challenge Master',
        description: 'Complete 3 wellness challenges',
        category: 'Challenges',
        target: 3,
        currentValue: 0,
        xpReward: 300
      }
    ];
    
    // Create achievements
    const achievements = await Achievement.insertMany(defaultAchievements);
    
    res.status(201).json(achievements);
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
    const user = await User.findById(req.userId);
    if (user) {
      await user.addXP(achievement.xpReward);
    }
    
    res.json({
      message: 'Reward claimed successfully',
      xpAwarded: achievement.xpReward
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

module.exports = router;