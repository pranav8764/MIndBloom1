import { create } from 'zustand';
import { journalAPI } from '@/lib/api';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  isLoading: boolean;
  error: string | null;
  moodStats: any;
  streak: number;

  // Actions
  createEntry: (data: Partial<JournalEntry>) => Promise<void>;
  getEntries: (params?: any) => Promise<void>;
  getMoodStats: () => Promise<void>;
  getStreak: () => Promise<void>;
  clearError: () => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,
  moodStats: null,
  streak: 0,

  createEntry: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: entry } = await journalAPI.createEntry(data);
      set((state) => ({ entries: [entry, ...state.entries] }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create entry' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getEntries: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await journalAPI.getEntries(params);
      set({ entries: data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch entries' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getMoodStats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await journalAPI.getMoodStats();
      set({ moodStats: data });
    } catch (error: any) {
      console.error('Failed to fetch mood stats:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getStreak: async () => {
    set({ isLoading: true });
    try {
      const { data } = await journalAPI.getStreak();
      set({ streak: data.streak });
    } catch (error: any) {
      console.error('Failed to fetch streak:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
