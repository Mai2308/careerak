import React, { useEffect, useState } from 'react'
import {
  getMentorAvailability,
  createMockPayment,
  createBooking
} from '../api'
import MentorReviews from './MentorReviews'

const MOCK_SESSION_PRICE = 2500

export default function AvailableSlots({ user, mentorId }) {
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [cardName, setCardName] = useState(user?.name || '')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/30')
  const [cvv, setCvv] = useState('123')
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

  useEffect(() => {
    if (user?.name) setCardName(user.name)
  }, [user])

  async function handleBook(availabilityId) {
    try {
      setError('')
      setMessage('')

      const payment = await createMockPayment({
        amount: MOCK_SESSION_PRICE,
        currency: 'INR'
      })

      await createBooking({
        studentId: user.id,
        availabilityId,
        paymentStatus: payment.paymentStatus,
        paymentReference: payment.paymentReference,
        amount: payment.amount,
        currency: payment.currency
      })

      setMessage(`Payment successful and session booked for ₹${payment.amount}`)
      setSelectedSlot(null)
      await loadSlots()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!mentorId) {
    return (
      <div className="surface-panel">
        <p className="booking-empty">Please select a mentor first.</p>
      </div>
    )
  }

  return (
    <div className="surface-panel booking-panel">
      <div className="section-header-row">
        <h3 className="panel-title light">AVAILABLE SESSIONS</h3>
      </div>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {loading ? (
        <p className="booking-empty">Loading available sessions…</p>
      ) : slots.length === 0 ? (
        <p className="booking-empty">No available sessions for this mentor.</p>
      ) : selectedSlot ? (
        <div className="checkout-panel">
          <div className="checkout-header">
            <span>Secure checkout</span>
            <strong>Mock payment</strong>
          </div>

          <div className="checkout-summary">
            <div>
              <small>Session</small>
              <p>
                {new Date(selectedSlot.date).toLocaleDateString()} · {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
            </div>
            <div className="price-box">₹{MOCK_SESSION_PRICE}</div>
          </div>

          <div className="card-preview">
            <div className="chip" />
            <div className="card-number">{cardNumber}</div>
            <div className="card-meta">
              <span>{cardName || 'Student Name'}</span>
              <span>{expiry}</span>
            </div>
          </div>

          <div className="checkout-form">
            <label>
              Cardholder name
              <input value={cardName} onChange={(e) => setCardName(e.target.value)} />
            </label>

            <label>
              Card number
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </label>

            <div className="row-fields">
              <label>
                Expiry
                <input value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </label>

              <label>
                CVV
                <input value={cvv} onChange={(e) => setCvv(e.target.value)} type="password" />
              </label>
            </div>

            <button onClick={() => handleBook(selectedSlot._id)} className="pay-button">
              Pay ₹{MOCK_SESSION_PRICE} & confirm booking
            </button>

            <button className="secondary-button" onClick={() => setSelectedSlot(null)}>
              Back to slots
            </button>
          </div>
        </div>
      ) : (
        <div className="booking-list">
          {slots.map((slot) => (
            <div className="booking-row" key={slot._id}>
              <div className="booking-person">
                <div className="booking-avatar" style={{ background: 'linear-gradient(135deg,var(--blue-100),var(--emerald-100))', color: 'var(--blue-700)' }}>
                  📅
                </div>
                <div className="booking-copy">
                  <span className="booking-name">
                    {new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="booking-subtitle">{slot.startTime} – {slot.endTime}</span>
                </div>
              </div>
              <div className="booking-time-block">
                <span className="slot-price">₹{MOCK_SESSION_PRICE}</span>
              </div>
              <button className="book-slot-btn" onClick={() => setSelectedSlot(slot)}>
                Book slot
              </button>
            </div>
          ))}
        </div>
      )}

      <MentorReviews mentorId={mentorId} user={user} />
    </div>
  )
}