import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

type ClerkSession = { session?: { getToken?: () => Promise<string> } };
type ClerkWindow = Window & { Clerk?: ClerkSession };
type ApiPayload = Record<string, unknown>;

type ApiParams = Record<string, unknown>;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for injecting Clerk JWT token
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const clerk = (window as ClerkWindow).Clerk;
    if (clerk?.session?.getToken) {
      try {
        const token = await clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err: unknown) {
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
  updateProfile: (data: ApiPayload) => api.put('/auth/profile', data),
  getStats: () => api.get('/auth/stats'),
};

export const journalAPI = {
  createEntry: (data: ApiPayload) => api.post('/journal', data),
  getEntries: (params?: ApiParams) => api.get('/journal', { params }),
  getMoodStats: (params?: ApiParams) => api.get('/journal/stats/mood', { params }),
  getStreak: () => api.get('/journal/stats/streak'),
};

export const achievementAPI = {
  getAchievements: () => api.get('/achievements'),
  initialize: () => api.post('/achievements/initialize'),
  claimReward: (id: string) => api.post(`/achievements/${id}/claim-reward`),
};

export const challengeAPI = {
  getChallenges: (params?: ApiParams) => api.get('/challenges', { params }),
  createChallenge: (data: ApiPayload) => api.post('/challenges', data),
  joinChallenge: (id: string) => api.post(`/challenges/${id}/join`),
  getActiveChallenges: () => api.get('/challenges/user/active'),
};

export const habitAPI = {
  getHabits: () => api.get('/habits'),
  createHabit: (data: ApiPayload) => api.post('/habits', data),
  updateHabit: (id: string, data: ApiPayload) => api.put(`/habits/${id}`, data),
  deleteHabit: (id: string) => api.delete(`/habits/${id}`),
};

export default api;

