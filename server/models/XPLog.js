const mongoose = require('mongoose');

const XPLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['journal', 'habit', 'challenge', 'achievement', 'other']
  },
  points: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const XPLog = mongoose.model('XPLog', XPLogSchema);

module.exports = XPLog;
