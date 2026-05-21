import axios from 'axios';
import { create } from 'zustand';
import { achievementAPI, challengeAPI } from '@/lib/api';

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  rewardClaimed: boolean;
  currentValue: number;
  target: number;
  xpReward: number;
  category: string;
  createdAt: string;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  participants: Array<Record<string, unknown>>;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
  creator?: Record<string, unknown>;
}

interface GamificationState {
  achievements: Achievement[];
  activeChallenges: Challenge[];
  allChallenges: Challenge[];
  joinedIds: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  getAchievements: () => Promise<void>;
  getChallenges: (params?: Record<string, unknown>) => Promise<void>;
  getActiveChallenges: () => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  claimReward: (achievementId: string) => Promise<void>;
  clearError: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const useGamificationStore = create<GamificationState>((set) => ({
  achievements: [],
  activeChallenges: [],
  allChallenges: [],
  joinedIds: [],
  isLoading: false,
  error: null,

  getAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await achievementAPI.getAchievements();
      set({ achievements: data });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch achievements') });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getChallenges: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await challengeAPI.getChallenges(params);
      set({ allChallenges: data.challenges ?? [] });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch challenges') });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getActiveChallenges: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await challengeAPI.getActiveChallenges();
      set({
        activeChallenges: data,
        joinedIds: data.map((c: Challenge) => c._id),
      });
    } catch (error: unknown) {
      console.error('Failed to fetch active challenges:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  joinChallenge: async (challengeId) => {
    set({ isLoading: true, error: null });
    try {
      await challengeAPI.joinChallenge(challengeId);
      set((state) => ({
        joinedIds: [...state.joinedIds, challengeId],
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to join challenge') });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  claimReward: async (achievementId) => {
    set({ isLoading: true, error: null });
    try {
      await achievementAPI.claimReward(achievementId);
      set((state) => ({
        achievements: state.achievements.map((a) =>
          a._id === achievementId ? { ...a, rewardClaimed: true } : a
        ),
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to claim reward') });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
