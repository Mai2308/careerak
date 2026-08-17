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
    <div className="surface-panel booking-panel">
      <h3 className="panel-title light">UPCOMING BOOKINGS</h3>

      {error && <p className="msg">{error}</p>}

      {loading ? (
        <div className="booking-empty">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="booking-empty">No bookings yet.</div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div className="booking-row" key={booking._id}>
              <div className="booking-person">
                <div className="booking-avatar">
                  {(booking.studentId?.name || 'S').split(' ').map((piece) => piece[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div className="booking-copy">
                  <div className="booking-name">{booking.studentId?.name || 'Student'}</div>
                  <div className="booking-subtitle">{booking.availabilityId?.startTime ? `${booking.availabilityId.startTime} - ${booking.availabilityId.endTime}` : 'Session booked'}</div>
                </div>
              </div>

              <div className="booking-time-block">
                <div className="booking-date">
                  {booking.availabilityId?.date
                    ? new Date(booking.availabilityId.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : 'TBD'}
                  {' · '}
                  {booking.availabilityId?.startTime || '00:00'}
                </div>
                <div className="booking-status">{booking.status === 'confirmed' ? 'Confirmed' : booking.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
