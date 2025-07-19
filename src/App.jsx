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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="journal" element={<Journal />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="achievements" element={<Achievements />} />

          {/* Redirect to home for any undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
