import { create } from 'zustand';
import { authAPI } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  totalXP: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getMe: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  getMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.getMe();
      set({ user: data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch user' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updated } = await authAPI.updateProfile(data);
      set({ user: updated });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Update failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
