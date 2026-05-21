import { create } from 'zustand';
import { journalAPI } from '@/lib/api';

export interface JournalEntry {
  id: string;
  _id: string;
  content: string;
  mood: number;
  tags: string[];
  date: string;
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
      const { data: response } = await journalAPI.createEntry(data);
      set((state) => ({ entries: [response.journalEntry, ...state.entries] }));
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
      set({ entries: data.journalEntries ?? [] });
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
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await journalAPI.getMoodStats({ startDate, endDate });
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
