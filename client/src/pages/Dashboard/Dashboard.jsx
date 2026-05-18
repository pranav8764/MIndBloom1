import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService, journalService, habitService, achievementService, authService } from '../../services/apiService';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser: user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState({});
  const [moodData, setMoodData] = useState([]);
  const [habitData, setHabitData] = useState([]);
  const [achievementsData, setAchievementsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // New habit form state
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      // 1. Daily Check-in (Streak update)
      try {
        await authService.checkIn();
      } catch (checkInErr) {
        // Silently ignore if already checked in today
      }

      // 2. Fetch User Stats and Level Info
      const stats = await userService.getStats();
      const levelInfo = await userService.getLevelInfo();
      
      const newUserData = {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        level: stats.level || user.level || 1,
        xp: stats.xp || user.xp || 0,
        nextLevelXp: levelInfo.nextLevelXp || (stats.level * 100),
        streakDays: stats.streakDays || user.streakDays || 0,
        totalJournalEntries: stats.totalJournalEntries || 0,
        completedChallenges: stats.completedChallenges || 0,
        achievements: stats.completedAchievements || 0
      };
      
      setUserData(newUserData);

      // 3. Fetch Mood Data (last 7 days)
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        const moodStats = await journalService.getMoodStats(startDate.toISOString(), endDate.toISOString());
        
        if (moodStats && moodStats.length > 0) {
          const chartData = moodStats.map(stat => ({
            day: new Date(stat._id).toLocaleDateString('en', { weekday: 'short' }),
            mood: Math.round(stat.averageMood)
          }));
          setMoodData(chartData);
        } else {
          // Fallback to mock data if no entries exist yet
          setMoodData([
            { day: 'Mon', mood: 7 },
            { day: 'Tue', mood: 6 },
            { day: 'Wed', mood: 8 },
            { day: 'Thu', mood: 5 },
            { day: 'Fri', mood: 7 },
            { day: 'Sat', mood: 9 },
            { day: 'Sun', mood: 8 }
          ]);
        }
      } catch (moodError) {
        console.warn('Could not fetch mood data, using mock data:', moodError);
        setMoodData([
          { day: 'Mon', mood: 7 },
          { day: 'Tue', mood: 6 },
          { day: 'Wed', mood: 8 },
          { day: 'Thu', mood: 5 },
          { day: 'Fri', mood: 7 },
          { day: 'Sat', mood: 9 },
          { day: 'Sun', mood: 8 }
        ]);
      }

      // 4. Fetch Habits
      try {
        const habits = await habitService.getHabits();
        const mappedHabits = habits.map(h => {
          const isCompletedToday = h.lastCompleted && 
            new Date(h.lastCompleted).toDateString() === new Date().toDateString();
          return {
            id: h._id,
            name: h.name,
            description: h.description || '',
            completed: Math.min(h.streak || 0, 21),
            total: 21,
            streak: h.streak || 0,
            isCompletedToday
          };
        });
        setHabitData(mappedHabits);
      } catch (habitError) {
        console.error('Could not fetch habits:', habitError);
      }

      // 5. Fetch Achievements
      try {
        const achievements = await achievementService.getAchievements();
        setAchievementsData(achievements || []);
      } catch (achError) {
        console.error('Could not fetch achievements:', achError);
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set fallback data
      setUserData({
        name: user.username || 'User',
        level: user.level || 1,
        xp: user.xp || 0,
        nextLevelXp: (user.level || 1) * 100,
        streakDays: user.streakDays || 0,
        totalJournalEntries: 0,
        completedChallenges: 0,
        achievements: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Handle completing a habit
  const handleCompleteHabit = async (habitId) => {
    try {
      setLoading(true);
      await habitService.completeHabit(habitId);
      alert('Habit completed! +10 XP earned.');
      await fetchDashboardData();
    } catch (err) {
      console.error('Error completing habit:', err);
      alert(err.response?.data?.message || 'Failed to complete habit. Have you already completed it today?');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a habit
  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) {
      alert('Please enter a habit name');
      return;
    }
    
    try {
      setLoading(true);
      await habitService.createHabit({
        name: newHabitName.trim(),
        description: newHabitDesc.trim()
      });
      alert('Habit created successfully!');
      setNewHabitName('');
      setNewHabitDesc('');
      await fetchDashboardData();
    } catch (err) {
      console.error('Error creating habit:', err);
      alert(err.response?.data?.message || 'Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle claiming achievement rewards
  const handleClaimReward = async (achievementId) => {
    try {
      setLoading(true);
      const result = await achievementService.claimReward(achievementId);
      alert(`Reward claimed successfully! +${result.xpAwarded || 100} XP earned.`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error claiming reward:', err);
      alert(err.response?.data?.message || 'Failed to claim reward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && Object.keys(userData).length === 0) {
    return <div className="dashboard-page"><div className="loading-container">Loading your dashboard...</div></div>;
  }
  
  // Calculate progress percentage for XP
  const xpProgressPercentage = userData.nextLevelXp ? (userData.xp / userData.nextLevelXp) * 100 : 0;
  
  // Helper to map achievement categories to icons/badges
  const getAchievementBadge = (title) => {
    switch (title) {
      case 'First Steps': return '🌱';
      case 'Consistency Champion': return '🔥';
      case 'Gratitude Guru': return '🙏';
      case 'Challenge Accepted': return '⚔️';
      case 'Challenge Master': return '👑';
      default: return '✨';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Your Wellness Dashboard</h1>
        <p>Track your progress and see your growth over time</p>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'mood' ? 'active' : ''}`}
          onClick={() => setActiveTab('mood')}
        >
          Mood Tracker
        </button>
        <button 
          className={`tab-button ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          Habits
        </button>
        <button 
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>
      
      {activeTab === 'overview' && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card user-level">
              <div className="level-circle">
                <span>{userData.level}</span>
              </div>
              <h3>Current Level</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${xpProgressPercentage}%` }}
                ></div>
              </div>
              <p>{userData.xp} / {userData.nextLevelXp} XP to next level</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{userData.streakDays}</div>
              <div className="stat-label">Day Streak</div>
              <div className="stat-icon streak-icon"></div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{userData.totalJournalEntries}</div>
              <div className="stat-label">Journal Entries</div>
              <div className="stat-icon journal-icon"></div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{userData.completedChallenges}</div>
              <div className="stat-label">Challenges Completed</div>
              <div className="stat-icon challenge-icon"></div>
            </div>
          </div>
          
          <div className="charts-section">
            <div className="chart-container">
              <h3>Weekly Mood Trends</h3>
              <div className="mood-chart">
                {moodData.map((day, index) => (
                  <div className="mood-column" key={index}>
                    <div 
                      className="mood-bar" 
                      style={{ height: `${day.mood * 10}%` }}
                      data-value={day.mood}
                    >
                      <span className="mood-val-tooltip">{day.mood}</span>
                    </div>
                    <div className="mood-label">{day.day}</div>
                  </div>
                ))}
              </div>
              <div className="mood-scale">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
            
            <div className="habits-overview">
              <h3>Habit Completion</h3>
              {habitData.length > 0 ? (
                <div className="habits-list">
                  {habitData.slice(0, 4).map((habit, index) => (
                    <div className="habit-item" key={index}>
                      <div className="habit-info">
                        <h4>{habit.name}</h4>
                        <div className="habit-streak">
                          {habit.streak > 0 ? `${habit.streak} day streak 🔥` : 'Start a streak!'}
                        </div>
                      </div>
                      <div className="habit-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${(habit.completed / habit.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {habit.completed}/{habit.total} days
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', marginTop: '20px' }}>No habits tracked today. Go to the Habits tab to create one!</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'mood' && (
        <div className="dashboard-content">
          <div className="chart-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3>Detailed Mood Tracking</h3>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Your mood trends for the last 7 days based on your daily gratitude and journal entries.
            </p>
            
            <div className="mood-chart" style={{ height: '300px', marginBottom: '20px', padding: '0 20px' }}>
              {moodData.map((day, index) => (
                <div className="mood-column" key={index}>
                  <div 
                    className="mood-bar" 
                    style={{ height: `${day.mood * 10}%`, width: '45px' }}
                    data-value={day.mood}
                  >
                    <span className="mood-val-tooltip" style={{ opacity: 1, top: '-30px' }}>{day.mood}</span>
                  </div>
                  <div className="mood-label" style={{ fontWeight: '600', fontSize: '1rem', marginTop: '15px' }}>{day.day}</div>
                </div>
              ))}
            </div>
            
            <div className="mood-scale" style={{ borderTop: '1px solid #e0e0e0', paddingTop: '15px', marginTop: '25px' }}>
              <span>😭 1 (Very Low)</span>
              <span>😐 5 (Neutral)</span>
              <span>🤩 10 (Excellent)</span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'habits' && (
        <div className="dashboard-content">
          <div className="habits-tab-container">
            <div className="habits-cards-grid">
              <h3>Track Your Active Habits</h3>
              {habitData.length > 0 ? (
                habitData.map((habit) => (
                  <div className="habit-details-card" key={habit.id}>
                    <div className="habit-details-info">
                      <h4>{habit.name}</h4>
                      <p>{habit.description || 'No description provided.'}</p>
                      <div className="habit-streak">
                        {habit.streak > 0 ? `${habit.streak} day streak 🔥` : 'Start a consecutive day streak!'}
                      </div>
                    </div>
                    
                    <div className="habit-actions-row">
                      <div className="habit-progress" style={{ width: '150px' }}>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${(habit.completed / habit.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="progress-text" style={{ textAlign: 'left' }}>
                          {habit.completed}/{habit.total} days
                        </div>
                      </div>
                      
                      <button 
                        className="btn btn-complete"
                        onClick={() => handleCompleteHabit(habit.id)}
                        disabled={habit.isCompletedToday}
                      >
                        {habit.isCompletedToday ? 'Completed' : 'Complete Today'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="content-placeholder" style={{ padding: '30px' }}>
                  <p>You haven't created any habits yet.</p>
                </div>
              )}
            </div>

            <div className="habit-form-card">
              <h3>Create New Habit</h3>
              <form onSubmit={handleCreateHabit}>
                <div className="form-group">
                  <label htmlFor="habitName">Habit Name</label>
                  <input 
                    type="text" 
                    id="habitName"
                    placeholder="e.g. 15 Min Walk"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="habitDesc">Description (Optional)</label>
                  <textarea 
                    id="habitDesc"
                    rows="3"
                    placeholder="e.g. Walk outside in the local park to clear mind"
                    value={newHabitDesc}
                    onChange={(e) => setNewHabitDesc(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Create Habit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'achievements' && (
        <div className="dashboard-content">
          <h3>Your Achievements & Badges</h3>
          <p style={{ color: '#666' }}>Unlock achievements to level up and earn high XP rewards</p>
          
          {achievementsData.length > 0 ? (
            <div className="achievements-grid">
              {achievementsData.map((ach) => (
                <div 
                  className={`achievement-card ${ach.isCompleted ? 'completed' : ''}`} 
                  key={ach._id}
                >
                  <div className="achievement-badge">
                    {getAchievementBadge(ach.title)}
                  </div>
                  <h4 className="achievement-title">{ach.title}</h4>
                  <p className="achievement-description">{ach.description}</p>
                  
                  <div className="achievement-xp-reward">
                    Reward: {ach.xpReward} XP
                  </div>

                  <div className="achievement-progress-container">
                    <div className="achievement-progress-lbl">
                      <span>Progress</span>
                      <span>
                        {ach.isCompleted ? '100' : Math.round((ach.currentProgress / ach.target) * 100)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${ach.isCompleted ? 100 : (ach.currentProgress / ach.target) * 100}%`,
                          background: ach.isCompleted ? 'linear-gradient(90deg, #ffd700 0%, #ffa500 100%)' : undefined
                        }}
                      ></div>
                    </div>
                  </div>

                  {ach.isCompleted && !ach.rewardClaimed && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleClaimReward(ach._id)}
                      style={{ 
                        width: '100%', 
                        background: 'linear-gradient(90deg, #ffd700 0%, #ffa500 100%)',
                        color: '#333',
                        fontWeight: 'bold'
                      }}
                    >
                      Claim Reward
                    </button>
                  )}

                  {ach.isCompleted && ach.rewardClaimed && (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#b8860b', 
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      padding: '10px 0'
                    }}>
                      ✓ Reward Claimed
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="content-placeholder" style={{ marginTop: '20px' }}>
              <p>No achievements found. Start tracking journal entries and joining challenges to see them!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;