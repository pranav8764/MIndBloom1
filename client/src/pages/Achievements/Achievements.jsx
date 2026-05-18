import { useState, useEffect } from 'react';
import './Achievements.css';
import { achievementService } from '../../services/apiService';

const Achievements = () => {
  const [activeTab, setActiveTab] = useState('badges');
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real achievements from backend
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await achievementService.getAchievements();
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getBadgeIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'streak': return 'streak-icon';
      case 'journaling': return 'journal-icon';
      case 'mindfulness': return 'meditation-icon';
      case 'challenges': return 'challenge-icon';
      case 'tracking': return 'mood-icon';
      case 'social': return 'social-icon';
      case 'habits': return 'early-bird-icon';
      default: return 'journal-icon';
    }
  };

  const getRarity = (xpReward) => {
    if (xpReward >= 300) return 'Rare';
    if (xpReward >= 200) return 'Uncommon';
    return 'Common';
  };

  // Splitting achievements
  const completedBadges = achievements.filter(ach => ach.isCompleted);
  const inProgressAchievements = achievements.filter(ach => !ach.isCompleted);
  
  // Calculate total XP based on completed badges
  const totalXP = completedBadges.reduce((sum, badge) => sum + badge.xpReward, 0);
  
  // Calculate completion percentage for achievements
  const calculateProgress = (current, total) => {
    return Math.round((current / total) * 100);
  };

  if (loading) {
    return (
      <div className="achievements-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading achievements data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-page" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="error-message" style={{ color: '#d9534f', fontSize: '1.1rem', background: '#fdf7f7', padding: '15px', borderRadius: '8px', border: '1px solid #ebccd1', display: 'inline-block' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h1>Your Achievements</h1>
        <p>Track your progress and earn rewards for your wellness journey</p>
      </div>
      
      <div className="xp-summary">
        <div className="xp-card">
          <div className="xp-value">{totalXP} XP</div>
          <div className="xp-label">Total Experience Points from Unlocked Badges</div>
          <div className="badges-summary">
            <span>{completedBadges.length} badges earned</span>
            <span>{inProgressAchievements.length} badges to unlock</span>
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
          In Progress ({inProgressAchievements.length})
        </button>
      </div>
      
      {activeTab === 'badges' && (
        <div className="achievements-content">
          {achievements.length > 0 ? (
            <div className="badges-grid">
              {achievements.map(badge => {
                const rarity = getRarity(badge.xpReward);
                const icon = getBadgeIcon(badge.category);
                return (
                  <div 
                    className={`badge-card ${badge.isCompleted ? 'earned' : 'locked'}`} 
                    key={badge._id}
                  >
                    <div className={`badge-icon ${icon} ${rarity.toLowerCase()}`}>
                      {!badge.isCompleted && <div className="lock-overlay"></div>}
                    </div>
                    <div className="badge-info">
                      <h3 className="badge-title">{badge.title}</h3>
                      <p className="badge-description">{badge.description}</p>
                      <div className="badge-meta">
                        <span className={`badge-rarity ${rarity.toLowerCase()}`}>
                          {rarity}
                        </span>
                        <span className="badge-xp">+{badge.xpReward} XP</span>
                      </div>
                      {badge.isCompleted && (
                        <div className="badge-earned-date">
                          Earned on {new Date(badge.completedDate || badge.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-entries" style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p>No achievements found. Please make sure you are registered and logged in.</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'in-progress' && (
        <div className="achievements-content">
          {inProgressAchievements.length > 0 ? (
            <div className="achievements-grid">
              {inProgressAchievements.map(achievement => {
                const icon = getBadgeIcon(achievement.category);
                const progressPercent = calculateProgress(achievement.currentProgress, achievement.target);
                return (
                  <div className="achievement-card" key={achievement._id}>
                    <div className="achievement-header">
                      <div className={`achievement-icon ${icon}`}></div>
                      <div className="achievement-title-container">
                        <h3 className="achievement-title">{achievement.title}</h3>
                        <span className="achievement-category">{achievement.category}</span>
                      </div>
                    </div>
                    
                    <p className="achievement-description">{achievement.description}</p>
                    
                    <div className="achievement-progress">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{achievement.currentProgress}/{achievement.target}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="achievement-reward">
                      <span className="reward-label">Reward:</span>
                      <span className="reward-value">{achievement.xpReward} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-entries" style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p>Amazing! You have completed all available achievements! 🏆</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Achievements;