const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  streak: {
    type: Number,
    default: 0
  },
  lastCompleted: {
    type: Date
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

// Pre-save hook to update timestamps
HabitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method: mark habit completed
HabitSchema.methods.completeToday = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastCompleted) {
    this.streak = 1;
  } else {
    const last = new Date(this.lastCompleted);
    last.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (last.getTime() === yesterday.getTime()) {
      this.streak += 1;
    } else if (last.getTime() !== today.getTime()) {
      // reset streak if not consecutive
      this.streak = 1;
    }
  }

  this.lastCompleted = Date.now();
  await this.save();
  return this;
};

const Habit = mongoose.model('Habit', HabitSchema);

module.exports = Habit;
