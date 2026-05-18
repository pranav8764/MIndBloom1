import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Layout
import Layout from './components/layout/Layout'

// Pages
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import Journal from './pages/Journal/Journal'
import Challenges from './pages/Challenges/Challenges'
import Achievements from './pages/Achievements/Achievements'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Profile from './pages/Profile/Profile'

import { useAuth } from './contexts/AuthContext'

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontSize: '1.2rem', color: '#666' }}>
        Loading...
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
          <Route path="achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* Redirect to home for any undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
