import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/apiService';
import { achievementService } from '../services/apiService';

// Create context
const AuthContext = createContext(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user from localStorage on component mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        
        // If a user exists but no achievements, initialize them
        if (user && authService.isAuthenticated()) {
          try {
            await achievementService.initializeAchievements();
          } catch (error) {
            // Ignore error if achievements are already initialized
            if (error.response && error.response.status !== 400) {
              console.error('Error initializing achievements:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setError('Failed to initialize user');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.login({ email, password });
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.register(userData);
      setCurrentUser(data.user);
      
      // Initialize achievements for new user
      try {
        await achievementService.initializeAchievements();
      } catch (error) {
        console.error('Error initializing achievements:', error);
      }
      
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const updatedUser = await authService.updateProfile(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: authService.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;