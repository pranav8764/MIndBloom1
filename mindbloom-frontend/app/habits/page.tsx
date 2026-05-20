'use client';

import { useEffect, useState } from 'react';
import { habitAPI } from '@/lib/api';

interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  streak: number;
  completedToday: boolean;
  createdAt: string;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily' as const,
    category: '',
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setIsLoading(true);
    try {
      const { data } = await habitAPI.getHabits();
      setHabits(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await habitAPI.createHabit(formData);
      setFormData({ name: '', description: '', frequency: 'daily', category: '' });
      setShowForm(false);
      loadHabits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create habit');
    }
  };

  const handleCheckIn = async (habitId: string) => {
    try {
      await habitAPI.updateHabit(habitId, { completedToday: true });
      loadHabits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check in habit');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
      await habitAPI.deleteHabit(habitId);
      loadHabits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete habit');
    }
  };

  const frequencyEmojis = { daily: '📅', weekly: '🔄', monthly: '📆' };
  const categoryEmojis: { [key: string]: string } = {
    health: '💪',
    productivity: '🚀',
    learning: '📚',
    wellness: '🧘',
    other: '⭐',
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading habits...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎯 My Habits</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : 'New Habit'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Habit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Morning meditation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Why is this habit important to you?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="health">Health</option>
                  <option value="productivity">Productivity</option>
                  <option value="learning">Learning</option>
                  <option value="wellness">Wellness</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Habit
            </button>
          </form>
        </div>
      )}

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No habits yet. Start building positive routines!</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`rounded-lg shadow p-6 transition ${
                habit.completedToday ? 'bg-green-50 border-2 border-green-400' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{habit.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {frequencyEmojis[habit.frequency]} {habit.frequency}
                  </p>
                </div>
                <span className="text-2xl">{categoryEmojis[habit.category] || '⭐'}</span>
              </div>

              {habit.description && <p className="text-gray-600 text-sm mb-4">{habit.description}</p>}

              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">🔥 {habit.streak}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCheckIn(habit.id)}
                  disabled={habit.completedToday}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    habit.completedToday
                      ? 'bg-green-200 text-green-700 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {habit.completedToday ? '✓ Done Today' : 'Check In'}
                </button>
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                  title="Delete habit"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
