'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const { user, updateProfile, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [hasEdited, setHasEdited] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const effectiveFormData = user && !hasEdited ? { username: user.username, email: user.email } : formData;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHasEdited(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile(effectiveFormData);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <Link href="/dashboard" className="font-medium text-slate-900 hover:text-slate-700">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-6 rounded-full bg-slate-100 p-6 text-6xl">👤</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">{user?.username}</h2>
          <p className="text-slate-600 mb-6">{user?.email}</p>
          <div className="space-y-4">
            <div className="rounded-[24px] bg-slate-50 p-4 text-left">
              <p className="text-sm text-slate-500">Level</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{user?.level}</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4 text-left">
              <p className="text-sm text-slate-500">Total XP</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{user?.totalXP}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-slate-900 mb-6">Edit Profile</h3>

          {error && (
            <div className="mb-4 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-rose-700">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={effectiveFormData.username}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={effectiveFormData.email}
                onChange={handleChange}
                disabled
                className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
              />
              <p className="mt-2 text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
