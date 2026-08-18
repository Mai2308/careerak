import React, { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Signup from './components/Signup'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Explore from './components/Explore'
import MessagesModal from './components/MessagesModal'
import { getUnreadMessageCount } from './api'

export default function App() {
  const [view, setView] = useState('landing')
  const [signupRole, setSignupRole] = useState('student')
  const [user, setUser] = useState(null)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [chatRecipient, setChatRecipient] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('careerak-theme')
      return saved ? saved === 'dark' : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
    try {
      localStorage.setItem('careerak-theme', darkMode ? 'dark' : 'light')
    } catch {}
  }, [darkMode])

  useEffect(() => {
    // restore user from sessionStorage if present
    try {
      const token = sessionStorage.getItem('token')
      const userJson = sessionStorage.getItem('user')
      if (token && userJson) {
        setUser(JSON.parse(userJson))
        setView('dashboard')
      }
    } catch (e) {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchUnread = () => {
      getUnreadMessageCount()
        .then((data) => {
          if (typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount)
          }
        })
        .catch(() => {})
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 5000)

    return () => clearInterval(interval)
  }, [user, messagesOpen])

  const handleAuth = ({ token, user }) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    setView('dashboard')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
    setView('landing')
  }

  const goToSignup = (role) => {
    setSignupRole(role)
    setView('signup')
  }

  const openMessagesWith = (recipient = null) => {
    setChatRecipient(recipient)
    setMessagesOpen(true)
  }

  if (!user && view === 'landing') {
    return (
      <Landing
        onGetStarted={() => goToSignup('student')}
        onFindMentor={() => goToSignup('student')}
        onJoinAsMentor={() => goToSignup('mentor')}
        onLogin={() => setView('login')}
      />
    )
  }

  const authView = !user && (view === 'login' || view === 'signup')

  return (
    <div className={`app-shell ${user ? 'app-shell-auth' : ''}`}>
      {(user || !authView) && (
        <header className={user ? 'app-header' : 'minimal-header'}>
          {user ? (
            <>
              <div className="brand-mark" onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }}>
                <img src="/logo.png" alt="Careerak Logo" className="logo-image" />
              </div>
              <nav>
<<<<<<< HEAD
                <button className="link-button" onClick={()=>setView('dashboard')}>Dashboard</button>
                <button className="link-button" onClick={()=>setView('profile')}>Profile</button>
                <button className="link-button nav-messages-btn" onClick={()=>openMessagesWith(null)}>
                  💬 Messages
                  {unreadCount > 0 && <span className="unread-notification-badge">{unreadCount}</span>}
                </button>
                <button type="button" className="theme-toggle" onClick={()=>setDarkMode(!darkMode)}>
=======
                <button className="link-button" onClick={() => setView('dashboard')}>
                  Dashboard
                </button>
                <button className="link-button" onClick={() => setView('profile')}>
                  Profile
                </button>
                <button type="button" className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
>>>>>>> origin/main
                  {darkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
                <button onClick={handleLogout}>Log out</button>
              </nav>
            </>
          ) : (
            <>
              <div className="brand-mark" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
                <img src="/logo.png" alt="Careerak Logo" className="logo-image" />
                <span className="logo-text">Careerak</span>
              </div>
              <nav>
                <button className="link-button" onClick={() => setView('landing')}>
                  Home
                </button>
                <button className="link-button" onClick={() => setView('signup')}>
                  Sign up
                </button>
                <button className="link-button" onClick={() => setView('login')}>
                  Log in
                </button>
                <button type="button" className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
              </nav>
            </>
          )}
        </header>
      )}

      <main className={user ? 'app-main' : 'full-width-main'}>
        {user ? (
          view === 'profile' ? (
            <Profile user={user} onBack={() => setView('dashboard')} />
          ) : view === 'explore' ? (
<<<<<<< HEAD
            <Explore onBack={()=>setView('dashboard')} onOpenMessages={(mentor) => openMessagesWith(mentor)} />
          ) : (
            <Dashboard
              user={user}
              onViewProfile={()=>setView('profile')}
              onExplore={()=>setView('explore')}
              onOpenMessages={(mentor) => openMessagesWith(mentor)}
            />
=======
            <Explore onBack={() => setView('dashboard')} />
          ) : (
            <Dashboard user={user} onViewProfile={() => setView('profile')} onExplore={() => setView('explore')} />
>>>>>>> origin/main
          )
        ) : view === 'signup' ? (
          <Signup initialRole={signupRole} onAuth={handleAuth} onBack={() => setView('landing')} />
        ) : (
          <Login onAuth={handleAuth} onBack={() => setView('landing')} />
        )}
      </main>

      {user && (
        <MessagesModal
          isOpen={messagesOpen}
          onClose={() => setMessagesOpen(false)}
          user={user}
          initialRecipient={chatRecipient}
        />
      )}
    </div>
  )
}