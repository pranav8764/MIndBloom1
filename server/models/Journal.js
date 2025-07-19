const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Mood rating is required']
  },
  content: {
    type: String,
    required: [true, 'Journal content is required'],
    trim: true
  },
  prompt: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  gratitude: [{
    type: String,
    trim: true
  }],
  activities: [{
    type: String,
    trim: true
  }],
  isPrivate: {
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
JournalEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying by user and date
JournalEntrySchema.index({ user: 1, date: -1 });

// Static method to get entries for a specific date range
JournalEntrySchema.statics.getEntriesByDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Static method to get mood averages by day for a date range
JournalEntrySchema.statics.getMoodAveragesByDay = async function(userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" }
        },
        averageMood: { $avg: "$mood" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  return result;
};

// Static method to get most used tags
JournalEntrySchema.statics.getMostUsedTags = async function(userId, limit = 10) {
  const result = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId)
      }
    },
    {
      $unwind: "$tags"
    },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  return result;
};

// Static method to get streak information
JournalEntrySchema.statics.getStreakInfo = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if there's an entry for today
  const todayEntry = await this.findOne({
    user: userId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });
  
  // Get the most recent entry before today
  const lastEntry = await this.findOne({
    user: userId,
    date: { $lt: today }
  }).sort({ date: -1 });
  
  if (!lastEntry) {
    // First time journaling
    return {
      currentStreak: todayEntry ? 1 : 0,
      longestStreak: todayEntry ? 1 : 0,
      lastEntryDate: todayEntry ? today : null
    };
  }
  
  const lastEntryDate = new Date(lastEntry.date);
  lastEntryDate.setHours(0, 0, 0, 0);
  
  // Check if the last entry was yesterday
  const isConsecutive = lastEntryDate.getTime() === yesterday.getTime();
  
  // Get all entries to calculate longest streak
  const allEntries = await this.find({
    user: userId
  }).sort({ date: 1 });
  
  let longestStreak = 0;
  let currentStreak = 0;
  let previousDate = null;
  
  for (const entry of allEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (!previousDate) {
      currentStreak = 1;
    } else {
      const prevDay = new Date(previousDate);
      prevDay.setDate(prevDay.getDate() + 1);
      
      if (entryDate.getTime() === prevDay.getTime()) {
        currentStreak += 1;
      } else {
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
        currentStreak = 1;
      }
    }
    
    previousDate = entryDate;
  }
  
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }
  
  // Update current streak based on today's entry
  if (todayEntry && isConsecutive) {
    currentStreak += 1;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  } else if (!isConsecutive) {
    currentStreak = todayEntry ? 1 : 0;
  }
  
  return {
    currentStreak,
    longestStreak,
    lastEntryDate: todayEntry ? today : lastEntryDate
  };
};

const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);

module.exports = JournalEntry;