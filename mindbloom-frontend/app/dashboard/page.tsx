'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useJournalStore } from '@/stores/journalStore';
import { useGamificationStore } from '@/stores/gamificationStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { getStreak, streak, getMoodStats } = useJournalStore();
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
    return <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">Loading dashboard...</div>;
  }

  const unlockedCount = achievements.filter((achievement) => achievement.isCompleted).length;

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">Welcome back, {user?.username}! 👋</h1>
            <p className="mt-2 text-slate-600">Here&apos;s your wellness overview.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-3 text-sm font-medium text-slate-700">
            Last updated just now
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Level</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{user?.level || 1}</p>
          <p className="mt-2 text-sm text-slate-500">{user?.xp || 0} / {user?.totalXP || 1000} XP</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Streak</p>
          <p className="mt-4 text-4xl font-semibold text-orange-600">{streak}</p>
          <p className="mt-2 text-sm text-slate-500">days in a row</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Achievements</p>
          <p className="mt-4 text-4xl font-semibold text-purple-600">{unlockedCount}</p>
          <p className="mt-2 text-sm text-slate-500">of {achievements.length} unlocked</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Mood</p>
          <p className="mt-4 text-4xl font-semibold text-green-600">😊</p>
          <p className="mt-2 text-sm text-slate-500">overall good</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Quick Actions</h2>
          <p className="text-sm text-slate-500">Access core workflows fast.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/journal"
            className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-slate-300 hover:bg-white"
          >
            <p className="text-3xl mb-3">📔</p>
            <p className="font-semibold text-slate-900">New Journal Entry</p>
            <p className="mt-2 text-sm text-slate-500">Reflect on your day</p>
          </Link>

          <Link
            href="/challenges"
            className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-slate-300 hover:bg-white"
          >
            <p className="text-3xl mb-3">🎯</p>
            <p className="font-semibold text-slate-900">Join Challenge</p>
            <p className="mt-2 text-sm text-slate-500">Take on a new challenge</p>
          </Link>

          <Link
            href="/achievements"
            className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-slate-300 hover:bg-white"
          >
            <p className="text-3xl mb-3">🏆</p>
            <p className="font-semibold text-slate-900">View Achievements</p>
            <p className="mt-2 text-sm text-slate-500">Track your progress</p>
          </Link>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <p className="text-slate-600">Check out your journal, achievements, and challenges for detailed activity.</p>
      </div>
    </div>
  );
}
