'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useJournalStore, JournalEntry } from '@/stores/journalStore';

export default function JournalPage() {
  const { entries, getEntries, createEntry, isLoading, error } = useJournalStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'happy',
    tags: '',
  });

  useEffect(() => {
    getEntries();
  }, [getEntries]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const MOOD_VALUES: Record<string, number> = {
    happy: 7,
    excited: 9,
    neutral: 5,
    anxious: 3,
    sad: 2,
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await createEntry({
        content: formData.content,
        mood: MOOD_VALUES[formData.mood] ?? 5,
        tags,
      });
      setFormData({ title: '', content: '', mood: 'happy', tags: '' });
      setShowForm(false);
      getEntries();
    } catch (err) {
      console.error('Failed to create entry:', err);
    }
  };

  const getMoodEmoji = (mood: number | string) => {
    if (typeof mood === 'string') {
      const emojis: Record<string, string> = {
        happy: '😊',
        sad: '😢',
        neutral: '😐',
        anxious: '😰',
        excited: '🤩',
      };
      return emojis[mood] || '😊';
    }
    if (mood >= 8) return '🤩';
    if (mood >= 6) return '😊';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😰';
    return '😢';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 items-start justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900">📔 Journal</h1>
          <p className="mt-2 text-slate-600">Create entries and review your moods over time.</p>
        </div>

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          {showForm ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {showForm && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Create New Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Today's thoughts..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mood</label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="happy">😊 Happy</option>
                <option value="sad">😢 Sad</option>
                <option value="neutral">😐 Neutral</option>
                <option value="anxious">😰 Anxious</option>
                <option value="excited">🤩 Excited</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full min-h-[10rem] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Write your thoughts and feelings..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="wellness, productivity, reflection..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Entry'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600 mb-4">No journal entries yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Create Your First Entry
            </button>
          </div>
        ) : (
          entries.map((entry: JournalEntry) => (
            <div key={entry._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm text-slate-500">
                  {new Date(entry.date || entry.createdAt).toLocaleDateString()} {getMoodEmoji(entry.mood)}
                </p>
              </div>
              <p className="mt-4 text-slate-700">{entry.content}</p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
