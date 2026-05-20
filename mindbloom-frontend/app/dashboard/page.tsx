'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useJournalStore } from '@/stores/journalStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { StatsSkeleton, ListSkeleton } from '@/components/Skeletons';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getStreak, streak, getMoodStats, moodStats } = useJournalStore();
  const { getAchievements, achievements } = useGamificationStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([getStreak(), getMoodStats(), getAchievements()]);
      } catch (err: any) {
        setError('Failed to load dashboard data. Please refresh the page.');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getStreak, getMoodStats, getAchievements]);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <StatsSkeleton />
        <ListSkeleton />
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div>
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.username || 'User'}! 👋
        </h1>
        <p className="text-gray-600">Here's your wellness overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Level</h3>
          <p className="text-4xl font-bold text-blue-600">{user?.level || 1}</p>
          <p className="text-sm text-gray-500 mt-2">
            {user?.xp || 0} / {user?.totalXP || 1000} XP
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Streak 🔥</h3>
          <p className="text-4xl font-bold text-orange-600">{streak}</p>
          <p className="text-sm text-gray-500 mt-2">days in a row</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Achievements 🏆</h3>
          <p className="text-4xl font-bold text-purple-600">{unlockedCount}</p>
          <p className="text-sm text-gray-500 mt-2">of {achievements.length} unlocked</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Status</h3>
          <p className="text-4xl font-bold text-green-600">✓</p>
          <p className="text-sm text-gray-500 mt-2">keeping it up!</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Overall Progress</h2>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
            style={{
              width: `${
                ((user?.level || 1) / 10) * 100 + ((user?.xp || 0) / ((user?.totalXP || 1000) * 10)) * 10
              }%`,
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/journal"
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition text-center"
          >
            <p className="text-2xl mb-2">📔</p>
            <p className="font-semibold text-blue-600">New Journal</p>
            <p className="text-xs text-gray-600 mt-1">Reflect & journal</p>
          </Link>

          <Link
            href="/challenges"
            className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 transition text-center"
          >
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-semibold text-orange-600">Challenges</p>
            <p className="text-xs text-gray-600 mt-1">Join & compete</p>
          </Link>

          <Link
            href="/achievements"
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 transition text-center"
          >
            <p className="text-2xl mb-2">🏆</p>
            <p className="font-semibold text-purple-600">Achievements</p>
            <p className="text-xs text-gray-600 mt-1">Track progress</p>
          </Link>

          <Link
            href="/habits"
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 transition text-center"
          >
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-semibold text-green-600">Habits</p>
            <p className="text-xs text-gray-600 mt-1">Build routines</p>
          </Link>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Tips for Success</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✨ Journal daily to maintain your streak</li>
          <li>🏆 Unlock achievements by reaching milestones</li>
          <li>🎯 Join challenges to compete with others</li>
          <li>🎯 Build habits for sustainable growth</li>
        </ul>
      </div>
    </div>
  );
}
