import { createContext, useState, useEffect, useContext } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { userService, achievementService, api } from '../services/apiService';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic token interceptor to ensure fresh Clerk token before every API request
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      async (config) => {
        try {
          if (isSignedIn) {
            const token = await getToken();
            if (token) {
              config.headers["Authorization"] = `Bearer ${token}`;
              localStorage.setItem('clerk_token', token); // fallback for legacy code
            }
          }
        } catch (err) {
          console.error("Error setting dynamic auth token:", err);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [isSignedIn, getToken]);


  useEffect(() => {
    const syncUser = async () => {
      if (!isClerkLoaded) return;
      
      if (isSignedIn && clerkUser) {
        try {
          setLoading(true);
          const token = await getToken();
          localStorage.setItem('clerk_token', token);
          
          // Fetch our custom user profile from backend (creates if missing)
          const profile = await userService.getProfile();
          setCurrentUser({ ...profile, email: clerkUser.primaryEmailAddress?.emailAddress });
          
          // Initialize achievements after authentication
          try {
            await achievementService.initializeAchievements();
          } catch (achErr) {
            // Silently ignore 400 errors (already initialized)
            if (achErr.response?.status !== 400) {
              console.error('Error initializing achievements:', achErr);
            }
          }
        } catch (err) {
          console.error('Error syncing user profile:', err);
          setError('Failed to load user profile');
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('clerk_token');
        setLoading(false);
      }
    };

    syncUser();
  }, [isSignedIn, clerkUser, isClerkLoaded, getToken]);

  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const updatedUser = await userService.updateProfile(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    signOut();
  };

  const value = {
    currentUser,
    loading,
    error,
    logout,
    updateProfile,
    isAuthenticated: () => isSignedIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;