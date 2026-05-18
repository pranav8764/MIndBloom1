import axios from "axios";
// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("clerk_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/auth/me", userData);
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  checkIn: async () => {
    const response = await api.post("/auth/check-in");
    return response.data;
  },
};

// Journal services
export const journalService = {
  createEntry: async (entryData) => {
    const response = await api.post("/journal", entryData);
    return response.data;
  },

  getEntries: async (params = {}) => {
    const response = await api.get("/journal", { params });
    return response.data;
  },

  getEntry: async (id) => {
    const response = await api.get(`/journal/${id}`);
    return response.data;
  },

  updateEntry: async (id, entryData) => {
    const response = await api.put(`/journal/${id}`, entryData);
    return response.data;
  },

  deleteEntry: async (id) => {
    const response = await api.delete(`/journal/${id}`);
    return response.data;
  },

  getMoodStats: async (startDate, endDate) => {
    const response = await api.get("/journal/stats/mood", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getTagStats: async (limit) => {
    const response = await api.get("/journal/stats/tags", {
      params: { limit },
    });
    return response.data;
  },

  getStreakInfo: async () => {
    const response = await api.get("/journal/stats/streak");
    return response.data;
  },
};

// Challenge services
export const challengeService = {
  createChallenge: async (challengeData) => {
    const response = await api.post("/challenges", challengeData);
    return response.data;
  },

  getChallenges: async (params = {}) => {
    const response = await api.get("/challenges", { params });
    return response.data;
  },

  getChallenge: async (id) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  updateChallenge: async (id, challengeData) => {
    const response = await api.put(`/challenges/${id}`, challengeData);
    return response.data;
  },

  deleteChallenge: async (id) => {
    const response = await api.delete(`/challenges/${id}`);
    return response.data;
  },

  joinChallenge: async (idOrCode) => {
    const isId = /^[0-9a-fA-F]{24}$/.test(idOrCode);
    const endpoint = isId ? `/challenges/${idOrCode}/join` : `/challenges/join-code/${idOrCode}`;
    const response = await api.post(endpoint);
    return response.data;
  },

  leaveChallenge: async (id) => {
    const response = await api.post(`/challenges/${id}/leave`);
    return response.data;
  },

  inviteToChallenge: async (id, userIds) => {
    const response = await api.post(`/challenges/${id}/invite`, { userIds });
    return response.data;
  },

  completeTask: async (challengeId, taskId) => {
    const response = await api.post(
      `/challenges/${challengeId}/task/${taskId}/complete`
    );
    return response.data;
  },

  getActiveUserChallenges: async () => {
    const response = await api.get("/challenges/user/active");
    return response.data;
  },

  getCompletedUserChallenges: async () => {
    const response = await api.get("/challenges/user/completed");
    return response.data;
  },
};

// Achievement services
export const achievementService = {
  getAchievements: async (params = {}) => {
    const response = await api.get("/achievements", { params });
    return response.data;
  },

  getAchievement: async (id) => {
    const response = await api.get(`/achievements/${id}`);
    return response.data;
  },

  initializeAchievements: async () => {
    const response = await api.post("/achievements/initialize");
    return response.data;
  },

  getAchievementStats: async () => {
    const response = await api.get("/achievements/stats");
    return response.data;
  },

  claimReward: async (id) => {
    const response = await api.post(`/achievements/${id}/claim-reward`);
    return response.data;
  },

  getRecentAchievements: async (limit = 5) => {
    const response = await api.get("/achievements/recent", {
      params: { limit },
    });
    return response.data;
  },
};

// Habit services
export const habitService = {
  getHabits: async () => {
    const response = await api.get("/habits");
    return response.data;
  },

  createHabit: async (habitData) => {
    const response = await api.post("/habits", habitData);
    return response.data;
  },

  completeHabit: async (id) => {
    const response = await api.put(`/habits/${id}/complete`);
    return response.data;
  },

  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },
};

// User stats and profile services
export const userService = {
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/auth/stats");
    return response.data;
  },

  getLevelInfo: async () => {
    const response = await api.get("/auth/level");
    return response.data;
  },

  updateAvatar: async (avatarUrl) => {
    const response = await api.put("/auth/me", { avatar: avatarUrl });
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  getLeaderboard: async (limit = 10) => {
    const response = await api.get("/auth/leaderboard", {
      params: { limit },
    });
    return response.data;
  },
};

export default {
  auth: authService,
  journal: journalService,
  challenges: challengeService,
  achievements: achievementService,
  user: userService,
  habits: habitService,
};
