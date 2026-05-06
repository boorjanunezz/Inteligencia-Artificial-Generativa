import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewSession from './pages/NewSession'
import Interview from './pages/Interview'
import Results from './pages/Results'
import Profile from './pages/Profile'
import Jobs from './pages/Jobs'
import WelcomeScreen from './pages/WelcomeScreen'

export default function App() {
  const [welcomed, setWelcomed] = useState(() =>
    !!localStorage.getItem('lang')
  )

  return (
    <ThemeProvider>
      <AuthProvider>
        {!welcomed && <WelcomeScreen onComplete={() => setWelcomed(true)} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/new" element={<ProtectedRoute><NewSession /></ProtectedRoute>} />
            <Route path="/interview/:sessionId" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
            <Route path="/results/:sessionId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
