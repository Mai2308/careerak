import React, { useEffect, useState } from 'react'
import { getMentorReviews, submitMentorReview, getStudentBookings } from '../api'

export default function MentorReviews({ mentorId, user }) {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
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
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="card">
      <h2>Mentor Reviews</h2>
      <p>
        {average ? `${average} / 5 (${reviews.length} review${reviews.length === 1 ? '' : 's'})` : 'No reviews yet'}
      </p>

      {user?.role === 'student' && canReview && (
        <form onSubmit={handleSubmit}>
          <label>
            Rating
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <textarea
            placeholder="Share your experience with this mentor"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button type="submit">Submit Review</button>
        </form>
      )}
      {user?.role === 'student' && !canReview && (
        <p>You can review this mentor after booking a session with them.</p>
      )}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>Be the first to review this mentor.</p>
      ) : (
        reviews.map((r) => (
          <div className="card" key={r._id}>
            <strong>{r.reviewerName}</strong> — {r.rating}/5
            <p>{r.comment}</p>
          </div>
        ))
      )}
    </div>
  )
}
