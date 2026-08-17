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
      <div className="section-header-row">
        <h3 className="panel-title light">MY BOOKINGS</h3>
      </div>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {loading ? (
        <p className="booking-empty">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="booking-empty">You have no bookings yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => {
            const initials = booking.mentorId?.name
              ?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'M'
            const date = booking.availabilityId?.date
              ? new Date(booking.availabilityId.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
              : 'N/A'
            const time = booking.availabilityId?.startTime && booking.availabilityId?.endTime
              ? `${booking.availabilityId.startTime} – ${booking.availabilityId.endTime}`
              : ''
            return (
              <div className="booking-row" key={booking._id}>
                <div className="booking-person">
                  <div className="booking-avatar">{initials}</div>
                  <div className="booking-copy">
                    <span className="booking-name">{booking.mentorId?.name || 'Mentor'}</span>
                    <span className="booking-subtitle">{time}</span>
                  </div>
                </div>
                <div className="booking-time-block">
                  <span className="booking-date">{date}</span>
                  <span className={`booking-status status-${booking.status}`}>{booking.status}</span>
                </div>
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button className="cancel-booking-btn" onClick={() => handleCancel(booking._id)}>
                    Cancel
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}