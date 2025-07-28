import { useState, useEffect } from 'react';
import { journalService } from '../../services/apiService';
import './Journal.css';

const Journal = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [mood, setMood] = useState(5);
  const [journalText, setJournalText] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');

  // Journal entries fetched from API
  const [journalEntries, setJournalEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  // Fetch entries on mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { journalEntries } = await journalService.getEntries();
        setJournalEntries(journalEntries);
      } catch (err) {
        console.error('Failed to fetch journal entries', err);
      } finally {
        setLoadingEntries(false);
      }
    };
    fetchEntries();
  }, []);

  // Journal prompts
  const journalPrompts = [
    "What are three things you're grateful for today?",
    "How did you practice self-care today?",
    "What was challenging today and how did you handle it?",
    "What made you smile today?",
    "What's something you learned today?",
    "What's one thing you'd like to improve tomorrow?",
    "Describe a moment that brought you peace today.",
    "What boundaries did you set or maintain today?",
    "How did you move your body today?",
    "What's something kind you did for someone else today?"
  ];

  // Mood labels
  const moodLabels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Somewhat Low',
    4: 'Neutral',
    5: 'Okay',
    6: 'Good',
    7: 'Very Good',
    8: 'Great',
    9: 'Excellent',
    10: 'Amazing'
  };

  // Handle journal submission
  const handleSubmitJournal = async (e) => {
    e.preventDefault();

    if (journalText.trim() === '') {
      alert('Please write something in your journal entry');
      return;
    }

    const entryData = {
      mood,
      content: journalText,
      prompt: selectedPrompt,
      tags: [],
      gratitude: [],
      activities: []
    };
    // Optimistic update
    const tempId = Date.now();
    const optimisticEntry = {
      _id: tempId,
      date: new Date().toISOString(),
      ...entryData
    };
    setJournalEntries([optimisticEntry, ...journalEntries]);

    try {
      const { journalEntry } = await journalService.createEntry(entryData);
      // Replace temp entry with real entry
      setJournalEntries((prev) => prev.map((e) => (e._id === tempId ? journalEntry : e)));
    } catch (err) {
      console.error('Failed to save journal entry', err);
      // Rollback optimistic update
      setJournalEntries((prev) => prev.filter((e) => e._id !== tempId));
      alert('Failed to save entry. Please try again.');
    }
    setJournalText('');
    setMood(5);
    setSelectedPrompt('');
    setActiveTab('history');
  };

  // Handle selecting a prompt
  const handleSelectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setJournalText(journalText ? `${journalText}\n\n${prompt}\n` : `${prompt}\n`);
  };
  
  return (
    <div className="journal-page">
      <div className="journal-header">
        <h1>Your Journal</h1>
        <p>Track your thoughts, feelings, and daily reflections</p>
      </div>
      
      <div className="journal-tabs">
        <button 
          className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          New Entry
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`tab-button ${activeTab === 'prompts' ? 'active' : ''}`}
          onClick={() => setActiveTab('prompts')}
        >
          Prompts
        </button>
      </div>
      
      {activeTab === 'new' && (
        <div className="journal-content">
          <form onSubmit={handleSubmitJournal} className="journal-form">
            <div className="mood-selector">
              <h3>How are you feeling today?</h3>
              <div className="mood-slider-container">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={mood} 
                  onChange={(e) => setMood(parseInt(e.target.value))}
                  className="mood-slider"
                />
                <div className="mood-value">
                  <span className="mood-number">{mood}</span>
                  <span className="mood-label">{moodLabels[mood]}</span>
                </div>
              </div>
              <div className="mood-emoji-container">
                <span className="mood-emoji">😞</span>
                <span className="mood-emoji">😐</span>
                <span className="mood-emoji">🙂</span>
                <span className="mood-emoji">😄</span>
              </div>
            </div>
            
            <div className="journal-textarea-container">
              <h3>Write your thoughts</h3>
              {selectedPrompt && (
                <div className="selected-prompt">
                  <p>Prompt: {selectedPrompt}</p>
                  <button 
                    type="button" 
                    className="remove-prompt-btn"
                    onClick={() => setSelectedPrompt('')}
                  >
                    ×
                  </button>
                </div>
              )}
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="What's on your mind today?"
                rows="10"
                className="journal-textarea"
              ></textarea>
            </div>
            
            <div className="journal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('prompts')}>
                Use a Prompt
              </button>
              <button type="submit" className="btn btn-primary">
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="journal-content">
          <div className="journal-history">
            {journalEntries.length > 0 ? (
              journalEntries.map(entry => (
                <div className="journal-entry" key={entry.id}>
                  <div className="entry-header">
                    <div className="entry-date">{entry.date}</div>
                    <div className="entry-mood">
                      <span className="mood-indicator" style={{ 
                        backgroundColor: `hsl(${(entry.mood * 12)}, 80%, 60%)` 
                      }}></span>
                      <span className="mood-text">{moodLabels[entry.mood]}</span>
                    </div>
                  </div>
                  <div className="entry-content">
                    <p>{entry.content}</p>
                  </div>
                  {entry.tags.length > 0 && (
                    <div className="entry-tags">
                      {entry.tags.map((tag, index) => (
                        <span className="tag" key={index}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-entries">
                <p>You haven't created any journal entries yet.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActiveTab('new')}
                >
                  Create Your First Entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'prompts' && (
        <div className="journal-content">
          <div className="prompts-container">
            <h3>Journal Prompts</h3>
            <p className="prompts-intro">
              Use these prompts to inspire your journal entries and guide your reflection.
            </p>
            <div className="prompts-list">
              {journalPrompts.map((prompt, index) => (
                <div className="prompt-card" key={index} onClick={() => handleSelectPrompt(prompt)}>
                  <p>{prompt}</p>
                  <button className="use-prompt-btn">Use This Prompt</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;