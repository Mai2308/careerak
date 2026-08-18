import React, { useEffect, useState } from 'react'
import { getMentorReviews, submitMentorReview, getStudentBookings } from '../api'

export default function MentorReviews({ mentorId, user }) {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)

  async function loadReviews() {
    try {
      setLoading(true)
      const data = await getMentorReviews(mentorId)
      setReviews(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mentorId) loadReviews()
  }, [mentorId])

  useEffect(() => {
    if (!mentorId || user?.role !== 'student') {
      setCanReview(false)
      return
    }

    let cancelled = false
    getStudentBookings(user.id)
      .then((data) => {
        if (cancelled) return
        const bookings = Array.isArray(data) ? data : []
        const hasBooked = bookings.some((b) => {
          const bookingMentorId = b.mentorId?._id || b.mentorId
          return String(bookingMentorId) === String(mentorId) &&
            (b.status === 'confirmed' || b.status === 'completed')
        })
        setCanReview(hasBooked)
      })
      .catch(() => setCanReview(false))

    return () => { cancelled = true }
  }, [mentorId, user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await submitMentorReview(mentorId, { rating: Number(rating), comment })
      setComment('')
      setMessage('Review submitted successfully')
      await loadReviews()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!mentorId) return null

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return (
    <div className="surface-panel review-panel">
      <div className="section-header-row">
        <h3 className="panel-title light">MENTOR REVIEWS</h3>
      </div>

      <div className="rating-summary">
        <div className="rating-summary-value">{average ? average.toFixed(1) : '—'}</div>
        <div>
          <div className="rating-summary-stars">
            {'★'.repeat(Math.round(average || 0)).padEnd(5, '☆')}
          </div>
          <div className="rating-summary-count">
            {reviews.length} review{reviews.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {user?.role === 'student' && canReview && (
        <form className="review-form" onSubmit={handleSubmit}>
          <label className="field-label">
            Your rating
            <div className="star-picker" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`star-picker-button${n <= (hoverRating || rating) ? ' filled' : ''}`}
                  onMouseEnter={() => setHoverRating(n)}
                  onClick={() => setRating(n)}
                  aria-label={`Rate ${n} out of 5`}
                >
                  ★
                </button>
              ))}
            </div>
          </label>
          <textarea
            placeholder="Share your experience with this mentor"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button type="submit" className="pill-button">Submit review</button>
        </form>
      )}
      {user?.role === 'student' && !canReview && (
        <p className="muted">You can review this mentor after booking a session with them.</p>
      )}

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {loading ? (
        <p className="muted">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="muted">Be the first to review this mentor.</p>
      ) : (
        <div className="review-list">
          {reviews.map((r) => (
            <div className="review-card" key={r._id}>
              <div className="review-heading">
                <div className="review-heading-left">
                  <div className="review-avatar">
                    {(r.reviewerName || 'S').split(' ').map((piece) => piece[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <h4>{r.reviewerName}</h4>
                </div>
                <span className="star-rating">★ {Number(r.rating || 0).toFixed(1)}</span>
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
