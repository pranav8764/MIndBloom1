// server/middleware/auth.js
const { requireAuth } = require('@clerk/express');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');
const { Achievement } = require('../models/Achievement');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware to ensure the user exists in MongoDB and attach req.userId
const attachMongoUser = async (req, res, next) => {
  try {
    // req.auth is provided by clerkMiddleware and ensured by requireAuth()
    const clerkId = req.auth.userId;
    
    let user = await User.findOne({ clerkId });
    if (!user) {
      // First time we see this user, fetch their info from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const username = clerkUser.username || email.split('@')[0];
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      
      user = new User({
        clerkId,
        email,
        username,
        firstName,
        lastName,
      });
      await user.save();
      
      // Initialize default achievements for new user
      const defaultAchievements = [
        {
          title: 'First Steps',
          description: 'Create your first journal entry',
          category: 'Journaling',
          target: 1,
          user: user._id,
          xpReward: 50
        },
        {
          title: 'Consistency Champion',
          description: 'Complete daily check-ins for 7 consecutive days',
          category: 'Streak',
          target: 7,
          user: user._id,
          xpReward: 200
        },
        {
          title: 'Gratitude Guru',
          description: 'Record 10 gratitude entries in your journal',
          category: 'Journaling',
          target: 10,
          user: user._id,
          xpReward: 150
        },
        {
          title: 'Challenge Accepted',
          description: 'Join your first challenge',
          category: 'Challenges',
          target: 1,
          user: user._id,
          xpReward: 100
        },
        {
          title: 'Challenge Master',
          description: 'Complete 3 challenges',
          category: 'Challenges',
          target: 3,
          user: user._id,
          xpReward: 300
        }
      ];
      
      await Achievement.insertMany(defaultAchievements);
    }
    
    req.user = user;
    req.userId = user._id; // Provide MongoDB ID for the rest of the app
    next();
  } catch (err) {
    console.error('Error syncing user:', err);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

const ensureAuth = (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }
  next();
};

module.exports = [ensureAuth, attachMongoUser];

