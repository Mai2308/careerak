import React, { useEffect, useState } from 'react'
import {
  getMentorAvailability,
  createBooking
} from '../api'

export default function AvailableSlots({ user, mentorId }) {
  const [slots, setSlots] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadSlots() {
    try {
      setLoading(true)
      setError('')

      const data = await getMentorAvailability(mentorId)

      const availableSlots = Array.isArray(data)
        ? data.filter((slot) => slot.status === 'available')
        : []

      setSlots(availableSlots)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mentorId) {
      loadSlots()
    }
  }, [mentorId])

  async function handleBook(availabilityId) {
    try {
      setError('')
      setMessage('')

      await createBooking({
        studentId: user.id,
        availabilityId
      })

      setMessage('Session booked successfully')

      await loadSlots()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!mentorId) {
    return (
      <div className="card">
        <p>Please select a mentor first.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Available Sessions</h2>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {loading ? (
        <p>Loading available sessions...</p>
      ) : slots.length === 0 ? (
        <p>No available sessions for this mentor.</p>
      ) : (
        slots.map((slot) => (
          <div className="card" key={slot._id}>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(slot.date).toLocaleDateString()}
            </p>

            <p>
              <strong>Time:</strong>{' '}
              {slot.startTime} - {slot.endTime}
            </p>

            <button onClick={() => handleBook(slot._id)}>
              Book Session
            </button>
          </div>
        ))
      )}
    </div>
  )
}