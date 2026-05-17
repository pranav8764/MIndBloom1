import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { userService, achievementService } from '../services/apiService';

// Create context
const GamificationContext = createContext();

// Custom hook to use the gamification context
export const useGamification = () => {
  return useContext(GamificationContext);
};

// Provider component
export const GamificationProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate level and progress based on XP
  const calculateLevel = (xp) => {
    // Base XP required for level 1
    const baseXp = 100;
    // XP growth factor per level
    const growthFactor = 1.5;
    
    let level = 0;
    let xpForNextLevel = baseXp;
    let totalXpRequired = 0;
    
    while (xp >= totalXpRequired + xpForNextLevel) {
      level++;
      totalXpRequired += xpForNextLevel;
      xpForNextLevel = Math.floor(baseXp * Math.pow(growthFactor, level));
    }
    
    const currentLevelXp = xp - totalXpRequired;
    const progress = (currentLevelXp / xpForNextLevel) * 100;
    
    return {
      level: level + 1,
      currentXp: xp,
      currentLevelXp,
      xpForNextLevel,
      progress: Math.min(progress, 100),
      totalXpRequired: totalXpRequired + xpForNextLevel
    };
  };

  // Load user stats and achievements
  useEffect(() => {
    const loadGamificationData = async () => {
      if (!isAuthenticated() || !currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Load user stats
        const stats = await userService.getStats();
        setUserStats(stats);
        
        // Calculate level info
        const levelData = calculateLevel(stats.xp);
        setLevelInfo(levelData);
        
        // Load achievements
        const achievementsData = await achievementService.getAchievements();
        setAchievements(achievementsData);
        
        // Load recent achievements
        const recentData = await achievementService.getRecentAchievements(5);
        setRecentAchievements(recentData);
      } catch (error) {
        console.error('Error loading gamification data:', error);
        setError('Failed to load gamification data');
      } finally {
        setLoading(false);
      }
    };
    
    loadGamificationData();
  }, [currentUser, isAuthenticated]);

  // Claim achievement reward
  const claimAchievementReward = async (achievementId) => {
    try {
      setError(null);
      const result = await achievementService.claimReward(achievementId);
      
      // Update user stats with new XP
      setUserStats(prevStats => ({
        ...prevStats,
        xp: prevStats.xp + result.xpAwarded
      }));
      
      // Update level info
      setLevelInfo(calculateLevel(userStats.xp + result.xpAwarded));
      
      // Update achievement in the list
      setAchievements(prevAchievements => 
        prevAchievements.map(achievement => 
          achievement._id === achievementId 
            ? { ...achievement, rewardClaimed: true } 
            : achievement
        )
      );
      
      return result;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to claim reward');
      throw error;
    }
  };

  // Refresh achievements
  const refreshAchievements = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Load achievements
      const achievementsData = await achievementService.getAchievements();
      setAchievements(achievementsData);
      
      // Load recent achievements
      const recentData = await achievementService.getRecentAchievements(5);
      setRecentAchievements(recentData);
      
      // Load user stats
      const stats = await userService.getStats();
      setUserStats(stats);
      
      // Calculate level info
      const levelData = calculateLevel(stats.xp);
      setLevelInfo(levelData);
      
      return { achievements: achievementsData, recent: recentData };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to refresh achievements');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get achievement stats
  const getAchievementStats = async () => {
    try {
      setError(null);
      const stats = await achievementService.getAchievementStats();
      return stats;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get achievement stats');
      throw error;
    }
  };

  // Context value
  const value = {
    userStats,
    levelInfo,
    achievements,
    recentAchievements,
    loading,
    error,
    claimAchievementReward,
    refreshAchievements,
    getAchievementStats,
    calculateLevel
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export default GamificationContext;