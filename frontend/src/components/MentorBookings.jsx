import React, { useEffect, useState } from 'react'
import {
  getMentorBookings
} from '../api'

export default function MentorBookings({ user }) {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadBookings() {
    try {
      setLoading(true)
      setError('')

      const data = await getMentorBookings(user.id)
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [user.id])

  return (
    <div className="card">
      <h2>Bookings with Me</h2>

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <div className="card" key={booking._id}>
            <p>
              <strong>Student:</strong>{' '}
              {booking.studentId?.name || 'Student'}
            </p>

            <p>
              <strong>Email:</strong>{' '}
              {booking.studentId?.email || 'N/A'}
            </p>

            <p>
              <strong>Date:</strong>{' '}
              {booking.availabilityId?.date
                ? new Date(
                    booking.availabilityId.date
                  ).toLocaleDateString()
                : 'N/A'}
            </p>

            <p>
              <strong>Time:</strong>{' '}
              {booking.availabilityId?.startTime} -{' '}
              {booking.availabilityId?.endTime}
            </p>

            <p>
              <strong>Status:</strong> {booking.status}
            </p>
          </div>
        ))
      )}
    </div>
  )
}
