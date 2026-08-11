import React, { useState, useEffect } from 'react'
import Signup from './components/Signup'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

export default function App(){
  const [view, setView] = useState('signup')
  const [user, setUser] = useState(null)

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
    setView('login')
  }

  return (
    <div className="app">
      <header>
        <h1>Careerak — Connect Students & Mentors</h1>
        <nav>
          {!user && <>
            <button onClick={()=>setView('signup')}>Sign up</button>
            <button onClick={()=>setView('login')}>Log in</button>
          </>}
          {user && <button onClick={handleLogout}>Log out</button>}
        </nav>
      </header>
      <main>
        {user ? (
          <Dashboard user={user} />
        ) : (
          view === 'signup' ? <Signup onAuth={handleAuth} /> : <Login onAuth={handleAuth} />
        )}
      </main>
    </div>
  )
}
