import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './styles/global.css'
import './styles/components.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { GamificationProvider } from './contexts/GamificationContext'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>
        <GamificationProvider>
          <App />
        </GamificationProvider>
      </AuthProvider>
    </ClerkProvider>
  </StrictMode>,
)
