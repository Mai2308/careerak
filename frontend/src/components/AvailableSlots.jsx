import React, { useEffect, useState } from 'react'
import {
  getMentorAvailability,
  getMentorById,
  createMockPayment,
  createBooking
} from '../api'
import MentorReviews from './MentorReviews'

export default function AvailableSlots({ user, mentorId }) {
  const [mentor, setMentor] = useState(null)
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
      // Gracefully handle slot fetch failures without throwing uncaught console errors
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!mentorId) {
      setMentor(null)
      setSlots([])
      return
    }

    async function loadMentor() {
      try {
        const data = await getMentorById(mentorId)
        setMentor(data)
      } catch (err) {
        // Silently catch 404s so it doesn't interrupt the rest of the Dashboard state
        setMentor(null)
      }
    }

    loadMentor()
    loadSlots()
  }, [mentorId])

  useEffect(() => {
    if (user?.name) setCardName(user.name)
  }, [user])

  const sessionPrice = Number(mentor?.sessionPrice || 0)
  const sessionCurrency = mentor?.currency || 'EGP'

  async function handleBook(availabilityId) {
    try {
      setError('')
      setMessage('')

      if (!sessionPrice || sessionPrice <= 0) {
        throw new Error('This mentor has not set a valid session price yet.')
      }

      const payment = await createMockPayment({
        amount: sessionPrice,
        currency: sessionCurrency
      })

      await createBooking({
        studentId: user.id,
        availabilityId,
        paymentStatus: payment.paymentStatus,
        paymentReference: payment.paymentReference,
        amount: payment.amount,
        currency: payment.currency
      })

      setMessage(`Payment successful and session booked for ${sessionCurrency} ${payment.amount}`)
      setSelectedSlot(null)
      await loadSlots()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!mentorId) {
    return (
      <div className="surface-panel booking-panel">
        <p className="muted">Please select a mentor first.</p>
      </div>
    )
  }

  return (
    <div className="surface-panel booking-panel">
      <h3 className="panel-title light">AVAILABLE SESSIONS</h3>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {loading ? (
        <p>Loading available sessions...</p>
      ) : slots.length === 0 ? (
        <p>No available sessions for this mentor.</p>
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
            <div className="price-box">{sessionCurrency} {sessionPrice}</div>
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
              Pay {sessionCurrency} {sessionPrice} & confirm booking
            </button>

            <button className="secondary-button" onClick={() => setSelectedSlot(null)}>
              Back to slots
            </button>
          </div>
        </div>
      ) : (
        <div className="slot-list">
          {slots.map((slot) => (
            <div className="slot-card" key={slot._id}>
              <div>
                <strong>Date:</strong>{' '}
                {new Date(slot.date).toLocaleDateString()}
              </div>

              <div>
                <strong>Time:</strong>{' '}
                {slot.startTime} - {slot.endTime}
              </div>

              <button onClick={() => setSelectedSlot(slot)}>
                Select slot
              </button>
            </div>
          ))}
        </div>
      )}

      <MentorReviews mentorId={mentorId} user={user} />
    </div>
  )
}