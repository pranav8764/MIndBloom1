import { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data for demonstration
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock user data
  const userData = {
    name: 'Alex Johnson',
    level: 12,
    xp: 1250,
    nextLevelXp: 1500,
    streakDays: 15,
    totalJournalEntries: 45,
    completedChallenges: 8,
    achievements: 12
  };
  
  // Mock mood data for the chart
  const moodData = [
    { day: 'Mon', mood: 7 },
    { day: 'Tue', mood: 6 },
    { day: 'Wed', mood: 8 },
    { day: 'Thu', mood: 5 },
    { day: 'Fri', mood: 7 },
    { day: 'Sat', mood: 9 },
    { day: 'Sun', mood: 8 }
  ];
  
  // Mock habit data
  const habitData = [
    { name: 'Meditation', completed: 12, total: 15, streak: 5 },
    { name: 'Exercise', completed: 8, total: 15, streak: 0 },
    { name: 'Journaling', completed: 15, total: 15, streak: 15 },
    { name: 'Reading', completed: 10, total: 15, streak: 3 }
  ];
  
  // Calculate progress percentage for XP
  const xpProgressPercentage = (userData.xp / userData.nextLevelXp) * 100;
  
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