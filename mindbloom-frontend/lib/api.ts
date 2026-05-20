import axios from 'axios';
import { getAuth } from '@clerk/nextjs/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Let Clerk handle authentication redirects
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
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

