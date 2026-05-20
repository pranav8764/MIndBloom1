'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const { user, updateProfile, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div>
      <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{user?.username}</h2>
            <p className="text-gray-600 mb-4">{user?.email}</p>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold text-blue-600">{user?.level}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total XP</p>
                <p className="text-2xl font-bold text-purple-600">{user?.totalXP}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h3>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
            {successMessage && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
