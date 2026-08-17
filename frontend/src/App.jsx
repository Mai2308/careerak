import React, { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Signup from './components/Signup'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Explore from './components/Explore'

export default function App(){
  const [view, setView] = useState('landing')
  const [signupRole, setSignupRole] = useState('student')
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('careerak-theme')
      return saved ? saved === 'dark' : false
    } catch {
      return false
    }
  })

  useEffect(()=>{
    document.body.classList.toggle('dark-mode', darkMode)
    try {
      localStorage.setItem('careerak-theme', darkMode ? 'dark' : 'light')
    } catch {}
  }, [darkMode])

  useEffect(()=>{
    // restore user from sessionStorage if present
    try{
      const token = sessionStorage.getItem('token')
      const userJson = sessionStorage.getItem('user')
      if (token && userJson){
        setUser(JSON.parse(userJson))
        setView('dashboard')
      }
    }catch(e){/* ignore */}
  },[])

  const handleAuth = ({ token, user }) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    setView('dashboard')
  }

  const handleLogout = ()=>{
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
    setView('landing')
  }

  const goToSignup = (role) => {
    setSignupRole(role)
    setView('signup')
  }

  if (!user && view === 'landing') {
    return (
      <Landing
        onGetStarted={()=>goToSignup('student')}
        onFindMentor={()=>goToSignup('student')}
        onJoinAsMentor={()=>goToSignup('mentor')}
        onLogin={()=>setView('login')}
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
              <div className="brand-mark">
                <span className="logo-icon small">🎓</span>
                <h1>Careerak</h1>
              </div>
              <nav>
                <button className="link-button" onClick={()=>setView('dashboard')}>Dashboard</button>
                <button className="link-button" onClick={()=>setView('profile')}>Profile</button>
                <button type="button" className="theme-toggle" onClick={()=>setDarkMode(!darkMode)}>
                  {darkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
                <button onClick={handleLogout}>Log out</button>
              </nav>
            </>
          ) : (
            <>
              <div className="brand-mark">
                <span className="logo-icon small">🎓</span>
                <span>Careerak</span>
              </div>
              <nav>
                <button className="link-button" onClick={()=>setView('landing')}>Home</button>
                <button className="link-button" onClick={()=>setView('signup')}>Sign up</button>
                <button className="link-button" onClick={()=>setView('login')}>Log in</button>
                <button type="button" className="theme-toggle" onClick={()=>setDarkMode(!darkMode)}>
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
            <Profile user={user} onBack={()=>setView('dashboard')} />
          ) : view === 'explore' ? (
            <Explore onBack={()=>setView('dashboard')} />
          ) : (
            <Dashboard user={user} onViewProfile={()=>setView('profile')} onExplore={()=>setView('explore')} />
          )
        ) : (
          view === 'signup' ? (
            <Signup initialRole={signupRole} onAuth={handleAuth} onBack={()=>setView('landing')} />
          ) : (
            <Login onAuth={handleAuth} onBack={()=>setView('landing')} />
          )
        )}
      </main>
    </div>
  )
}
