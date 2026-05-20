import { create } from 'zustand';
import { achievementAPI, challengeAPI } from '@/lib/api';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  joined: boolean;
  participants: number;
  createdAt: string;
}

interface GamificationState {
  achievements: Achievement[];
  activeChallenges: Challenge[];
  allChallenges: Challenge[];
  isLoading: boolean;
  error: string | null;

  // Actions
  getAchievements: () => Promise<void>;
  getChallenges: (params?: any) => Promise<void>;
  getActiveChallenges: () => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  claimReward: (achievementId: string) => Promise<void>;
  clearError: () => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  achievements: [],
  activeChallenges: [],
  allChallenges: [],
  isLoading: false,
  error: null,

  getAchievements: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await achievementAPI.getAchievements();
      set({ achievements: data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch achievements' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getChallenges: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await challengeAPI.getChallenges(params);
      set({ allChallenges: data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch challenges' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getActiveChallenges: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await challengeAPI.getActiveChallenges();
      set({ activeChallenges: data });
    } catch (error: any) {
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
        allChallenges: state.allChallenges.map((c) =>
          c.id === challengeId ? { ...c, joined: true, participants: c.participants + 1 } : c
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to join challenge' });
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
          a.id === achievementId ? { ...a, unlocked: true } : a
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to claim reward' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
