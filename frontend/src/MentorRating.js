import React, { useEffect, useState } from 'react';
import './MentorRating.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';
const DEFAULT_MENTOR_ID = process.env.REACT_APP_MENTOR_ID || '';

function renderStars(rating) {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < rounded ? 'star filled' : 'star'}>
      ★
    </span>
  ));
}

function MentorRating() {
  const [mentor, setMentor] = useState(null);
  const [mentorId, setMentorId] = useState(DEFAULT_MENTOR_ID);
  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const notify = (text, type = 'success') => {
    setMessage(text);
    setToast(text);
    setToastType(type);
  };

  useEffect(() => {
    async function loadMentor() {
      try {
        let activeMentorId = DEFAULT_MENTOR_ID;

        if (!activeMentorId) {
          const listResponse = await fetch(`${API_BASE}/mentors`);
          const listJson = await listResponse.json();
          if (!listResponse.ok || !Array.isArray(listJson) || listJson.length === 0) {
            notify('No mentor data available.', 'error');
            return;
          }
          activeMentorId = listJson[0]._id;
        }

        const response = await fetch(`${API_BASE}/mentors/${activeMentorId}`);
        const json = await response.json();
        if (response.ok && json.mentor) {
          setMentorId(activeMentorId);
          setMentor(json.mentor);
          setReviews(Array.isArray(json.reviews) ? json.reviews : []);
        } else {
          notify(json.message || 'Unable to load mentor.', 'error');
          setReviews([]);
        }
      } catch (error) {
        notify('Failed to connect to backend.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadMentor();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reviewerName.trim() || !comment.trim()) {
      notify('Please provide your name and a review comment.', 'error');
      return;
    }

    const activeMentorId = mentor?._id || mentorId;
    if (!activeMentorId) {
      notify('No mentor selected to submit a review.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/mentors/${activeMentorId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerName, rating: selectedRating, comment }),
      });
      const json = await response.json();

      if (response.ok) {
        setMentor(json.mentor);
        setReviews((prev) => [json.review, ...(Array.isArray(prev) ? prev : [])]);
        setReviewerName('');
        setComment('');
        setSelectedRating(5);
        notify('Review submitted successfully.', 'success');
      } else {
        notify(json.message || 'Failed to submit review.', 'error');
      }
    } catch (error) {
      notify('Unable to submit review.', 'error');
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (loading) {
    return <div className="rating-shell">Loading mentor data...</div>;
  }

  return (
    <div className="rating-shell">
      <div className="rating-header">
        <div>
          <h1>Mentor Rating</h1>
          <p>Submit a review and see the mentor's score update automatically.</p>
        </div>
      </div>

      <div className="rating-grid">
        <section className="mentor-summary card">
          <div className="mentor-top">
            <div className="mentor-avatar">{mentor?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
            <div>
              <h2>{mentor?.name}</h2>
              <p className="mentor-field">{mentor?.field}</p>
            </div>
          </div>

          <div className="rating-block">
            <div className="rating-average">
              <span className="rating-value">{mentor?.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="rating-label">Average Rating</span>
            </div>
            <div className="rating-stars">{renderStars(mentor?.averageRating || 0)}</div>
            <div className="rating-meta">{mentor?.reviewCount || 0} reviews · {mentor?.recommendedPercent || 0}% recommended</div>
          </div>

          <div className="stat-cards">
            <div className="stat-card">
              <strong>{mentor?.reviewCount || 0}</strong>
              <span>Total Reviews</span>
            </div>
            <div className="stat-card">
              <strong>{mentor?.averageRating?.toFixed(1) || '0.0'}</strong>
              <span>Avg Score</span>
            </div>
            <div className="stat-card">
              <strong>{mentor?.recommendedPercent || 0}%</strong>
              <span>Recommended</span>
            </div>
          </div>
        </section>

        <section className="review-form card">
          <h2>Leave a Review</h2>
          {message && <div className="message">{message}</div>}

          <form onSubmit={handleSubmit}>
            <label>
              Your Name
              <input
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Alex Martinez"
              />
            </label>

            <label>
              Rating
              <div className="rating-select">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= selectedRating ? 'rating-button selected' : 'rating-button'}
                    onClick={() => setSelectedRating(value)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </label>

            <label>
              Review
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience"
                rows="5"
              />
            </label>

            <button type="submit">Submit Review</button>
          </form>
        </section>
      </div>

      <section className="reviews card">
        <h2>Recent Reviews</h2>
        {(!Array.isArray(reviews) || reviews.length === 0) ? (
          <p>No reviews yet. Be the first to add feedback!</p>
        ) : (
          reviews.map((review) => (
            <article key={review._id || `${review.createdAt}-${review.reviewerName}`} className="review-card">
              <div className="review-top">
                <strong>{review.reviewerName}</strong>
                <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <p>{review.comment}</p>
              <small>{new Date(review.createdAt).toLocaleDateString()}</small>
            </article>
          ))
        )}
      </section>

      {toast && (
        <div className={`toast ${toastType}`}>
          {toast}
        </div>
      )}
    </div>
  );
}

export default MentorRating;
