const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
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

// @route   POST /api/challenges
// @desc    Create a new challenge
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, type, duration, startDate, tasks, isPublic } = req.body;

    // Create new challenge
    const challenge = new Challenge({
      creator: req.userId,
      title,
      description,
      category,
      type,
      duration,
      startDate: startDate ? new Date(startDate) : new Date(),
      tasks,
      isPublic: isPublic || false,
      participants: [{ user: req.userId, joinedAt: new Date(), isCreator: true }]
    });

    // Save challenge
    await challenge.save();

    // Update user's created challenges count
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.challengesCreated': 1 }
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/challenges
// @desc    Get all challenges (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      limit = 10, 
      skip = 0, 
      category, 
      type, 
      isPublic, 
      isActive, 
      isJoined,
      search
    } = req.query;

    // Build query
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Filter by public/private
    if (isPublic === 'true') {
      query.isPublic = true;
    }
    
    // Filter by active status
    if (isActive === 'true') {
      const now = new Date();
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }
    
    // Filter by joined status
    if (isJoined === 'true') {
      query['participants.user'] = req.userId;
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get challenges
    const challenges = await Challenge.find(query)
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('creator', 'username avatar');

    // Get total count
    const total = await Challenge.countDocuments(query);

    res.json({
      challenges,
      total,
      hasMore: total > parseInt(skip) + challenges.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/challenges/:id
// @desc    Get a specific challenge
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('participants.user', 'username avatar');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/challenges/:id
// @desc    Update a challenge
// @access  Private (creator only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, tasks, isPublic } = req.body;

    // Find challenge
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is the creator
    if (challenge.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this challenge' });
    }

    // Check if challenge has already started
    const now = new Date();
    if (challenge.startDate < now) {
      return res.status(400).json({ message: 'Cannot update a challenge that has already started' });
    }

    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (category) updateFields.category = category;
    if (tasks) updateFields.tasks = tasks;
    if (isPublic !== undefined) updateFields.isPublic = isPublic;

    // Update challenge
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('creator', 'username avatar')
     .populate('participants.user', 'username avatar');

    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/challenges/:id
// @desc    Delete a challenge
// @access  Private (creator only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find challenge
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is the creator
    if (challenge.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this challenge' });
    }

    // Check if challenge has already started and has participants
    const now = new Date();
    if (challenge.startDate < now && challenge.participants.length > 1) {
      return res.status(400).json({ message: 'Cannot delete an active challenge with participants' });
    }

    // Delete challenge
    await Challenge.findByIdAndDelete(req.params.id);

    res.json({ message: 'Challenge deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/challenges/:id/join
// @desc    Join a challenge
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    // Find challenge
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if challenge is public or user is invited
    if (!challenge.isPublic && !challenge.invitedUsers.includes(req.userId)) {
      return res.status(403).json({ message: 'This challenge is private and you are not invited' });
    }

    // Check if user is already a participant
    const isParticipant = challenge.participants.some(
      participant => participant.user.toString() === req.userId.toString()
    );

    if (isParticipant) {
      return res.status(400).json({ message: 'You are already a participant in this challenge' });
    }

    // Add user to participants
    challenge.participants.push({
      user: req.userId,
      joinedAt: new Date(),
      isCreator: false,
      progress: challenge.tasks.map(task => ({
        taskId: task._id,
        isCompleted: false,
        completedAt: null
      }))
    });

    // Save challenge
    await challenge.save();

    // Update user's joined challenges count
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.challengesJoined': 1 }
    });

    // Update challenge achievements
    const challengeAchievements = await Achievement.find({
      user: req.userId,
      category: 'Challenges',
      isCompleted: false
    });

    // Update achievement progress
    for (const achievement of challengeAchievements) {
      if (achievement.title === 'Challenge Accepted') {
        await achievement.updateProgress(1);
      }
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/challenges/:id/leave
// @desc    Leave a challenge
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    // Find challenge
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is a participant
    const participantIndex = challenge.participants.findIndex(
      participant => participant.user.toString() === req.userId.toString()
    );

    if (participantIndex === -1) {
      return res.status(400).json({ message: 'You are not a participant in this challenge' });
    }

    // Check if user is the creator
    const isCreator = challenge.participants[participantIndex].isCreator;
    if (isCreator) {
      return res.status(400).json({ message: 'Creator cannot leave the challenge. Delete it instead.' });
    }

    // Remove user from participants
    challenge.participants.splice(participantIndex, 1);

    // Save challenge
    await challenge.save();

    res.json({ message: 'Successfully left the challenge' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/challenges/:id/invite
// @desc    Invite users to a challenge
// @access  Private (creator only)
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    // Find challenge
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is the creator
    if (challenge.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to invite users to this challenge' });
    }

    // Add users to invitedUsers
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { invitedUsers: { $each: userIds } } },
      { new: true }
    );

    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/challenges/:id/task/:taskId/complete
// @desc    Complete a task in a challenge
// @access  Private
router.post('/:id/task/:taskId/complete', auth, async (req, res) => {
  try {
    // Find challenge
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is a participant
    const participantIndex = challenge.participants.findIndex(
      participant => participant.user.toString() === req.userId.toString()
    );

    if (participantIndex === -1) {
      return res.status(400).json({ message: 'You are not a participant in this challenge' });
    }

    // Check if task exists
    const taskExists = challenge.tasks.some(task => task._id.toString() === req.params.taskId);
    if (!taskExists) {
      return res.status(404).json({ message: 'Task not found in this challenge' });
    }

    // Find the task in the participant's progress
    const progressIndex = challenge.participants[participantIndex].progress.findIndex(
      p => p.taskId.toString() === req.params.taskId
    );

    if (progressIndex === -1) {
      // If progress doesn't exist, create it
      challenge.participants[participantIndex].progress.push({
        taskId: req.params.taskId,
        isCompleted: true,
        completedAt: new Date()
      });
    } else {
      // Update existing progress
      challenge.participants[participantIndex].progress[progressIndex].isCompleted = true;
      challenge.participants[participantIndex].progress[progressIndex].completedAt = new Date();
    }

    // Calculate XP to award
    const xpPerTask = 10; // Base XP per task
    
    // Save challenge
    await challenge.save();

    // Update user's XP
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 
        'stats.tasksCompleted': 1,
        'stats.xp': xpPerTask
      }
    });

    // Check if all tasks are completed
    const allTasksCompleted = challenge.participants[participantIndex].progress.every(p => p.isCompleted);
    
    if (allTasksCompleted) {
      // Award bonus XP for completing all tasks
      const bonusXp = 50;
      await User.findByIdAndUpdate(req.userId, {
        $inc: { 'stats.xp': bonusXp, 'stats.challengesCompleted': 1 }
      });

      // Update challenge achievements
      const challengeAchievements = await Achievement.find({
        user: req.userId,
        category: 'Challenges',
        isCompleted: false
      });

      // Update achievement progress
      for (const achievement of challengeAchievements) {
        if (achievement.title === 'Challenge Master') {
          await achievement.updateProgress(1);
        }
      }
    }

    res.json({
      message: 'Task completed',
      xpEarned: xpPerTask,
      allTasksCompleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/challenges/user/active
// @desc    Get user's active challenges
// @access  Private
router.get('/user/active', auth, async (req, res) => {
  try {
    const now = new Date();
    
    // Find challenges where user is a participant and challenge is active
    const challenges = await Challenge.find({
      'participants.user': req.userId,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ startDate: 1 })
      .populate('creator', 'username avatar');

    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/challenges/user/completed
// @desc    Get user's completed challenges
// @access  Private
router.get('/user/completed', auth, async (req, res) => {
  try {
    const now = new Date();
    
    // Find challenges where user is a participant and challenge is completed
    const challenges = await Challenge.find({
      'participants.user': req.userId,
      endDate: { $lt: now }
    }).sort({ endDate: -1 })
      .populate('creator', 'username avatar');

    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;