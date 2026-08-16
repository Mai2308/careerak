import React, { useEffect, useState } from 'react'
import {
  createAvailability,
  getMentorAvailability,
  deleteAvailability
} from '../api'

export default function MentorAvailability({ user }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [slots, setSlots] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadAvailability() {
    try {
      const data = await getMentorAvailability(user.id)
      setSlots(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadAvailability()
  }, [user.id])

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!date || !startTime || !endTime) {
      setError('Please fill in all fields')
      return
    }

    if (endTime <= startTime) {
      setError('End time must be after start time')
      return
    }

    try {
      await createAvailability({
        mentorId: user.id,
        date,
        startTime,
        endTime
      })

      setDate('')
      setStartTime('')
      setEndTime('')

      setMessage('Availability added successfully')

      await loadAvailability()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      setError('')
      setMessage('')

      await deleteAvailability(id)

      setMessage('Availability deleted successfully')

      await loadAvailability()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Manage Availability</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <button type="submit">
          Add Availability
        </button>
      </form>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <h3>Your Availability</h3>

      {slots.length === 0 ? (
        <p>No availability slots yet.</p>
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

            <p>
              <strong>Status:</strong> {slot.status}
            </p>

            {slot.status === 'available' && (
              <button onClick={() => handleDelete(slot._id)}>
                Delete
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
