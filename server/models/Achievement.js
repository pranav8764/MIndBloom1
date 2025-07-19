const mongoose = require('mongoose');

// Badge Schema
const BadgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Badge title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Streak', 'Journaling', 'Mindfulness', 'Challenges', 'Tracking', 'Habits', 'Social', 'Special'],
    default: 'Special'
  },
  icon: {
    type: String,
    default: 'default-badge.png'
  },
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
    default: 'Common'
  },
  xpReward: {
    type: Number,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Achievement Schema
const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Streak', 'Journaling', 'Mindfulness', 'Challenges', 'Tracking', 'Habits', 'Social', 'Special'],
    default: 'Special'
  },
  icon: {
    type: String,
    default: 'default-achievement.png'
  },
  target: {
    type: Number,
    required: [true, 'Achievement target is required']
  },
  currentValue: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: Date,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  },
  xpReward: {
    type: Number,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
AchievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if achievement is completed on save
AchievementSchema.pre('save', async function(next) {
  if (this.currentValue >= this.target && !this.isCompleted) {
    this.isCompleted = true;
    this.completedDate = new Date();
    
    // Add XP to user if achievement is completed
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.user);
      if (user) {
        await user.addXP(this.xpReward);
      }
    } catch (error) {
      console.error('Error adding XP to user:', error);
    }
  }
  next();
});

// Index for efficient querying
AchievementSchema.index({ user: 1, category: 1, isCompleted: 1 });
BadgeSchema.index({ category: 1, rarity: 1 });

// Static method to get achievements by user
AchievementSchema.statics.getAchievementsByUser = function(userId) {
  return this.find({ user: userId })
    .populate('badge')
    .sort({ isCompleted: -1, category: 1 });
};

// Static method to get completed achievements by user
AchievementSchema.statics.getCompletedAchievementsByUser = function(userId) {
  return this.find({ 
    user: userId,
    isCompleted: true
  })
    .populate('badge')
    .sort({ completedDate: -1 });
};

// Static method to get in-progress achievements by user
AchievementSchema.statics.getInProgressAchievementsByUser = function(userId) {
  return this.find({ 
    user: userId,
    isCompleted: false
  })
    .populate('badge')
    .sort({ currentValue: -1 });
};

// Method to update achievement progress
AchievementSchema.methods.updateProgress = async function(value) {
  if (this.isCompleted) {
    return this; // Already completed, no need to update
  }
  
  this.currentValue = Math.min(this.target, this.currentValue + value);
  return this.save();
};

// Static method to create default achievements for a new user
AchievementSchema.statics.createDefaultAchievements = async function(userId) {
  const Badge = mongoose.model('Badge');
  
  // Get badges for default achievements
  const streakBadge = await Badge.findOne({ title: 'Week Warrior' });
  const journalBadge = await Badge.findOne({ title: 'Journaling Novice' });
  const challengeBadge = await Badge.findOne({ title: 'Challenge Starter' });
  
  // Default achievements
  const defaultAchievements = [
    {
      title: 'Consistency Champion',
      description: 'Complete daily check-ins for 30 consecutive days',
      category: 'Streak',
      target: 30,
      user: userId,
      badge: streakBadge?._id,
      xpReward: 500
    },
    {
      title: 'Gratitude Guru',
      description: 'Record 50 gratitude entries in your journal',
      category: 'Journaling',
      target: 50,
      user: userId,
      badge: journalBadge?._id,
      xpReward: 300
    },
    {
      title: 'Challenge Conqueror',
      description: 'Complete 5 wellness challenges',
      category: 'Challenges',
      target: 5,
      user: userId,
      badge: challengeBadge?._id,
      xpReward: 400
    }
  ];
  
  return this.insertMany(defaultAchievements);
};

// Static method to create default badges
BadgeSchema.statics.createDefaultBadges = async function() {
  const defaultBadges = [
    {
      title: 'Early Bird',
      description: 'Earned for completing 5 morning check-ins before 8 AM',
      category: 'Habits',
      rarity: 'Common',
      xpReward: 100
    },
    {
      title: 'Week Warrior',
      description: 'Earned for maintaining a 7-day streak',
      category: 'Streak',
      rarity: 'Common',
      xpReward: 150
    },
    {
      title: 'Journaling Novice',
      description: 'Earned for writing 10 journal entries',
      category: 'Journaling',
      rarity: 'Common',
      xpReward: 100
    },
    {
      title: 'Challenge Starter',
      description: 'Earned for completing your first challenge',
      category: 'Challenges',
      rarity: 'Common',
      xpReward: 150
    },
    {
      title: 'Mindfulness Master',
      description: 'Earned for completing 20 meditation sessions',
      category: 'Mindfulness',
      rarity: 'Uncommon',
      xpReward: 250
    },
    {
      title: 'Gratitude Guru',
      description: 'Earned for recording 50 gratitude entries',
      category: 'Journaling',
      rarity: 'Rare',
      xpReward: 300
    }
  ];
  
  // Only insert if no badges exist
  const count = await this.countDocuments();
  if (count === 0) {
    return this.insertMany(defaultBadges);
  }
  
  return [];
};

const Badge = mongoose.model('Badge', BadgeSchema);
const Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = { Badge, Achievement };