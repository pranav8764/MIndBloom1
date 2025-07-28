const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const XPLog = require('../models/XPLog');
const { Achievement } = require('../models/Achievement');
const jwt = require('jsonwebtoken');

// Auth middleware (consider refactoring into separate file for reuse)
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/habits - list habits
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/habits - create habit
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const habit = new Habit({ user: req.userId, name, description });
    await habit.save();
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/habits/:id/complete - mark today completed
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    await habit.completeToday();

    // log XP (example value 10)
    await XPLog.create({ user: req.userId, action: 'habit', points: 10 });
    // TODO: update user XP and check achievements

    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/habits/:id - delete habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
