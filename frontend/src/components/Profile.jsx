import React, { useEffect, useState } from 'react'
import { getProfile } from '../api'
import Interests from './Interests'

export default function Profile({ user, onBack }){
  const [profile, setProfile] = useState(user)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showInterests, setShowInterests] = useState(false)

  useEffect(()=>{
    let cancelled = false
    async function load(){
      try{
        const res = await getProfile()
        if (!cancelled && res.user) setProfile(res.user)
      }catch(err){
        if (!cancelled) setMsg(err.message || 'Failed to load profile')
      }finally{
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[])

  if (showInterests){
    return <Interests onBack={()=>setShowInterests(false)} />
  }

  return (
    <div className="card">
      <h2>My Profile</h2>
      <button onClick={onBack}>Back to Dashboard</button>
      {loading && <p>Loading profile...</p>}
      {msg && <p className="msg">{msg}</p>}
      {!loading && profile && (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          {profile.educationLevel && <p><strong>Education level:</strong> {profile.educationLevel}</p>}
          {profile.interests && profile.interests.length > 0 && (
            <p><strong>Interests:</strong> {profile.interests.join(', ')}</p>
          )}
          {profile.role === 'student' && (
            <button onClick={()=>setShowInterests(true)}>Choose Fields of Interest</button>
          )}
        </div>
      )}
    </div>
  )
}
