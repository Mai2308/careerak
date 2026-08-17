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
    <div className="surface-panel availability-panel">
      <h3 className="panel-title light">AVAILABILITY</h3>

      <div className="availability-list">
        {slots.length === 0 ? (
          <div className="availability-empty">No availability slots yet.</div>
        ) : (
          slots.map((slot) => (
            <div className="availability-row" key={slot._id}>
              <span>
                {new Date(slot.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {slot.startTime} - {slot.endTime}
              </span>
              {slot.status === 'available' && (
                <button type="button" className="remove-slot" onClick={() => handleDelete(slot._id)} aria-label="Delete slot">
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="availability-form">
        <div className="time-row">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="secondary-button add-slot-button">+ Add slot</button>
      </form>

      {error && <p className="msg">{error}</p>}
      {message && <p className="success-message">{message}</p>}
    </div>
  )
}
