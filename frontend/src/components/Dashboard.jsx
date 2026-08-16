import React, { useEffect, useState } from 'react'
import { getMyMentor, getMentors } from '../api'
import MentorProfile from './MentorProfile'

export default function Dashboard({ user }){
  const [mentorProfile, setMentorProfile] = useState(null)
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(()=>{
    if (user && user.role === 'mentor'){
      setLoading(true)
      getMyMentor().then(m => setMentorProfile(m)).catch(()=>setMentorProfile(null)).finally(()=>setLoading(false))
    } else {
      // show list of mentors for non-mentor users
      getMentors().then(setMentors).catch(()=>setMentors([]))
    }
  },[user])

  if (!user) return <div className="card">Please log in.</div>

  if (user.role === 'mentor'){
    if (loading) return <div className="card">Loading your profile...</div>
    if (!mentorProfile) return (
      <div>
        <div className="card">
          <h2>No mentor profile found</h2>
          <p>Create one from your dashboard</p>
        </div>
        <div style={{marginTop:12}}>
          <MentorProfile onSaved={(m)=>{ setMentorProfile(m); setEditing(false) }} />
        </div>
      </div>
    )
    return (
      <div>
        <div className="card">
          <h2>{mentorProfile.name}</h2>
          <p><strong>Title:</strong> {mentorProfile.title || '—'}</p>
          <p><strong>Bio:</strong> {mentorProfile.bio || '—'}</p>
          <p><strong>Skills:</strong> {mentorProfile.skills?.join(', ') || '—'}</p>
          <div style={{marginTop:12}}>
            <button className="secondary" onClick={()=>setEditing(!editing)}>{editing ? 'Close editor' : 'Edit profile'}</button>
          </div>
        </div>
        {editing && (
          <div style={{marginTop:12}}>
            <MentorProfile initial={mentorProfile} onSaved={(m)=>{ setMentorProfile(m); setEditing(false) }} />
          </div>
        )}
        <div style={{marginTop:18}}>
          <h3>Bookings</h3>
          {mentorProfile.bookings && mentorProfile.bookings.length ? (
            mentorProfile.bookings.map((b, i)=> (
              <div key={i} style={{marginBottom:8}}>
                <div><strong>Slot:</strong> {b.slot}</div>
                <div><strong>Student:</strong> {b.studentName}</div>
                <div><strong>Status:</strong> {b.status}</div>
              </div>
            ))
          ) : (
            <p>No bookings yet.</p>
          )}
        </div>
      </div>
    )
  }

  // student or other roles: show mentor list
  return (
    <div>
      <div className="card">
        <h2>Welcome, {user.name}</h2>
        <p>Role: {user.role}</p>
      </div>
      <div style={{marginTop:16}}>
        <h3>Available mentors</h3>
        {mentors.length ? mentors.map(m => (
          <div className="card" key={m._id} style={{marginBottom:8}}>
            <h4>{m.name}</h4>
            <p>{m.title}</p>
            <p>{m.bio}</p>
          </div>
        )) : <p>No mentors available.</p>}
      </div>
    </div>
  )
}
