import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService, journalService } from '../../services/apiService';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser: user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState({});
  const [moodData, setMoodData] = useState([]);
  const [habitData, setHabitData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      // Fetch user stats
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
        achievements: stats.totalAchievements || 0
      };
      
      setUserData(newUserData);

      // Try to fetch mood data (last 7 days)
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        const moodStats = await journalService.getMoodStats(startDate.toISOString(), endDate.toISOString());
        
        if (moodStats && moodStats.length > 0) {
          // Convert API data to chart format
          const chartData = moodStats.map(stat => ({
            day: new Date(stat._id).toLocaleDateString('en', { weekday: 'short' }),
            mood: Math.round(stat.averageMood)
          }));
          setMoodData(chartData);
        } else {
          // Fallback to mock data
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

      // Update habit data with real journaling info
      setHabitData([
        { name: 'Meditation', completed: 12, total: 15, streak: 5 },
        { name: 'Exercise', completed: 8, total: 15, streak: 0 },
        { name: 'Journaling', completed: newUserData.totalJournalEntries % 15, total: 15, streak: newUserData.streakDays },
        { name: 'Reading', completed: 10, total: 15, streak: 3 }
      ]);
      
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

  if (loading) {
    return <div className="dashboard-page">Loading your dashboard...</div>;
  }
  
  // Calculate progress percentage for XP
  const xpProgressPercentage = userData.nextLevelXp ? (userData.xp / userData.nextLevelXp) * 100 : 0;
  
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
                    ></div>
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
              <div className="habits-list">
                {habitData.map((habit, index) => (
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
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'mood' && (
        <div className="dashboard-content">
          <div className="content-placeholder">
            <h3>Detailed Mood Tracking</h3>
            <p>This section would contain more detailed mood tracking visualizations and analysis.</p>
          </div>
        </div>
      )}
      
      {activeTab === 'habits' && (
        <div className="dashboard-content">
          <div className="content-placeholder">
            <h3>Habit Management</h3>
            <p>This section would contain detailed habit tracking, creation, and management tools.</p>
          </div>
        </div>
      )}
      
      {activeTab === 'achievements' && (
        <div className="dashboard-content">
          <div className="content-placeholder">
            <h3>Your Achievements</h3>
            <p>This section would display all earned badges and achievements.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;