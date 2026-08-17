import React, { useEffect, useState } from 'react'
import MentorAvailability from './MentorAvailability'
import MentorBookings from './MentorBookings'
import AvailableSlots from './AvailableSlots'
import StudentBookings from './StudentBookings'
import { getMyMentor, getMentors } from '../api'
import MentorProfile from './MentorProfile'

export default function Dashboard({ user, onViewProfile, onExplore }) {
  const [mentorProfile, setMentorProfile] = useState(null)
  const [mentors, setMentors] = useState([])
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [loadingMentors, setLoadingMentors] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!user) return

    if (user.role === 'mentor') {
      setLoading(true)
      getMyMentor()
        .then((m) => setMentorProfile(m))
        .catch(() => setMentorProfile(null))
        .finally(() => setLoading(false))
      return
    }

    async function loadMentors() {
      try {
        setLoadingMentors(true)
        const data = await getMentors()
        const list = Array.isArray(data) ? data : []
        setMentors(list)
        if (list.length > 0) {
          setSelectedMentorId(list[0]._id || list[0].id)
        }
      } catch (err) {
        console.error('Failed to load mentors', err)
        setMentors([])
      } finally {
        setLoadingMentors(false)
      }
    }

    loadMentors()
  }, [user])

  if (!user) return <div className="card">Please log in.</div>

  if (user.role === 'mentor') {
    return (
      <div>
        <div className="card">
          <h2>Welcome, {user.name}</h2>
          <p>Role: {user.role}</p>
          <p>Email: {user.email}</p>
        </div>

        {loading ? (
          <div className="card">Loading your profile...</div>
        ) : !mentorProfile ? (
          <div>
            <div className="card">
              <h2>No mentor profile found</h2>
              <p>Create one from your dashboard</p>
            </div>
            <div style={{ marginTop: 12 }}>
              <MentorProfile onSaved={(m) => { setMentorProfile(m); setEditing(false) }} />
            </div>
          </div>
        ) : (
          <div>
            <div className="card">
              <h2>{mentorProfile.name}</h2>
              <p><strong>Title:</strong> {mentorProfile.title || '—'}</p>
              <p><strong>Bio:</strong> {mentorProfile.bio || '—'}</p>
              <p><strong>Skills:</strong> {mentorProfile.skills?.join(', ') || '—'}</p>
              <p>
                <strong>Rating:</strong>{' '}
                {mentorProfile.reviewCount
                  ? `${mentorProfile.rating.toFixed(1)} / 5 (${mentorProfile.reviewCount} review${mentorProfile.reviewCount === 1 ? '' : 's'})`
                  : 'No reviews yet'}
              </p>
              <div style={{ marginTop: 12 }}>
                <button className="secondary" onClick={() => setEditing(!editing)}>
                  {editing ? 'Close editor' : 'Edit profile'}
                </button>
              </div>
            </div>

            {editing && (
              <div style={{ marginTop: 12 }}>
                <MentorProfile
                  initial={mentorProfile}
                  onSaved={(m) => { setMentorProfile(m); setEditing(false) }}
                />
              </div>
            )}

            <MentorAvailability user={user} />
            <MentorBookings user={user} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <h2>Welcome, {user.name}</h2>
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
        {onViewProfile && <button onClick={onViewProfile}>View Profile</button>}
        {onExplore && <button onClick={onExplore} style={{ marginLeft: 8 }}>Explore Categories</button>}
      </div>

      <div className="card">
        <h2>Choose a mentor</h2>
        {loadingMentors ? (
          <p>Loading mentors...</p>
        ) : mentors.length === 0 ? (
          <p>No mentors are available yet.</p>
        ) : (
          <select
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
          >
            {mentors.map((mentor) => (
              <option key={mentor._id || mentor.id} value={mentor._id || mentor.id}>
                {mentor.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <AvailableSlots user={user} mentorId={selectedMentorId} />
      <StudentBookings user={user} />
    </div>
  )
}
