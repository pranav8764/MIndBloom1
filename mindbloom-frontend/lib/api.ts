import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for injecting Clerk JWT token
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const clerk = (window as any).Clerk;
    if (clerk) {
      try {
        const token = await clerk.session?.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Error getting Clerk token:', err);
      }
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't redirect on 401 - the dashboard layout handles auth via Clerk's useUser() hook.
    // Redirecting here causes an infinite loop: dashboard -> 401 -> /login -> already signed in -> /dashboard -> 401...
    return Promise.reject(error);
  }
);

export const authAPI = {
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, any>) => api.put('/auth/profile', data),
  getStats: () => api.get('/auth/stats'),
};

export const journalAPI = {
  createEntry: (data: Record<string, any>) => api.post('/journal', data),
  getEntries: (params?: Record<string, any>) => api.get('/journal', { params }),
  getMoodStats: () => api.get('/journal/stats/mood'),
  getStreak: () => api.get('/journal/stats/streak'),
};

export const achievementAPI = {
  getAchievements: () => api.get('/achievements'),
  initialize: () => api.post('/achievements/initialize'),
  claimReward: (id: string) => api.post(`/achievements/${id}/claim-reward`),
};

export const challengeAPI = {
  getChallenges: (params?: Record<string, any>) => api.get('/challenges', { params }),
  createChallenge: (data: Record<string, any>) => api.post('/challenges', data),
  joinChallenge: (id: string) => api.post(`/challenges/${id}/join`),
  getActiveChallenges: () => api.get('/challenges/user/active'),
};

export const habitAPI = {
  getHabits: () => api.get('/habits'),
  createHabit: (data: Record<string, any>) => api.post('/habits', data),
  updateHabit: (id: string, data: Record<string, any>) => api.put(`/habits/${id}`, data),
  deleteHabit: (id: string) => api.delete(`/habits/${id}`),
};

export default api;

