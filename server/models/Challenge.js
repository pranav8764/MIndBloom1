const mongoose = require('mongoose');

// Schema for challenge participants
const ParticipantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  },
  completedDays: [{
    type: Date
  }],
  lastCheckIn: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Schema for daily tasks within a challenge
const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  points: {
    type: Number,
    default: 10
  }
});

// Main Challenge Schema
const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Challenge category is required'],
    enum: ['Meditation', 'Exercise', 'Journaling', 'Habits', 'Sleep', 'Nutrition', 'Social', 'Other'],
    default: 'Other'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Challenge start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Challenge end date is required']
  },
  duration: {
    type: Number, // in days
    required: [true, 'Challenge duration is required']
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  joinCode: {
    type: String,
    trim: true
  },
  maxParticipants: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  tasks: [TaskSchema],
  participants: [ParticipantSchema],
  completionCriteria: {
    type: String,
    enum: ['Daily', 'Total', 'Custom'],
    default: 'Daily'
  },
  completionThreshold: {
    type: Number,
    default: 100 // percentage or number of tasks
  },
  xpReward: {
    type: Number,
    default: 100
  },
  badgeReward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  },
  isActive: {
    type: Boolean,
    default: true
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
ChallengeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate a random join code for private challenges
ChallengeSchema.pre('save', function(next) {
  if (this.isPrivate && !this.joinCode) {
    // Generate a random 8-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.joinCode = code;
  }
  next();
});

// Index for efficient querying
ChallengeSchema.index({ category: 1, isPrivate: 1, isActive: 1 });
ChallengeSchema.index({ joinCode: 1 }, { sparse: true });

// Static method to get active public challenges
ChallengeSchema.statics.getActivePublicChallenges = function(category = null) {
  const now = new Date();
  const query = {
    isPrivate: false,
    isActive: true,
    endDate: { $gte: now }
  };
  
  if (category && category !== 'All Categories') {
    query.category = category;
  }
  
  return this.find(query)
    .populate('creator', 'username')
    .sort({ startDate: 1 });
};

// Static method to get challenges by user (created or participating)
ChallengeSchema.statics.getChallengesByUser = function(userId) {
  return this.find({
    $or: [
      { creator: userId },
      { 'participants.user': userId }
    ]
  }).populate('creator', 'username');
};

// Static method to join a challenge
ChallengeSchema.methods.addParticipant = async function(userId) {
  // Check if user is already a participant
  const isParticipant = this.participants.some(p => p.user.toString() === userId.toString());
  
  if (isParticipant) {
    throw new Error('User is already a participant in this challenge');
  }
  
  // Check if challenge is at capacity
  if (this.maxParticipants > 0 && this.participants.length >= this.maxParticipants) {
    throw new Error('Challenge has reached maximum number of participants');
  }
  
  // Add user to participants
  this.participants.push({
    user: userId,
    joinDate: new Date(),
    progress: 0,
    completedDays: [],
    lastCheckIn: null,
    isActive: true
  });
  
  return this.save();
};

// Method to check in for a challenge
ChallengeSchema.methods.checkIn = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find participant
  const participantIndex = this.participants.findIndex(
    p => p.user.toString() === userId.toString()
  );
  
  if (participantIndex === -1) {
    throw new Error('User is not a participant in this challenge');
  }
  
  const participant = this.participants[participantIndex];
  
  // Check if already checked in today
  const alreadyCheckedIn = participant.completedDays.some(date => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  });
  
  if (alreadyCheckedIn) {
    throw new Error('Already checked in for today');
  }
  
  // Add today to completed days
  participant.completedDays.push(today);
  participant.lastCheckIn = new Date();
  
  // Calculate progress
  const totalDays = Math.ceil((this.endDate - this.startDate) / (24 * 60 * 60 * 1000));
  participant.progress = Math.min(100, Math.round((participant.completedDays.length / totalDays) * 100));
  
  // Update participant in the array
  this.participants[participantIndex] = participant;
  
  return this.save();
};

// Method to check if a challenge is completed by a user
ChallengeSchema.methods.isCompletedByUser = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!participant) {
    return false;
  }
  
  return participant.progress >= this.completionThreshold;
};

const Challenge = mongoose.model('Challenge', ChallengeSchema);

module.exports = Challenge;