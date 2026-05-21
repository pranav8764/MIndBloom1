'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';

export default function AchievementsPage() {
  const { achievements, getAchievements, isLoading } = useGamificationStore();

  useEffect(() => {
    getAchievements();
  }, [getAchievements]);

  if (isLoading) {
    return <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">Loading achievements...</div>;
  }

  const unlockedCount = achievements.filter((achievement) => achievement.isCompleted).length;

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">🏆 Achievements</h1>
            <p className="mt-2 text-slate-600">You&apos;ve unlocked {unlockedCount} of {achievements.length} achievements.</p>
          </div>
          <div className="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
            {achievements.length ? `${Math.round((unlockedCount / achievements.length) * 100)}% Complete` : '0% Complete'}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-violet-600 transition-all duration-500"
            style={{ width: achievements.length ? `${(unlockedCount / achievements.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement._id}
            className={`rounded-[28px] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
              achievement.isCompleted ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-95'
            }`}
          >
            <div className="text-4xl mb-4">{achievement.icon || '🏅'}</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{achievement.title}</h3>
            <p className="text-sm leading-6 text-slate-600 mb-6">{achievement.description}</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-sky-500 transition-all"
                    style={{ width: `${achievement.target ? (achievement.currentValue / achievement.target) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{achievement.currentValue} / {achievement.target}</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-sky-600">+{achievement.xpReward} XP</span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${achievement.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  {achievement.isCompleted ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
