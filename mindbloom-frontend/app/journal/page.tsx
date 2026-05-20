'use client';

import { useEffect, useState } from 'react';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await createEntry({
        title: formData.title,
        content: formData.content,
        mood: formData.mood,
        tags,
      });
      setFormData({ title: '', content: '', mood: 'happy', tags: '' });
      setShowForm(false);
      getEntries();
    } catch (err) {
      console.error('Failed to create entry:', err);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const emojis: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      neutral: '😐',
      anxious: '😰',
      excited: '🤩',
    };
    return emojis[mood] || '😊';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">📔 Journal</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Today's thoughts..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="happy">😊 Happy</option>
                <option value="sad">😢 Sad</option>
                <option value="neutral">😐 Neutral</option>
                <option value="anxious">😰 Anxious</option>
                <option value="excited">🤩 Excited</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-40"
                placeholder="Write your thoughts and feelings..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="wellness, productivity, reflection..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Entry'}
            </button>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No journal entries yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Entry
            </button>
          </div>
        ) : (
          entries.map((entry: JournalEntry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{entry.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(entry.createdAt).toLocaleDateString()} {getMoodEmoji(entry.mood)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 line-clamp-3">{entry.content}</p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
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
