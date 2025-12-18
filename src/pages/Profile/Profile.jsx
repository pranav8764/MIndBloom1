import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/apiService';
import './Profile.css';

const Profile = () => {
  const { currentUser: user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const statsData = await userService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) return <div className="profile-page">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Your Profile</h1>
        
        <div className="profile-section">
          <h2>Personal Information</h2>
          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              {error && <div className="error">{error}</div>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <button onClick={() => setEditing(true)} className="btn btn-primary">Edit Profile</button>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Level</h3>
              <p>{user?.level || 1}</p>
            </div>
            <div className="stat-card">
              <h3>XP</h3>
              <p>{user?.xp || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Streak</h3>
              <p>{user?.streakDays || 0} days</p>
            </div>
            <div className="stat-card">
              <h3>Journal Entries</h3>
              <p>{stats.totalJournalEntries || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;