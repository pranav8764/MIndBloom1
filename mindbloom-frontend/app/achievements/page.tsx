'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';

export default function AchievementsPage() {
  const { achievements, getAchievements, isLoading } = useGamificationStore();

  useEffect(() => {
    getAchievements();
  }, [getAchievements]);

  if (isLoading) {
    return <div className="text-center py-12">Loading achievements...</div>;
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Achievements</h1>
        <p className="text-gray-600">
          You've unlocked {unlockedCount} of {achievements.length} achievements
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
        <p className="text-center text-gray-600 mt-2 text-sm">
          {Math.round((unlockedCount / achievements.length) * 100)}% Complete
        </p>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-lg shadow p-6 transition transform hover:scale-105 ${
              achievement.unlocked
                ? 'bg-white border-2 border-yellow-400'
                : 'bg-gray-100 opacity-75'
            }`}
          >
            <div className="text-4xl mb-3">{achievement.icon}</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{achievement.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

            {achievement.progress !== undefined && (
              <div className="mb-4">
                <div className="relative h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.progress} / {achievement.maxProgress}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-blue-600">+{achievement.reward} XP</span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  achievement.unlocked
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {achievement.unlocked ? '✓ Unlocked' : 'Locked'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
