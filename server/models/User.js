const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastCheckIn: {
    type: Date,
    default: null
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
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
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate XP needed for next level
UserSchema.methods.xpForNextLevel = function() {
  // Simple formula: 100 * current level
  return 100 * this.level;
};

// Method to add XP and handle level ups
UserSchema.methods.addXP = function(amount) {
  this.xp += amount;
  
  // Check for level up
  const xpNeeded = this.xpForNextLevel();
  if (this.xp >= xpNeeded) {
    this.level += 1;
    this.xp -= xpNeeded;
  }
  
  return this.save();
};

// Method to update streak
UserSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastCheckIn = this.lastCheckIn;
  
  if (!lastCheckIn) {
    // First check-in
    this.streakDays = 1;
  } else {
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const twoDaysInMs = 2 * oneDayInMs;
    const timeDiff = now - lastCheckIn;
    
    if (timeDiff < twoDaysInMs && timeDiff > 0) {
      // Less than 2 days since last check-in, increment streak
      this.streakDays += 1;
    } else if (timeDiff >= twoDaysInMs) {
      // More than 2 days since last check-in, reset streak
      this.streakDays = 1;
    }
    // If checked in multiple times in the same day, streak stays the same
  }
  
  this.lastCheckIn = now;
  return this.save();
};

const User = mongoose.model('User', UserSchema);

module.exports = User;