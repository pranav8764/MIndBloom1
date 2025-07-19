import { useState } from 'react';
import './Challenges.css';

const Challenges = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [joinCode, setJoinCode] = useState('');
  
  // Mock data for challenges
  const [publicChallenges, setPublicChallenges] = useState([
    {
      id: 1,
      title: '30 Days of Mindfulness',
      description: 'Practice mindfulness for at least 10 minutes every day for 30 days.',
      participants: 245,
      category: 'Meditation',
      difficulty: 'Beginner',
      duration: '30 days',
      startDate: '2023-07-15',
      creator: 'MindBloom Team'
    },
    {
      id: 2,
      title: 'Morning Routine Builder',
      description: 'Establish a consistent morning routine to start your day with intention and energy.',
      participants: 189,
      category: 'Habits',
      difficulty: 'Intermediate',
      duration: '21 days',
      startDate: '2023-07-20',
      creator: 'MindBloom Team'
    },
    {
      id: 3,
      title: 'Gratitude Journal Challenge',
      description: "Write down three things you're grateful for every day for two weeks.",
      participants: 312,
      category: 'Journaling',
      difficulty: 'Beginner',
      duration: '14 days',
      startDate: '2023-07-10',
      creator: 'MindBloom Team'
    }
  ]);
  
  const [myChallenges, setMyChallenges] = useState([
    {
      id: 101,
      title: 'Digital Detox Weekend',
      description: 'Reduce screen time and be more present during weekends.',
      participants: 8,
      category: 'Habits',
      difficulty: 'Intermediate',
      duration: '4 weekends',
      startDate: '2023-07-08',
      creator: 'Alex J.',
      progress: 50,
      isPrivate: true
    }
  ]);
  
  // Challenge categories for filtering
  const categories = [
    'All Categories',
    'Meditation',
    'Exercise',
    'Journaling',
    'Habits',
    'Sleep',
    'Nutrition',
    'Social'
  ];
  
  // Handle joining a challenge
  const handleJoinChallenge = (challengeId) => {
    // In a real app, this would make an API call to join the challenge
    const challengeToJoin = publicChallenges.find(challenge => challenge.id === challengeId);
    
    if (challengeToJoin) {
      // Add to my challenges with 0% progress
      const newChallenge = {
        ...challengeToJoin,
        progress: 0,
        isPrivate: false
      };
      
      setMyChallenges([...myChallenges, newChallenge]);
      alert(`You've joined the "${challengeToJoin.title}" challenge!`);
    }
  };
  
  // Handle joining a private challenge with a code
  const handleJoinPrivate = (e) => {
    e.preventDefault();
    
    if (joinCode.trim() === '') {
      alert('Please enter a valid join code');
      return;
    }
    
    // In a real app, this would validate the code against an API
    if (joinCode === 'FRIEND123') {
      const newPrivateChallenge = {
        id: 102,
        title: 'Friend Group Fitness',
        description: 'Exercise at least 3 times a week with accountability from friends.',
        participants: 5,
        category: 'Exercise',
        difficulty: 'Intermediate',
        duration: '8 weeks',
        startDate: '2023-07-12',
        creator: 'Jamie S.',
        progress: 0,
        isPrivate: true
      };
      
      setMyChallenges([...myChallenges, newPrivateChallenge]);
      setJoinCode('');
      alert("You've successfully joined the private challenge!");
    } else {
      alert('Invalid join code. Please check and try again.');
    }
  };
  
  // Handle creating a new challenge
  const handleCreateChallenge = () => {
    // In a real app, this would open a form or navigate to a create challenge page
    alert('This would open a challenge creation form in the full application.');
  };
  
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
      
      {activeTab === 'explore' && (
        <div className="challenges-content">
          <div className="challenges-filters">
            <div className="filter-group">
              <label>Category:</label>
              <select className="filter-select">
                {categories.map((category, index) => (
                  <option key={index} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Difficulty:</label>
              <select className="filter-select">
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Duration:</label>
              <select className="filter-select">
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
                placeholder="Enter private challenge code" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="join-code-input"
              />
              <button type="submit" className="btn btn-secondary">Join Private Challenge</button>
            </form>
          </div>
          
          <div className="challenges-grid">
            {publicChallenges.map(challenge => (
              <div className="challenge-card" key={challenge.id}>
                <div className="challenge-category">{challenge.category}</div>
                <h3 className="challenge-title">{challenge.title}</h3>
                <p className="challenge-description">{challenge.description}</p>
                
                <div className="challenge-details">
                  <div className="challenge-detail">
                    <span className="detail-label">Difficulty:</span>
                    <span className="detail-value">{challenge.difficulty}</span>
                  </div>
                  <div className="challenge-detail">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{challenge.duration}</span>
                  </div>
                  <div className="challenge-detail">
                    <span className="detail-label">Starts:</span>
                    <span className="detail-value">{challenge.startDate}</span>
                  </div>
                  <div className="challenge-detail">
                    <span className="detail-label">Participants:</span>
                    <span className="detail-value">{challenge.participants}</span>
                  </div>
                </div>
                
                <div className="challenge-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleJoinChallenge(challenge.id)}
                  >
                    Join Challenge
                  </button>
                  <button className="btn btn-text">Learn More</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'my-challenges' && (
        <div className="challenges-content">
          {myChallenges.length > 0 ? (
            <div className="my-challenges-grid">
              {myChallenges.map(challenge => (
                <div className="my-challenge-card" key={challenge.id}>
                  <div className="challenge-header">
                    <div className="challenge-category">{challenge.category}</div>
                    {challenge.isPrivate && <div className="private-badge">Private</div>}
                  </div>
                  
                  <h3 className="challenge-title">{challenge.title}</h3>
                  <p className="challenge-description">{challenge.description}</p>
                  
                  <div className="challenge-progress">
                    <div className="progress-label">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="challenge-details">
                    <div className="challenge-detail">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{challenge.duration}</span>
                    </div>
                    <div className="challenge-detail">
                      <span className="detail-label">Participants:</span>
                      <span className="detail-value">{challenge.participants}</span>
                    </div>
                  </div>
                  
                  <div className="challenge-actions">
                    <button className="btn btn-primary">Check In Today</button>
                    <button className="btn btn-text">View Details</button>
                  </div>
                </div>
              ))}
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
      
      {activeTab === 'create' && (
        <div className="challenges-content">
          <div className="create-challenge-container">
            <h2>Create Your Own Challenge</h2>
            <p className="create-intro">
              Create a custom challenge for yourself or invite friends to join you on your wellness journey.
            </p>
            
            <div className="create-options">
              <div className="create-option-card" onClick={handleCreateChallenge}>
                <div className="option-icon personal-icon"></div>
                <h3>Personal Challenge</h3>
                <p>Create a private challenge just for yourself to build a new habit or reach a goal.</p>
                <button className="btn btn-secondary">Create Personal Challenge</button>
              </div>
              
              <div className="create-option-card" onClick={handleCreateChallenge}>
                <div className="option-icon group-icon"></div>
                <h3>Group Challenge</h3>
                <p>Invite friends to join your challenge and motivate each other to stay consistent.</p>
                <button className="btn btn-secondary">Create Group Challenge</button>
              </div>
              
              <div className="create-option-card" onClick={handleCreateChallenge}>
                <div className="option-icon community-icon"></div>
                <h3>Community Challenge</h3>
                <p>Create a public challenge open to the entire MindBloom community.</p>
                <button className="btn btn-secondary">Create Community Challenge</button>
              </div>
            </div>
            
            <div className="challenge-templates">
              <h3>Or Start with a Template</h3>
              <div className="templates-grid">
                <div className="template-card" onClick={handleCreateChallenge}>
                  <h4>7-Day Meditation</h4>
                  <p>Daily meditation practice for one week</p>
                </div>
                <div className="template-card" onClick={handleCreateChallenge}>
                  <h4>30-Day Gratitude</h4>
                  <p>Daily gratitude journaling for a month</p>
                </div>
                <div className="template-card" onClick={handleCreateChallenge}>
                  <h4>14-Day Digital Detox</h4>
                  <p>Reduce screen time for two weeks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;