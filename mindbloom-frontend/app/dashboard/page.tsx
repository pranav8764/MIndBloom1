'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useJournalStore } from '@/stores/journalStore';
import { useGamificationStore } from '@/stores/gamificationStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getStreak, streak, getMoodStats, moodStats } = useJournalStore();
  const { getAchievements, achievements } = useGamificationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([getStreak(), getMoodStats(), getAchievements()]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getStreak, getMoodStats, getAchievements]);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const unlockedCount = achievements.filter((a) => a.isCompleted).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600">Here's your wellness overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Level</h3>
          <p className="text-4xl font-bold text-blue-600">{user?.level || 1}</p>
          <p className="text-sm text-gray-500 mt-2">{user?.xp || 0} / {user?.totalXP || 1000} XP</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Streak 🔥</h3>
          <p className="text-4xl font-bold text-orange-600">{streak}</p>
          <p className="text-sm text-gray-500 mt-2">days in a row</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Achievements 🏆</h3>
          <p className="text-4xl font-bold text-purple-600">{unlockedCount}</p>
          <p className="text-sm text-gray-500 mt-2">of {achievements.length} unlocked</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Mood</h3>
          <p className="text-4xl font-bold text-green-600">😊</p>
          <p className="text-sm text-gray-500 mt-2">overall good</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/journal"
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition text-center"
          >
            <p className="text-2xl mb-2">📔</p>
            <p className="font-semibold text-blue-600">New Journal Entry</p>
            <p className="text-sm text-gray-600 mt-1">Reflect on your day</p>
          </Link>

          <Link
            href="/challenges"
            className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 transition text-center"
          >
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-semibold text-orange-600">Join Challenge</p>
            <p className="text-sm text-gray-600 mt-1">Take on a new challenge</p>
          </Link>

          <Link
            href="/achievements"
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 transition text-center"
          >
            <p className="text-2xl mb-2">🏆</p>
            <p className="font-semibold text-purple-600">View Achievements</p>
            <p className="text-sm text-gray-600 mt-1">Track your progress</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-600">Check out your journal, achievements, and challenges for detailed activity.</p>
      </div>
    </div>
  );
}
