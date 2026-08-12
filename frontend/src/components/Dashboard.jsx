import React, { useEffect, useState } from 'react'
import { getMyBookings } from '../api'

export default function Dashboard({ user, onViewProfile, onExplore }){
  const [bookings, setBookings] = useState([])
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let cancelled = false
    async function load(){
      try{
        const res = await getMyBookings()
        if (!cancelled) setBookings(res.bookings || [])
      }catch(err){
        if (!cancelled) setMsg(err.message || 'Failed to load bookings')
      }finally{
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[])

  return (
    <div className="card">
      <h2>Welcome, {user.name}</h2>
      <button onClick={onViewProfile}>View Profile</button>
      <button onClick={onExplore}>Explore Categories</button>
      <h3>My Bookings</h3>
      {loading && <p>Loading bookings...</p>}
      {msg && <p className="msg" style={{color:'crimson'}}>{msg}</p>}
      {!loading && bookings.length === 0 && !msg && <p>You have no bookings yet.</p>}
      {bookings.length > 0 && (
        <ul>
          {bookings.map(b => (
            <li key={b._id}>
              {new Date(b.date).toLocaleString()} — {b.mentor?.name || 'Mentor'} ({b.status})
              {b.topic && ` — ${b.topic}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
