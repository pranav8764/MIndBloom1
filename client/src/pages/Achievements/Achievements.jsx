import { useState } from 'react';
import './Achievements.css';

const Achievements = () => {
  const [activeTab, setActiveTab] = useState('badges');
  
  // Mock data for achievements and badges
  const achievements = [
    {
      id: 1,
      title: 'Consistency Champion',
      description: 'Complete daily check-ins for 30 consecutive days',
      progress: 22,
      total: 30,
      category: 'Streak',
      icon: 'streak-icon',
      xp: 500
    },
    {
      id: 2,
      title: 'Gratitude Guru',
      description: 'Record 50 gratitude entries in your journal',
      progress: 35,
      total: 50,
      category: 'Journaling',
      icon: 'journal-icon',
      xp: 300
    },
    {
      id: 3,
      title: 'Meditation Master',
      description: 'Complete 20 meditation sessions',
      progress: 8,
      total: 20,
      category: 'Mindfulness',
      icon: 'meditation-icon',
      xp: 250
    },
    {
      id: 4,
      title: 'Challenge Conqueror',
      description: 'Complete 5 wellness challenges',
      progress: 2,
      total: 5,
      category: 'Challenges',
      icon: 'challenge-icon',
      xp: 400
    },
    {
      id: 5,
      title: 'Mood Tracker',
      description: 'Track your mood for 60 days',
      progress: 42,
      total: 60,
      category: 'Tracking',
      icon: 'mood-icon',
      xp: 350
    }
  ];
  
  const badges = [
    {
      id: 101,
      title: 'Early Bird',
      description: 'Earned for completing 5 morning check-ins before 8 AM',
      earned: true,
      dateEarned: '2023-06-15',
      category: 'Habits',
      icon: 'early-bird-icon',
      rarity: 'Common',
      xp: 100
    },
    {
      id: 102,
      title: 'Week Warrior',
      description: 'Earned for maintaining a 7-day streak',
      earned: true,
      dateEarned: '2023-06-22',
      category: 'Streak',
      icon: 'streak-icon',
      rarity: 'Common',
      xp: 150
    },
    {
      id: 103,
      title: 'Mindfulness Novice',
      description: 'Earned for completing 10 meditation sessions',
      earned: false,
      category: 'Mindfulness',
      icon: 'meditation-icon',
      rarity: 'Uncommon',
      xp: 200
    },
    {
      id: 104,
      title: 'Gratitude Starter',
      description: 'Earned for recording 20 gratitude entries',
      earned: true,
      dateEarned: '2023-07-05',
      category: 'Journaling',
      icon: 'journal-icon',
      rarity: 'Common',
      xp: 100
    },
    {
      id: 105,
      title: 'Social Butterfly',
      description: 'Earned for joining 3 group challenges',
      earned: false,
      category: 'Challenges',
      icon: 'social-icon',
      rarity: 'Uncommon',
      xp: 200
    },
    {
      id: 106,
      title: 'Reflection Master',
      description: 'Earned for writing 30 journal entries',
      earned: true,
      dateEarned: '2023-07-01',
      category: 'Journaling',
      icon: 'journal-icon',
      rarity: 'Rare',
      xp: 300
    },
    {
      id: 107,
      title: 'Mood Tracker',
      description: 'Earned for tracking your mood for 30 consecutive days',
      earned: false,
      category: 'Tracking',
      icon: 'mood-icon',
      rarity: 'Uncommon',
      xp: 200
    },
    {
      id: 108,
      title: 'Challenge Champion',
      description: 'Earned for completing 3 wellness challenges',
      earned: false,
      category: 'Challenges',
      icon: 'challenge-icon',
      rarity: 'Rare',
      xp: 300
    }
  ];
  
  // Calculate total XP
  const earnedBadges = badges.filter(badge => badge.earned);
  const totalXP = earnedBadges.reduce((sum, badge) => sum + badge.xp, 0);
  
  // Calculate completion percentage for achievements
  const calculateProgress = (current, total) => {
    return Math.round((current / total) * 100);
  };
  
  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h1>Your Achievements</h1>
        <p>Track your progress and earn rewards for your wellness journey</p>
      </div>
      
      <div className="xp-summary">
        <div className="xp-card">
          <div className="xp-value">{totalXP} XP</div>
          <div className="xp-label">Total Experience Points</div>
          <div className="badges-summary">
            <span>{earnedBadges.length} badges earned</span>
            <span>{badges.length - earnedBadges.length} badges to unlock</span>
          </div>
        </div>
      </div>
      
      <div className="achievements-tabs">
        <button 
          className={`tab-button ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
        <button 
          className={`tab-button ${activeTab === 'in-progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('in-progress')}
        >
          In Progress
        </button>
      </div>
      
      {activeTab === 'badges' && (
        <div className="achievements-content">
          <div className="badges-grid">
            {badges.map(badge => (
              <div 
                className={`badge-card ${badge.earned ? 'earned' : 'locked'}`} 
                key={badge.id}
              >
                <div className={`badge-icon ${badge.icon} ${badge.rarity.toLowerCase()}`}>
                  {!badge.earned && <div className="lock-overlay"></div>}
                </div>
                <div className="badge-info">
                  <h3 className="badge-title">{badge.title}</h3>
                  <p className="badge-description">{badge.description}</p>
                  <div className="badge-meta">
                    <span className={`badge-rarity ${badge.rarity.toLowerCase()}`}>
                      {badge.rarity}
                    </span>
                    <span className="badge-xp">+{badge.xp} XP</span>
                  </div>
                  {badge.earned && (
                    <div className="badge-earned-date">
                      Earned on {badge.dateEarned}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'in-progress' && (
        <div className="achievements-content">
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div className="achievement-card" key={achievement.id}>
                <div className="achievement-header">
                  <div className={`achievement-icon ${achievement.icon}`}></div>
                  <div className="achievement-title-container">
                    <h3 className="achievement-title">{achievement.title}</h3>
                    <span className="achievement-category">{achievement.category}</span>
                  </div>
                </div>
                
                <p className="achievement-description">{achievement.description}</p>
                
                <div className="achievement-progress">
                  <div className="progress-label">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.total}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateProgress(achievement.progress, achievement.total)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="achievement-reward">
                  <span className="reward-label">Reward:</span>
                  <span className="reward-value">{achievement.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;