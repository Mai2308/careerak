import React, { useEffect, useState } from 'react'
import {
  getStudentBookings,
  cancelBooking
} from '../api'

export default function StudentBookings({ user }) {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadBookings() {
    try {
      setLoading(true)
      setError('')

      const data = await getStudentBookings(user.id)
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

  async function handleCancel(bookingId) {
    try {
      setError('')
      setMessage('')

      await cancelBooking(bookingId)

      setMessage('Booking cancelled successfully')

      await loadBookings()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card">
      <h2>My Bookings</h2>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <div className="card" key={booking._id}>
            <p>
              <strong>Mentor:</strong>{' '}
              {booking.mentorId?.name || 'Mentor'}
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

            {(booking.status === 'pending' ||
              booking.status === 'confirmed') && (
              <button
                onClick={() => handleCancel(booking._id)}
              >
                Cancel Booking
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}