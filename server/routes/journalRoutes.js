const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JournalEntry = require('../models/Journal');
const { Achievement } = require('../models/Achievement');

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

// @route   POST /api/journal
// @desc    Create a new journal entry
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { mood, content, prompt, tags, gratitude, activities } = req.body;

    // Create new journal entry
    const journalEntry = new JournalEntry({
      user: req.userId,
      mood,
      content,
      prompt,
      tags,
      gratitude,
      activities
    });

    // Save journal entry
    await journalEntry.save();

    // Update journaling achievements
    const journalingAchievements = await Achievement.find({
      user: req.userId,
      category: 'Journaling',
      isCompleted: false
    });

    // Update achievement progress
    for (const achievement of journalingAchievements) {
      if (achievement.title === 'Gratitude Guru' && gratitude && gratitude.length > 0) {
        await achievement.updateProgress(gratitude.length);
      }
    }

    // Get streak info
    const streakInfo = await JournalEntry.getStreakInfo(req.userId);

    res.status(201).json({
      journalEntry,
      streakInfo
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/journal
// @desc    Get all journal entries for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get query parameters
    const { limit = 10, skip = 0, startDate, endDate } = req.query;

    // Build query
    const query = { user: req.userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get journal entries
    const journalEntries = await JournalEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get total count
    const total = await JournalEntry.countDocuments(query);

    res.json({
      journalEntries,
      total,
      hasMore: total > parseInt(skip) + journalEntries.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/journal/:id
// @desc    Get a specific journal entry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(journalEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/journal/:id
// @desc    Update a journal entry
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { mood, content, prompt, tags, gratitude, activities } = req.body;

    // Build update object
    const updateFields = {};
    if (mood) updateFields.mood = mood;
    if (content) updateFields.content = content;
    if (prompt) updateFields.prompt = prompt;
    if (tags) updateFields.tags = tags;
    if (gratitude) updateFields.gratitude = gratitude;
    if (activities) updateFields.activities = activities;

    // Update journal entry
    const journalEntry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: updateFields },
      { new: true }
    );

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(journalEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/journal/:id
// @desc    Delete a journal entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json({ message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/journal/stats/mood
// @desc    Get mood statistics
// @access  Private
router.get('/stats/mood', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Get mood averages by day
    const moodStats = await JournalEntry.getMoodAveragesByDay(
      req.userId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json(moodStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/journal/stats/tags
// @desc    Get most used tags
// @access  Private
router.get('/stats/tags', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get most used tags
    const tagStats = await JournalEntry.getMostUsedTags(req.userId, parseInt(limit));

    res.json(tagStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/journal/stats/streak
// @desc    Get streak information
// @access  Private
router.get('/stats/streak', auth, async (req, res) => {
  try {
    // Get streak info
    const streakInfo = await JournalEntry.getStreakInfo(req.userId);

    res.json(streakInfo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
