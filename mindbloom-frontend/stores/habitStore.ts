import { create } from 'zustand';
import { habitAPI } from '@/lib/api';

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  streak: number;
  completedToday: boolean;
  createdAt: string;
}

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;

  // Actions
  getHabits: () => Promise<void>;
  createHabit: (data: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  isLoading: false,
  error: null,

  getHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await habitAPI.getHabits();
      set({ habits: data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch habits' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createHabit: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: newHabit } = await habitAPI.createHabit(data);
      set((state) => ({ habits: [...state.habits, newHabit] }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create habit' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateHabit: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updated } = await habitAPI.updateHabit(id, data);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? updated : h)),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update habit' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteHabit: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await habitAPI.deleteHabit(id);
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete habit' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
