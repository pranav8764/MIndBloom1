const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { Achievement, Badge } = require("../models/Achievement");



// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    // Get user data without password
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("achievements")
      .populate("badges");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put("/me", auth, async (req, res) => {
  try {
    const { firstName, lastName, username, email, avatar } = req.body;

    // Build update object
    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (avatar) updateFields.avatar = avatar;

    // Check if username is being updated and if it's taken
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      updateFields.username = username;
    }

    // Check if email is being updated and if it's taken
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already taken" });
      }
      updateFields.email = email;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      level: user.level,
      xp: user.xp,
      streakDays: user.streakDays,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/users/check-in
// @desc    Daily check-in to update streak
// @access  Private
router.post("/check-in", auth, async (req, res) => {
  try {
    // Update user streak
    const user = await req.user.updateStreak();

    // Find streak-related achievements
    const streakAchievements = await Achievement.find({
      user: req.userId,
      category: "Streak",
      isCompleted: false,
    });

    // Update streak achievement progress
    for (const achievement of streakAchievements) {
      if (achievement.title === "Consistency Champion") {
        await achievement.updateProgress(1);
      }
    }

    res.json({
      streakDays: user.streakDays,
      lastCheckIn: user.lastCheckIn,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/stats
// @desc    Get user statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get achievements stats
    const achievements = await Achievement.find({ user: req.userId });
    const completedAchievements = achievements.filter((a) => a.isCompleted);

    // Get badges
    const earnedBadges = await Badge.find({
      _id: { $in: user.badges },
    });

    // Calculate XP needed for next level
    const xpForNextLevel = user.xpForNextLevel();
    const xpProgress = Math.round((user.xp / xpForNextLevel) * 100);

    res.json({
      level: user.level,
      xp: user.xp,
      xpForNextLevel,
      xpProgress,
      streakDays: user.streakDays,
      totalAchievements: achievements.length,
      completedAchievements: completedAchievements.length,
      totalBadges: earnedBadges.length,
      totalJournalEntries: user.stats?.totalJournalEntries || 0,
      completedChallenges: user.stats?.completedChallenges || 0,
      challengesCreated: user.stats?.challengesCreated || 0,
      challengesJoined: user.stats?.challengesJoined || 0,
      tasksCompleted: user.stats?.tasksCompleted || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/level
// @desc    Get user level information
// @access  Private
router.get("/level", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextLevelXp = user.xpForNextLevel();
    const progress = Math.round((user.xp / nextLevelXp) * 100);

    res.json({
      currentLevel: user.level,
      currentXp: user.xp,
      nextLevelXp,
      progress,
      xpToNextLevel: nextLevelXp - user.xp,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, username, email } = req.body;

    // Check if username or email already exists (if being changed)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Build update object
    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (username !== undefined) updateFields.username = username;
    if (email !== undefined) updateFields.email = email;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/leaderboard
// @desc    Get user leaderboard
// @access  Private
router.get("/leaderboard", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find({})
      .select("username firstName lastName avatar xp level")
      .sort({ xp: -1 })
      .limit(limit);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

