import React, { useEffect, useState } from 'react'
import MentorAvailability from './MentorAvailability'
import MentorBookings from './MentorBookings'
import AvailableSlots from './AvailableSlots'
import StudentBookings from './StudentBookings'
import { getMentors } from '../api'

export default function Dashboard({ user }) {
  const [mentors, setMentors] = useState([])
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [loadingMentors, setLoadingMentors] = useState(false)

  useEffect(() => {
    if (user.role !== 'student') return

    async function loadMentors() {
      try {
        setLoadingMentors(true)
        const data = await getMentors()
        setMentors(Array.isArray(data) ? data : [])
        if (data && data.length > 0) {
          setSelectedMentorId(data[0]._id || data[0].id)
        }
      } catch (err) {
        console.error('Failed to load mentors', err)
      } finally {
        setLoadingMentors(false)
      }
    }

    loadMentors()
  }, [user.role])

  return (
    <div>
      <div className="card">
        <h2>Welcome, {user.name}</h2>
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
      </div>

      {user.role === 'mentor' && (
        <>
          <MentorAvailability user={user} />
          <MentorBookings user={user} />
        </>
      )}

      {user.role === 'student' && (
        <>
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
                    {mentor.name} ({mentor.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <AvailableSlots
            user={user}
            mentorId={selectedMentorId}
          />

          <StudentBookings user={user} />
        </>
      )}
    </div>
  )
}