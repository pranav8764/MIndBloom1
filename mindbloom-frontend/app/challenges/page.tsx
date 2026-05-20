'use client';

import { useEffect, useState } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';

export default function ChallengesPage() {
  const { allChallenges, getChallenges, joinChallenge, isLoading } = useGamificationStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getChallenges();
  }, [getChallenges]);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const filteredChallenges = allChallenges.filter((challenge) => {
    if (filter === 'joined') return challenge.joined;
    if (filter === 'available') return !challenge.joined;
    return true;
  });

  const difficultyColors: { [key: string]: string } = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">🎯 Challenges</h1>
        <div className="flex gap-2">
          {['all', 'joined', 'available'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="text-center py-12">Loading challenges...</div>}

      {!isLoading && filteredChallenges.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            {filter === 'joined'
              ? 'You haven\'t joined any challenges yet.'
              : filter === 'available'
              ? 'No available challenges right now.'
              : 'No challenges found.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => (
          <div key={challenge.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{challenge.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{challenge.category}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  difficultyColors[challenge.difficulty]
                }`}
              >
                {challenge.difficulty}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{challenge.description}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">👥 {challenge.participants} participants</span>
              <span className="text-sm text-gray-500">
                {new Date(challenge.createdAt).toLocaleDateString()}
              </span>
            </div>

            <button
              onClick={() => handleJoinChallenge(challenge.id)}
              disabled={challenge.joined || isLoading}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                challenge.joined
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              }`}
            >
              {challenge.joined ? '✓ Joined' : 'Join Challenge'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
