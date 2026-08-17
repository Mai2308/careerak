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
    <div className="surface-panel booking-panel">
      <h3 className="panel-title light">MY BOOKINGS</h3>

      {error && <p className="msg">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {loading ? (
        <div className="booking-empty">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="booking-empty">You have no bookings yet.</div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div className="booking-row" key={booking._id}>
              <div className="booking-person">
                <div className="booking-avatar">
                  {(booking.mentorId?.name || 'M').split(' ').map((piece) => piece[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="booking-copy">
                  <div className="booking-name">{booking.mentorId?.name || 'Mentor'}</div>
                  <div className="booking-subtitle">
                    {booking.availabilityId?.startTime ? `${booking.availabilityId.startTime} - ${booking.availabilityId.endTime}` : 'Session booked'}
                  </div>
                </div>
              </div>

              <div className="booking-time-block">
                <div className="booking-date">
                  {booking.availabilityId?.date
                    ? new Date(booking.availabilityId.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : 'N/A'}
                </div>
                <div className="booking-status">{booking.status === 'confirmed' ? 'Confirmed' : booking.status}</div>
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button className="secondary-button compact" onClick={() => handleCancel(booking._id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}