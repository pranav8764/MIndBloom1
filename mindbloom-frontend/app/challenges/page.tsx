'use client';

import { useEffect, useState } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';

const filterItems = [
  { value: 'all', label: 'All' },
  { value: 'joined', label: 'Joined' },
  { value: 'available', label: 'Available' },
];

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

export default function ChallengesPage() {
  const { allChallenges, joinedIds, getChallenges, getActiveChallenges, joinChallenge, isLoading } = useGamificationStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getChallenges();
    getActiveChallenges();
  }, [getChallenges, getActiveChallenges]);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const filteredChallenges = allChallenges.filter((challenge) => {
    const joined = joinedIds.includes(challenge._id);
    if (filter === 'joined') return joined;
    if (filter === 'available') return !joined;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">🎯 Challenges</h1>
            <p className="mt-2 text-slate-600">Find new challenges and track your progress.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {filterItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">Loading challenges...</div>
      )}

      {!isLoading && filteredChallenges.length === 0 && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">
            {filter === 'joined'
              ? "You haven't joined any challenges yet."
              : filter === 'available'
              ? 'No available challenges right now.'
              : 'No challenges found.'}
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredChallenges.map((challenge) => {
          const joined = joinedIds.includes(challenge._id);
          return (
            <div key={challenge._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{challenge.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{challenge.category}</p>
                </div>
                {challenge.difficulty && (
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${difficultyColors[challenge.difficulty] || 'bg-slate-100 text-slate-700'}`}>
                    {challenge.difficulty}
                  </span>
                )}
              </div>
              <p className="text-slate-600 mb-6">{challenge.description}</p>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <span>👥 {challenge.participants?.length ?? 0} participants</span>
                <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => handleJoinChallenge(challenge._id)}
                disabled={joined || isLoading}
                className={`w-full rounded-full py-3 text-sm font-semibold transition ${
                  joined
                    ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50'
                }`}
              >
                {joined ? '✓ Joined' : 'Join Challenge'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
