import { useState, useEffect } from 'react';
import './Challenges.css';
import { challengeService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const Challenges = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('explore');
  const [joinCode, setJoinCode] = useState('');
  
  // State for real challenges
  const [publicChallenges, setPublicChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState('all-categories');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');

  // New challenge form state
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    category: 'Meditation',
    difficulty: 'Beginner',
    duration: 7,
    startDate: new Date().toISOString().split('T')[0],
    isPublic: true,
    tasks: [{ name: '', description: '', duration: 10 }]
  });

  // Challenge categories for filtering/creation
  const categories = [
    'All Categories',
    'Meditation',
    'Exercise',
    'Journaling',
    'Habits',
    'Sleep',
    'Nutrition',
    'Social',
    'Other'
  ];

  // Fetch all challenges from backend
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const publicData = await challengeService.getChallenges();
      const activeData = await challengeService.getActiveUserChallenges();
      setPublicChallenges(publicData.challenges || []);
      setMyChallenges(activeData || []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Handle joining a challenge
  const handleJoinChallenge = async (challengeId) => {
    try {
      setError(null);
      await challengeService.joinChallenge(challengeId);
      alert("You've successfully joined the challenge!");
      await fetchChallenges();
      setActiveTab('my-challenges');
    } catch (err) {
      console.error('Error joining challenge:', err);
      alert(err.response?.data?.message || 'Failed to join challenge. Please try again.');
    }
  };
  
  // Handle joining a private challenge with a code
  const handleJoinPrivate = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      alert('Please enter a valid join code');
      return;
    }
    
    try {
      setError(null);
      await challengeService.joinChallenge(joinCode.trim().toUpperCase());
      alert("You've successfully joined the private challenge!");
      setJoinCode('');
      await fetchChallenges();
      setActiveTab('my-challenges');
    } catch (err) {
      console.error('Error joining private challenge:', err);
      alert(err.response?.data?.message || 'Invalid join code. Please check and try again.');
    }
  };
  
  // Handle creating a new challenge
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    
    if (!newChallenge.title.trim()) {
      alert('Please enter a challenge title');
      return;
    }
    if (!newChallenge.description.trim()) {
      alert('Please enter a challenge description');
      return;
    }
    
    const validTasks = newChallenge.tasks.filter(t => t.name.trim());
    if (validTasks.length === 0) {
      alert('Please add at least one task to the challenge');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const start = new Date(newChallenge.startDate);
      const end = new Date(start.getTime() + parseInt(newChallenge.duration) * 24 * 60 * 60 * 1000);
      
      const payload = {
        title: newChallenge.title,
        description: newChallenge.description,
        category: newChallenge.category,
        difficulty: newChallenge.difficulty,
        duration: parseInt(newChallenge.duration),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        isPublic: newChallenge.isPublic,
        tasks: validTasks
      };
      
      await challengeService.createChallenge(payload);
      alert('Challenge created successfully!');
      
      // Reset form
      setNewChallenge({
        title: '',
        description: '',
        category: 'Meditation',
        difficulty: 'Beginner',
        duration: 7,
        startDate: new Date().toISOString().split('T')[0],
        isPublic: true,
        tasks: [{ name: '', description: '', duration: 10 }]
      });
      
      await fetchChallenges();
      setActiveTab('my-challenges');
    } catch (err) {
      console.error('Error creating challenge:', err);
      setError(err.response?.data?.message || 'Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...newChallenge.tasks];
    updatedTasks[index][field] = value;
    setNewChallenge({ ...newChallenge, tasks: updatedTasks });
  };

  const addEmptyTask = () => {
    setNewChallenge({
      ...newChallenge,
      tasks: [...newChallenge.tasks, { name: '', description: '', duration: 10 }]
    });
  };

  const removeTaskField = (index) => {
    if (newChallenge.tasks.length === 1) return;
    const updatedTasks = newChallenge.tasks.filter((_, i) => i !== index);
    setNewChallenge({ ...newChallenge, tasks: updatedTasks });
  };

  // Check in for a challenge task (completing the first incomplete task)
  const handleCheckInChallenge = async (challenge) => {
    try {
      const userId = currentUser?._id || currentUser?.id;
      if (!userId) return;

      const participant = challenge.participants?.find(
        p => (p.user?._id || p.user || '').toString() === userId.toString()
      );

      if (!participant) return;

      let taskToComplete = null;

      // In the legacy progress array, find the first incomplete task
      if (Array.isArray(participant.progress)) {
        const incomplete = participant.progress.find(p => !p.isCompleted);
        if (incomplete) {
          taskToComplete = challenge.tasks?.find(t => t._id === incomplete.taskId);
        }
      } else {
        // Fallback or post-schema progress number check in:
        // just complete the first task
        taskToComplete = challenge.tasks?.[0];
      }

      if (!taskToComplete) {
        alert('All tasks in this challenge are already completed today!');
        return;
      }

      setLoading(true);
      setError(null);
      await challengeService.completeTask(challenge._id, taskToComplete._id);
      alert(`Completed task: "${taskToComplete.name}"! +10 XP`);
      await fetchChallenges();
    } catch (err) {
      console.error('Error completing task:', err);
      alert(err.response?.data?.message || 'Failed to complete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Safe progress calculator
  const getProgressPercentage = (challenge) => {
    const userId = currentUser?._id || currentUser?.id;
    if (!challenge || !userId) return 0;
    
    const participant = challenge.participants?.find(
      p => (p.user?._id || p.user || '').toString() === userId.toString()
    );
    
    if (!participant) return 0;
    
    if (typeof participant.progress === 'number') {
      return participant.progress;
    }
    
    if (Array.isArray(participant.progress)) {
      const completed = participant.progress.filter(p => p.isCompleted).length;
      const total = challenge.tasks?.length || 1;
      return Math.round((completed / total) * 100);
    }
    
    return 0;
  };

  // Client-side filtering of explore challenges
  const filteredChallenges = publicChallenges.filter(challenge => {
    if (categoryFilter !== 'all-categories') {
      const mappedCat = categoryFilter.replace('-', ' ');
      if (challenge.category?.toLowerCase() !== mappedCat.toLowerCase()) {
        return false;
      }
    }
    
    if (difficultyFilter !== 'all') {
      if (challenge.difficulty?.toLowerCase() !== difficultyFilter.toLowerCase()) {
        return false;
      }
    }
    
    if (durationFilter !== 'all') {
      const days = parseInt(challenge.duration);
      if (durationFilter === 'short' && (isNaN(days) || days > 7)) return false;
      if (durationFilter === 'medium' && (isNaN(days) || days <= 7 || days > 28)) return false;
      if (durationFilter === 'long' && (isNaN(days) || days <= 28)) return false;
    }
    
    return true;
  });
  
  return (
    <div className="challenges-page">
      <div className="challenges-header">
        <h1>Wellness Challenges</h1>
        <p>Join challenges to build habits and connect with others on their wellness journey</p>
      </div>
      
      <div className="challenges-tabs">
        <button 
          className={`tab-button ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          Explore Challenges
        </button>
        <button 
          className={`tab-button ${activeTab === 'my-challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-challenges')}
        >
          My Challenges
        </button>
        <button 
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Challenge
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading && (
        <div className="loading-container">
          <p>Loading challenges data...</p>
        </div>
      )}
      
      {!loading && activeTab === 'explore' && (
        <div className="challenges-content">
          <div className="challenges-filters">
            <div className="filter-group">
              <label>Category:</label>
              <select 
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Difficulty:</label>
              <select 
                className="filter-select"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Duration:</label>
              <select 
                className="filter-select"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
              >
                <option value="all">Any Duration</option>
                <option value="short">Short (1-7 days)</option>
                <option value="medium">Medium (1-4 weeks)</option>
                <option value="long">Long (1+ months)</option>
              </select>
            </div>
          </div>
          
          <div className="join-private">
            <form onSubmit={handleJoinPrivate} className="join-private-form">
              <input 
                type="text" 
                placeholder="Enter private challenge code (e.g. ABCDEFGH)" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="join-code-input"
              />
              <button type="submit" className="btn btn-secondary">Join Private Challenge</button>
            </form>
          </div>
          
          {filteredChallenges.length > 0 ? (
            <div className="challenges-grid">
              {filteredChallenges.map(challenge => (
                <div className="challenge-card" key={challenge._id}>
                  <div className="challenge-category">{challenge.category}</div>
                  <h3 className="challenge-title">{challenge.title}</h3>
                  <p className="challenge-description">{challenge.description}</p>
                  
                  <div className="challenge-details">
                    <div className="challenge-detail">
                      <span className="detail-label">Difficulty:</span>
                      <span className="detail-value">{challenge.difficulty || 'Beginner'}</span>
                    </div>
                    <div className="challenge-detail">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{challenge.duration} days</span>
                    </div>
                    <div className="challenge-detail">
                      <span className="detail-label">Starts:</span>
                      <span className="detail-value">{new Date(challenge.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="challenge-detail">
                      <span className="detail-label">Participants:</span>
                      <span className="detail-value">{challenge.participants?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="challenge-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleJoinChallenge(challenge._id)}
                    >
                      Join Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-challenges">
              <p>No challenges match your filters.</p>
            </div>
          )}
        </div>
      )}
      
      {!loading && activeTab === 'my-challenges' && (
        <div className="challenges-content">
          {myChallenges.length > 0 ? (
            <div className="my-challenges-grid">
              {myChallenges.map(challenge => {
                const progress = getProgressPercentage(challenge);
                return (
                  <div className="my-challenge-card" key={challenge._id}>
                    <div className="challenge-header">
                      <div className="challenge-category">{challenge.category}</div>
                      {!challenge.isPublic && (
                        <div className="private-badge">
                          Private <span className="join-code-display">{challenge.joinCode}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="challenge-title">{challenge.title}</h3>
                    <p className="challenge-description">{challenge.description}</p>
                    
                    <div className="challenge-progress">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="challenge-details">
                      <div className="challenge-detail">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{challenge.duration} days</span>
                      </div>
                      <div className="challenge-detail">
                        <span className="detail-label">Participants:</span>
                        <span className="detail-value">{challenge.participants?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="challenge-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleCheckInChallenge(challenge)}
                        disabled={progress >= 100}
                      >
                        {progress >= 100 ? 'Completed!' : 'Check In Today'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-challenges">
              <p>You haven't joined any challenges yet.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => setActiveTab('explore')}
              >
                Explore Challenges
              </button>
            </div>
          )}
        </div>
      )}
      
      {!loading && activeTab === 'create' && (
        <div className="challenges-content">
          <div className="create-challenge-container">
            <h2>Create Your Own Challenge</h2>
            <p className="create-intro">
              Create a custom challenge, add daily tasks, and inspire others on their wellness journey.
            </p>
            
            <form onSubmit={handleCreateChallenge} className="create-challenge-form">
              <div className="form-group">
                <label htmlFor="title">Challenge Title</label>
                <input 
                  type="text" 
                  id="title"
                  className="form-control"
                  placeholder="e.g. 7 Days of Morning Gratitude"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description"
                  className="form-control"
                  rows="3"
                  placeholder="Describe the challenge goals, tasks, and what participants should expect..."
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select 
                    id="category"
                    className="form-control"
                    value={newChallenge.category}
                    onChange={(e) => setNewChallenge({...newChallenge, category: e.target.value})}
                  >
                    {categories.slice(1).map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty</label>
                  <select 
                    id="difficulty"
                    className="form-control"
                    value={newChallenge.difficulty}
                    onChange={(e) => setNewChallenge({...newChallenge, difficulty: e.target.value})}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration (days)</label>
                  <input 
                    type="number" 
                    id="duration"
                    className="form-control"
                    min="1"
                    max="365"
                    value={newChallenge.duration}
                    onChange={(e) => setNewChallenge({...newChallenge, duration: parseInt(e.target.value) || 7})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input 
                    type="date" 
                    id="startDate"
                    className="form-control"
                    value={newChallenge.startDate}
                    onChange={(e) => setNewChallenge({...newChallenge, startDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group" onClick={() => setNewChallenge({...newChallenge, isPublic: !newChallenge.isPublic})}>
                <input 
                  type="checkbox" 
                  id="isPublic"
                  checked={newChallenge.isPublic}
                  onChange={(e) => setNewChallenge({...newChallenge, isPublic: e.target.checked})}
                />
                <label htmlFor="isPublic">Make this challenge public (anyone can discover and join)</label>
              </div>

              <div className="tasks-section">
                <h3>
                  <span>Challenge Tasks</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addEmptyTask}>
                    + Add Task
                  </button>
                </h3>
                
                {newChallenge.tasks.map((task, index) => (
                  <div key={index} className="task-inputs-row">
                    <div className="form-group task-input-field">
                      <input 
                        type="text" 
                        placeholder="Task name (e.g. Write down 3 items of gratitude)" 
                        className="form-control"
                        value={task.name}
                        onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group task-duration-field">
                      <input 
                        type="number" 
                        placeholder="Mins" 
                        title="Duration in minutes"
                        className="form-control"
                        min="0"
                        value={task.duration}
                        onChange={(e) => handleTaskChange(index, 'duration', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    {newChallenge.tasks.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={() => removeTaskField(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                Create Challenge
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;