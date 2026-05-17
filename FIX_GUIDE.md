# MindBloom — Complete Fix Guide

This document lists every bug, incomplete feature, and security issue in the project, with exact code changes required to fix each one. Work through the sections in order — earlier fixes are depended on by later ones.

---

## Table of Contents

1. [Post-Restructure Setup](#1-post-restructure-setup)
2. [Critical Bugs — Backend](#2-critical-bugs--backend)
3. [Critical Bugs — Frontend](#3-critical-bugs--frontend)
4. [Missing Backend Endpoints](#4-missing-backend-endpoints)
5. [Incomplete Features — Challenges Page](#5-incomplete-features--challenges-page)
6. [Incomplete Features — Dashboard](#6-incomplete-features--dashboard)
7. [Schema & Data Mismatches](#7-schema--data-mismatches)
8. [Security Issues](#8-security-issues)
9. [Wiring the Daily Check-In](#9-wiring-the-daily-check-in)
10. [Summary Checklist](#10-summary-checklist)

---

## 1. Post-Restructure Setup

After the folder restructure (`client/` and `server/` are now separate), you must reinstall dependencies.

```bash
# From project root
rm -rf node_modules
npm run setup        # installs deps in client/ and server/
```

Verify `client/.env` contains:
```
VITE_API_URL=http://localhost:5000/api
```

Verify `server/.env` contains:
```
MONGODB_URI=<your-uri>
JWT_SECRET=<strong-random-secret>
PORT=5000
NODE_ENV=development
```

To start both services:
```bash
npm run dev          # runs server + vite concurrently
```

---

## 2. Critical Bugs — Backend

### 2a. XP never awards on habit completion

**File:** `server/routes/habitRoutes.js` — lines 39–43

The route logs an XPLog entry but never increments the user's actual `xp` field. There is a TODO comment where the fix belongs.

**Current code:**
```js
await habit.completeToday();
await XPLog.create({ user: req.userId, action: 'habit', points: 10 });
// TODO: update user XP and check achievements
```

**Fix — replace those three lines with:**
```js
await habit.completeToday();
await XPLog.create({ user: req.userId, action: 'habit', points: 10 });

const User = require('../models/User');
await User.findByIdAndUpdate(req.userId, { $inc: { xp: 10 } });

const user = await User.findById(req.userId);
await user.checkLevelUp();   // call the level-up method defined on the model
```

> Note: If `User` is not already imported at the top of `habitRoutes.js`, add `const User = require('../models/User');` at the top of the file alongside the other requires.

---

### 2b. XP written to non-existent field in challenge task completion

**File:** `server/routes/challengeRoutes.js` — lines 353–358 and 366–368

The code writes to `stats.xp` and `stats.challengesCompleted` which do not exist on the User model. The model has a top-level `xp` field and `stats.completedChallenges`.

**Current code:**
```js
await User.findByIdAndUpdate(req.userId, {
  $inc: {
    'stats.tasksCompleted': 1,
    'stats.xp': xpPerTask          // ← wrong field
  }
});

// ...and further down...
await User.findByIdAndUpdate(req.userId, {
  $inc: { 'stats.xp': bonusXp, 'stats.challengesCompleted': 1 }  // ← both wrong
});
```

**Fix:**
```js
await User.findByIdAndUpdate(req.userId, {
  $inc: {
    'stats.tasksCompleted': 1,
    xp: xpPerTask                  // ← correct: top-level xp
  }
});

// ...and further down...
await User.findByIdAndUpdate(req.userId, {
  $inc: { xp: bonusXp, 'stats.completedChallenges': 1 }  // ← correct field names
});
```

---

### 2c. Achievement sort uses wrong field name

**File:** `server/routes/achievementRoutes.js` — lines 45–48 and 70–73

The code sorts by `completedAt` but the Achievement model defines the field as `completedDate`.

**Current code (appears twice):**
```js
.sort({ completedAt: -1 }).limit(5);
```

**Fix (both occurrences):**
```js
.sort({ completedDate: -1 }).limit(5);
```

---

### 2d. Achievement initialization is commented out after register

**File:** `server/routes/userRoutes.js` — lines 45–49

Default achievements are never created for new users because the call is commented out.

**Current code:**
```js
// Create default achievements for the user
// await Achievement.createDefaultAchievements(user._id);

// Create default badges if they don't exist
// await Badge.createDefaultBadges();
```

**Fix — replace the four commented lines with a direct call to the initialize endpoint logic. The cleanest way is to inline the achievement creation after `await user.save()`:**

```js
await user.save();

// Initialize default achievements for the new user
const defaultAchievements = [
  { user: user._id, title: 'First Steps', description: 'Complete your first journal entry', category: 'Journaling', target: 1, currentValue: 0, xpReward: 50 },
  { user: user._id, title: 'Consistency Champion', description: 'Complete daily check-ins for 7 days', category: 'Streak', target: 7, currentValue: 0, xpReward: 200 },
  { user: user._id, title: 'Gratitude Guru', description: 'Record 10 gratitude entries', category: 'Journaling', target: 10, currentValue: 0, xpReward: 150 },
  { user: user._id, title: 'Challenge Accepted', description: 'Join your first wellness challenge', category: 'Challenges', target: 1, currentValue: 0, xpReward: 100 },
  { user: user._id, title: 'Challenge Master', description: 'Complete 3 wellness challenges', category: 'Challenges', target: 3, currentValue: 0, xpReward: 300 },
];
await Achievement.insertMany(defaultAchievements);
```

---

### 2e. Journal "First Steps" achievement never triggered

**File:** `server/routes/journalRoutes.js` — lines 29–45

The journal POST only checks for the "Gratitude Guru" achievement but never updates "First Steps" (which requires 1 journal entry).

**Current code:**
```js
for (const achievement of journalingAchievements) {
  if (achievement.title === 'Gratitude Guru' && gratitude && gratitude.length > 0) {
    await achievement.updateProgress(gratitude.length);
  }
}
```

**Fix:**
```js
for (const achievement of journalingAchievements) {
  if (achievement.title === 'First Steps') {
    await achievement.updateProgress(1);
  }
  if (achievement.title === 'Gratitude Guru' && gratitude && gratitude.length > 0) {
    await achievement.updateProgress(gratitude.length);
  }
}

// Also update the total journal entries stat on the user
await User.findByIdAndUpdate(req.userId, {
  $inc: { 'stats.totalJournalEntries': 1 }
});
```

> Add `const User = require('../models/User');` at the top of `journalRoutes.js` if it is not already imported.

---

### 2f. Private challenge access not enforced on list endpoint

**File:** `server/routes/challengeRoutes.js` — line 103 (`GET /`)

Any authenticated user can fetch all challenges including private ones simply by not passing `isPublic=true`. The fix is to default the query so private challenges are only visible to their creator or participants.

**Current code (inside the `GET /` handler):**
```js
const query = {};
```

**Fix — replace that line with:**
```js
const query = {
  $or: [
    { isPublic: true },
    { creator: req.userId },
    { 'participants.user': req.userId }
  ]
};
```

This allows a user to see: all public challenges, challenges they created, and challenges they joined — nothing else.

---

### 2g. `GET /api/challenges/:id` returns any challenge to any user

**File:** `server/routes/challengeRoutes.js` — `GET /:id` handler (line 398)

Any authenticated user can fetch any challenge by ID. Add an access check:

**After `if (!challenge)` block, add:**
```js
// Check access: public challenges are visible to all; private only to creator and participants
const isParticipant = challenge.participants.some(
  p => p.user.toString() === req.userId.toString()
);
const isCreator = challenge.creator.toString() === req.userId.toString();

if (!challenge.isPublic && !isCreator && !isParticipant) {
  return res.status(403).json({ message: 'Access denied to this private challenge' });
}
```

---

## 3. Critical Bugs — Frontend

### 3a. Achievement initialization is commented out after login and register

**File:** `client/src/contexts/AuthContext.jsx` — lines 31–40 and 77–81

Both the `initializeUser` effect and the `register` function have the achievement initialization call commented out. Uncomment and restore them.

**In the `initializeUser` effect (around line 31), replace the comment block:**
```js
// if (user && authService.isAuthenticated()) {
//   try {
//     await achievementService.initializeAchievements();
//   } catch (error) {
//     if (error.response && error.response.status !== 400) {
//       console.error('Error initializing achievements:', error);
//     }
//   }
// }
```
**With:**
```js
if (user && authService.isAuthenticated()) {
  try {
    await achievementService.initializeAchievements();
  } catch (error) {
    // 400 means already initialized — that's fine
    if (!error.response || error.response.status !== 400) {
      console.error('Error initializing achievements:', error);
    }
  }
}
```

**In the `register` function (around line 77), replace the comment block:**
```js
// try {
//   await achievementService.initializeAchievements();
// } catch (error) {
//   console.error('Error initializing achievements:', error);
// }
```
**With:**
```js
try {
  await achievementService.initializeAchievements();
} catch (error) {
  if (!error.response || error.response.status !== 400) {
    console.error('Error initializing achievements:', error);
  }
}
```

---

### 3b. `updateAvatar` calls a non-existent endpoint

**File:** `client/src/services/apiService.js` — lines 235–238

`PUT /auth/avatar` does not exist on the server. The correct endpoint is `PUT /auth/me` which already accepts an `avatar` field in the body.

**Current code:**
```js
updateAvatar: async (avatarData) => {
  const response = await api.put("/auth/avatar", avatarData);
  return response.data;
},
```

**Fix:**
```js
updateAvatar: async (avatarUrl) => {
  const response = await api.put("/auth/me", { avatar: avatarUrl });
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
},
```

---

### 3c. `getLeaderboard` calls a non-existent endpoint

**File:** `client/src/services/apiService.js` — lines 240–245

`GET /auth/leaderboard` does not exist. You have two options: implement the backend route (see Fix 4b), or remove the frontend call until it is built. Remove for now to prevent silent 404s:

**Current code:**
```js
getLeaderboard: async (limit = 10) => {
  const response = await api.get("/auth/leaderboard", {
    params: { limit },
  });
  return response.data;
},
```

**Fix — stub it so it doesn't crash callers while the backend route is missing:**
```js
getLeaderboard: async (_limit = 10) => {
  // TODO: implement GET /auth/leaderboard on the server
  return [];
},
```

---

## 4. Missing Backend Endpoints

### 4a. Add `GET /auth/leaderboard` route

**File:** `server/routes/userRoutes.js` — add before `module.exports`

```js
// @route   GET /api/auth/leaderboard
// @desc    Get top users by XP
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find({})
      .select('username firstName lastName avatar xp level')
      .sort({ xp: -1 })
      .limit(limit);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
```

Then update `client/src/services/apiService.js` `getLeaderboard` to restore the real call:
```js
getLeaderboard: async (limit = 10) => {
  const response = await api.get("/auth/leaderboard", { params: { limit } });
  return response.data;
},
```

---

## 5. Incomplete Features — Challenges Page

The entire `client/src/pages/Challenges/Challenges.jsx` uses local mock state and `alert()`. Every interaction needs to call the API via `challengeService`.

### 5a. Load real challenges on mount

**At the top of the `Challenges` component, add the import and state:**
```js
import { useState, useEffect } from 'react';
import { challengeService } from '../../services/apiService';
import './Challenges.css';
```

**Replace the hardcoded `publicChallenges` and `myChallenges` state with:**
```js
const [publicChallenges, setPublicChallenges] = useState([]);
const [myChallenges, setMyChallenges] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**Add a `useEffect` to load data:**
```js
useEffect(() => {
  const loadChallenges = async () => {
    try {
      setLoading(true);
      const [publicData, activeData] = await Promise.all([
        challengeService.getChallenges({ isPublic: 'true' }),
        challengeService.getActiveUserChallenges(),
      ]);
      setPublicChallenges(publicData.challenges || []);
      setMyChallenges(activeData || []);
    } catch (err) {
      setError('Failed to load challenges');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  loadChallenges();
}, []);
```

---

### 5b. Wire `handleJoinChallenge` to the API

**Replace the entire `handleJoinChallenge` function:**
```js
const handleJoinChallenge = async (challengeId) => {
  try {
    await challengeService.joinChallenge(challengeId);
    // Refresh my challenges list after joining
    const activeData = await challengeService.getActiveUserChallenges();
    setMyChallenges(activeData || []);
    alert('Successfully joined the challenge!');
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to join challenge');
  }
};
```

---

### 5c. Wire `handleJoinPrivate` to the API

Private challenges are joined via the normal `joinChallenge` endpoint — the join code identifies the challenge. You first need to look up the challenge by its code. The current server has an `invitedUsers` array but no join-code lookup. For now, wire the private join to use the challenge ID entered in the field (until a proper join-code system is built):

**Replace `handleJoinPrivate`:**
```js
const handleJoinPrivate = async (e) => {
  e.preventDefault();
  if (!joinCode.trim()) {
    alert('Please enter a valid join code');
    return;
  }
  try {
    // Join code is treated as the challenge's MongoDB _id for now
    await challengeService.joinChallenge(joinCode.trim());
    const activeData = await challengeService.getActiveUserChallenges();
    setMyChallenges(activeData || []);
    setJoinCode('');
    alert('Successfully joined the private challenge!');
  } catch (err) {
    alert(err.response?.data?.message || 'Invalid join code or challenge not found');
  }
};
```

> To support human-readable join codes properly later: add a `joinCode` field to the Challenge model (unique, random string), and add a `GET /api/challenges/join/:code` route that looks up by that field and validates the user is invited, then returns the challenge ID to use with the existing join endpoint.

---

### 5d. Replace `handleCreateChallenge` alert with a real form

The Create tab currently shows placeholder cards that `alert()`. Replace the entire Create tab JSX with a proper form. Add a `showForm` state and a form submission handler:

**Add state and handler:**
```js
const [newChallenge, setNewChallenge] = useState({
  title: '', description: '', category: 'Habits', duration: 7, isPublic: false, tasks: []
});

const handleCreateChallenge = async (e) => {
  e.preventDefault();
  try {
    await challengeService.createChallenge({
      ...newChallenge,
      startDate: new Date().toISOString(),
    });
    const activeData = await challengeService.getActiveUserChallenges();
    setMyChallenges(activeData || []);
    setActiveTab('my-challenges');
    setNewChallenge({ title: '', description: '', category: 'Habits', duration: 7, isPublic: false, tasks: [] });
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to create challenge');
  }
};
```

**Replace the entire `{activeTab === 'create' && ...}` block with a form:**
```jsx
{activeTab === 'create' && (
  <div className="challenges-content">
    <div className="create-challenge-container">
      <h2>Create a Challenge</h2>
      <form onSubmit={handleCreateChallenge} className="create-challenge-form">
        <label>Title
          <input
            type="text"
            required
            value={newChallenge.title}
            onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })}
          />
        </label>
        <label>Description
          <textarea
            required
            value={newChallenge.description}
            onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
          />
        </label>
        <label>Category
          <select
            value={newChallenge.category}
            onChange={e => setNewChallenge({ ...newChallenge, category: e.target.value })}
          >
            {categories.slice(1).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label>Duration (days)
          <input
            type="number"
            min="1"
            required
            value={newChallenge.duration}
            onChange={e => setNewChallenge({ ...newChallenge, duration: parseInt(e.target.value) })}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={newChallenge.isPublic}
            onChange={e => setNewChallenge({ ...newChallenge, isPublic: e.target.checked })}
          />
          {' '}Make this challenge public
        </label>
        <button type="submit" className="btn btn-primary">Create Challenge</button>
      </form>
    </div>
  </div>
)}
```

---

## 6. Incomplete Features — Dashboard

### 6a. Habit data is hardcoded mock

**File:** `client/src/pages/Dashboard/Dashboard.jsx` — lines 79–84

The `habitData` is a hardcoded array. It should fetch from `GET /api/habits`.

**At the top of the file, add the import:**
```js
import { userService, journalService, habitService } from '../../services/apiService';
```

**Add `habitService` to `apiService.js`** (it already has backend routes — just the frontend service is missing):

In `client/src/services/apiService.js`, add after the `challengeService` export:
```js
export const habitService = {
  getHabits: async () => {
    const response = await api.get('/habits');
    return response.data;
  },
  createHabit: async (data) => {
    const response = await api.post('/habits', data);
    return response.data;
  },
  completeHabit: async (id) => {
    const response = await api.put(`/habits/${id}/complete`);
    return response.data;
  },
  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },
};
```

**In `Dashboard.jsx`, replace the hardcoded `setHabitData` call (lines 79–84):**
```js
try {
  const habits = await habitService.getHabits();
  const mapped = habits.map(h => ({
    name: h.name,
    completed: h.completedDays?.length || 0,
    total: 30,
    streak: h.currentStreak || 0,
    id: h._id,
  }));
  setHabitData(mapped);
} catch {
  setHabitData([]);
}
```

---

### 6b. Dashboard "Mood", "Habits", "Achievements" tabs are placeholders

**File:** `client/src/pages/Dashboard/Dashboard.jsx` — lines 233–258

Each tab renders a `<div className="content-placeholder">`. Replace each with real content.

**Mood tab** — the data is already fetched into `moodData`. Reuse the chart from the Overview tab:
```jsx
{activeTab === 'mood' && (
  <div className="dashboard-content">
    <div className="chart-container">
      <h3>Mood History (Last 7 Days)</h3>
      <div className="mood-chart">
        {moodData.map((day, index) => (
          <div className="mood-column" key={index}>
            <div className="mood-bar" style={{ height: `${day.mood * 10}%` }} data-value={day.mood}></div>
            <div className="mood-label">{day.day}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
```

**Habits tab** — the data is already fetched into `habitData`:
```jsx
{activeTab === 'habits' && (
  <div className="dashboard-content">
    <div className="habits-overview">
      <h3>Your Habits</h3>
      <div className="habits-list">
        {habitData.length === 0 && <p>No habits yet. Create one to get started.</p>}
        {habitData.map((habit, index) => (
          <div className="habit-item" key={index}>
            <div className="habit-info">
              <h4>{habit.name}</h4>
              <div className="habit-streak">
                {habit.streak > 0 ? `${habit.streak} day streak 🔥` : 'Start a streak!'}
              </div>
            </div>
            <div className="habit-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(habit.completed / habit.total) * 100}%` }}></div>
              </div>
              <div className="progress-text">{habit.completed}/{habit.total} days</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
```

**Achievements tab** — add achievements to the dashboard fetch and display them:

Add `achievementService` to the import at the top:
```js
import { userService, journalService, habitService, achievementService } from '../../services/apiService';
```

Add a state variable:
```js
const [achievementsData, setAchievementsData] = useState([]);
```

In `fetchDashboardData`, after the habit fetch, add:
```js
try {
  const ach = await achievementService.getAchievements();
  setAchievementsData(ach);
} catch {
  setAchievementsData([]);
}
```

Replace the Achievements tab placeholder:
```jsx
{activeTab === 'achievements' && (
  <div className="dashboard-content">
    <h3>Your Achievements</h3>
    {achievementsData.length === 0 && <p>No achievements yet.</p>}
    <div className="achievements-grid">
      {achievementsData.map(a => (
        <div key={a._id} className={`achievement-card ${a.isCompleted ? 'completed' : ''}`}>
          <h4>{a.title}</h4>
          <p>{a.description}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min((a.currentValue / a.target) * 100, 100)}%` }}></div>
          </div>
          <span>{a.currentValue}/{a.target}</span>
          {a.isCompleted && !a.rewardClaimed && (
            <button className="btn btn-primary" onClick={() => claimReward(a._id)}>
              Claim {a.xpReward} XP
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

Add a `claimReward` function above the return statement:
```js
const claimReward = async (achievementId) => {
  try {
    await achievementService.claimReward(achievementId);
    const ach = await achievementService.getAchievements();
    setAchievementsData(ach);
    const stats = await userService.getStats();
    setUserData(prev => ({ ...prev, xp: stats.xp }));
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to claim reward');
  }
};
```

---

## 7. Schema & Data Mismatches

### 7a. Challenge participant schema mismatch

**File:** `server/routes/challengeRoutes.js` — lines 68–70 and 187–196

Challenge participants are created with `isCreator` and `joinedAt` fields, but the schema defines `joinDate`, `progress`, `completedDays`, `lastCheckIn`, and `isActive` — no `isCreator` or `joinedAt`.

**Fix in the `POST /` (create) handler, line 69:**
```js
// Current (wrong):
participants: [{ user: req.userId, joinedAt: new Date(), isCreator: true }]

// Fix:
participants: [{ user: req.userId, joinDate: new Date(), isActive: true, progress: [] }]
```

**Fix in the `POST /:id/join` handler, lines 187–196:**
```js
// Current (wrong):
challenge.participants.push({
  user: req.userId,
  joinedAt: new Date(),
  isCreator: false,
  progress: challenge.tasks.map(task => ({
    taskId: task._id,
    isCompleted: false,
    completedAt: null
  }))
});

// Fix:
challenge.participants.push({
  user: req.userId,
  joinDate: new Date(),
  isActive: true,
  progress: challenge.tasks.map(task => ({
    taskId: task._id,
    isCompleted: false,
    completedAt: null
  }))
});
```

The `isCreator` check in the leave handler also needs updating. In the `POST /:id/leave` handler (line 248):
```js
// Current (wrong — isCreator is not in schema):
const isCreator = challenge.participants[participantIndex].isCreator;

// Fix — check against the challenge's creator field instead:
const isCreator = challenge.creator.toString() === req.userId.toString();
```

---

### 7b. Journal privacy not enforced

**File:** `server/routes/journalRoutes.js` — `GET /` handler (line 68) and `GET /:id` handler (line 101)

Any authenticated user can read any other user's journal entries if they know or guess an ID, because the query uses `user: req.userId` for listing but individual entries are only guarded in the `findOne` with `user: req.userId`. The list query is already correct (it filters by `user: req.userId`), but the `GET /:id` needs to verify ownership explicitly:

The `GET /:id` is already correct — it does `findOne({ _id, user: req.userId })`. No change needed there.

However the `isPrivate` field exists on entries but is never set via the POST. **Fix the POST handler** to accept and store it:

```js
// In POST / handler, destructure isPrivate:
const { mood, content, prompt, tags, gratitude, activities, isPrivate } = req.body;

// In the JournalEntry constructor:
const journalEntry = new JournalEntry({
  user: req.userId,
  mood, content, prompt, tags, gratitude, activities,
  isPrivate: isPrivate || false,
});
```

---

## 8. Security Issues

### 8a. Hardcoded JWT secret fallback

**Files:** `server/middleware/auth.js:18`, `server/routes/userRoutes.js:54` and `:103`

Every location that uses `process.env.JWT_SECRET || 'your-secret-key'` will silently use a weak public secret if the env var is missing.

**Fix — remove the fallback in all three places:**
```js
// Change:
jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

// To:
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET env var is not set');
jwt.verify(token, process.env.JWT_SECRET)
```

Do the same for `jwt.sign(...)` calls in `userRoutes.js` lines 52–56 and 101–105:
```js
// Change:
jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' })

// To:
jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
```

Make sure `JWT_SECRET` is set to a long random string in `server/.env`. Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 8b. Socket.IO has no authentication

**File:** `server/sockets/index.js` — line 11 onward

Any unauthenticated client can connect to the WebSocket server and join rooms or send messages as any user.

**Fix — add a middleware to verify the JWT before accepting any socket connection:**

```js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  // Auth middleware for all socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id username');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // socket.user is now always set
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('chat', ({ roomId, message }) => {
      io.to(roomId).emit('chat', {
        message,
        user: socket.user.username,
        userId: socket.user._id,
      });
    });
  });
};
```

**Fix the CORS wildcard — change `origin: '*'` in `server/sockets/index.js`:**
```js
// In server/index.js where Socket.IO is initialized:
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});
```

---

### 8c. No rate limiting on auth endpoints

**File:** `server/index.js`

Install `express-rate-limit` in the server:
```bash
cd server && npm install express-rate-limit
```

Add to `server/index.js` before the route registrations:
```js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many requests, please try again later.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

---

## 9. Wiring the Daily Check-In

The `POST /api/auth/check-in` endpoint exists on the backend but is never called from the frontend. It updates the user's streak and achievement progress. Add it to the frontend service and call it from the Dashboard.

### 9a. Add `checkIn` to `authService` in `apiService.js`

```js
// In authService object:
checkIn: async () => {
  const response = await api.post('/auth/check-in');
  return response.data;
},
```

### 9b. Call check-in from the Dashboard on mount

In `client/src/pages/Dashboard/Dashboard.jsx`, inside `fetchDashboardData` after fetching stats, add:
```js
try {
  await authService.checkIn();
} catch {
  // Silently ignore — check-in may have already been done today
}
```

Also add `authService` to the import:
```js
import { authService, userService, journalService, habitService, achievementService } from '../../services/apiService';
```

---

## 10. Summary Checklist

Work through these in order. Each item maps to a section above.

### Setup
- [ ] Run `npm run setup` from root after restructure
- [ ] Set a real `JWT_SECRET` in `server/.env`

### Backend Fixes
- [ ] **2a** — `habitRoutes.js`: add `User.findByIdAndUpdate` XP increment after `XPLog.create`
- [ ] **2b** — `challengeRoutes.js`: fix `stats.xp` → `xp` and `stats.challengesCompleted` → `stats.completedChallenges`
- [ ] **2c** — `achievementRoutes.js`: fix `.sort({ completedAt: -1 })` → `.sort({ completedDate: -1 })` (both occurrences)
- [ ] **2d** — `userRoutes.js`: uncomment and inline achievement initialization in `POST /register`
- [ ] **2e** — `journalRoutes.js`: add "First Steps" achievement trigger and `totalJournalEntries` stat increment
- [ ] **2f** — `challengeRoutes.js`: fix `GET /` query to exclude private challenges from non-participants
- [ ] **2g** — `challengeRoutes.js`: add access check to `GET /:id`
- [ ] **4a** — `userRoutes.js`: add `GET /leaderboard` route
- [ ] **7a** — `challengeRoutes.js`: fix participant `joinedAt`→`joinDate`, remove `isCreator`, fix leave handler
- [ ] **7b** — `journalRoutes.js`: accept and store `isPrivate` in POST handler
- [ ] **8a** — Remove `|| 'your-secret-key'` from JWT_SECRET in auth.js and userRoutes.js
- [ ] **8b** — Add JWT middleware to Socket.IO, fix CORS wildcard
- [ ] **8c** — Add `express-rate-limit` to login and register

### Frontend Fixes
- [ ] **3a** — `AuthContext.jsx`: uncomment achievement initialization in both `initializeUser` and `register`
- [ ] **3b** — `apiService.js`: fix `updateAvatar` to use `PUT /auth/me`
- [ ] **3c** — `apiService.js`: stub or implement `getLeaderboard`
- [ ] **5a** — `Challenges.jsx`: replace mock state with `useEffect` + API calls
- [ ] **5b** — `Challenges.jsx`: replace `handleJoinChallenge` with real API call
- [ ] **5c** — `Challenges.jsx`: replace `handleJoinPrivate` with real API call
- [ ] **5d** — `Challenges.jsx`: replace `handleCreateChallenge` alert with a real form + API call
- [ ] **6a** — `apiService.js` + `Dashboard.jsx`: add `habitService`, replace hardcoded habit data
- [ ] **6b** — `Dashboard.jsx`: replace Mood, Habits, Achievements placeholder tabs with real content
- [ ] **9a** — `apiService.js`: add `checkIn` method to `authService`
- [ ] **9b** — `Dashboard.jsx`: call `authService.checkIn()` on mount
