const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindbloom')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import routes
const userRoutes = require('./routes/userRoutes');
const journalRoutes = require('./routes/journalRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/achievements', achievementRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Initialize default achievement templates if they don't exist
const { AchievementTemplate } = require('./models/Achievement');

const initializeAchievementTemplates = async () => {
  try {
    const count = await AchievementTemplate.countDocuments();
    
    if (count === 0) {
      console.log('Initializing default achievement templates...');
      
      const defaultTemplates = [
        {
          title: 'Journal Starter',
          description: 'Create your first journal entry',
          category: 'Journaling',
          icon: 'journal',
          targetValue: 1,
          xpReward: 50,
          badgeUrl: '/badges/journal-starter.png'
        },
        {
          title: 'Consistent Journaler',
          description: 'Create journal entries for 7 consecutive days',
          category: 'Journaling',
          icon: 'streak',
          targetValue: 7,
          xpReward: 100,
          badgeUrl: '/badges/consistent-journaler.png'
        },
        {
          title: 'Gratitude Guru',
          description: 'Record 50 things you are grateful for',
          category: 'Journaling',
          icon: 'gratitude',
          targetValue: 50,
          xpReward: 200,
          badgeUrl: '/badges/gratitude-guru.png'
        },
        {
          title: 'Mood Tracker',
          description: 'Track your mood for 30 days',
          category: 'Journaling',
          icon: 'mood',
          targetValue: 30,
          xpReward: 150,
          badgeUrl: '/badges/mood-tracker.png'
        },
        {
          title: 'Challenge Accepted',
          description: 'Join your first challenge',
          category: 'Challenges',
          icon: 'challenge',
          targetValue: 1,
          xpReward: 50,
          badgeUrl: '/badges/challenge-accepted.png'
        },
        {
          title: 'Challenge Master',
          description: 'Complete 5 challenges',
          category: 'Challenges',
          icon: 'trophy',
          targetValue: 5,
          xpReward: 250,
          badgeUrl: '/badges/challenge-master.png'
        },
        {
          title: 'Challenge Creator',
          description: 'Create your first challenge',
          category: 'Challenges',
          icon: 'create',
          targetValue: 1,
          xpReward: 75,
          badgeUrl: '/badges/challenge-creator.png'
        },
        {
          title: 'Social Butterfly',
          description: 'Join 3 public challenges',
          category: 'Challenges',
          icon: 'social',
          targetValue: 3,
          xpReward: 100,
          badgeUrl: '/badges/social-butterfly.png'
        },
        {
          title: 'Level Up',
          description: 'Reach level 5',
          category: 'Progress',
          icon: 'level',
          targetValue: 5,
          xpReward: 300,
          badgeUrl: '/badges/level-up.png'
        },
        {
          title: 'Mindfulness Master',
          description: 'Complete 10 mindfulness activities',
          category: 'Activities',
          icon: 'mindfulness',
          targetValue: 10,
          xpReward: 200,
          badgeUrl: '/badges/mindfulness-master.png'
        }
      ];
      
      await AchievementTemplate.insertMany(defaultTemplates);
      console.log('Default achievement templates created');
    }
  } catch (error) {
    console.error('Error initializing achievement templates:', error);
  }
};

// Call the function to initialize achievement templates
initializeAchievementTemplates();

module.exports = app; // Export for testing