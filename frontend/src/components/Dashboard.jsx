import React, { useEffect, useState } from 'react'
import MentorAvailability from './MentorAvailability'
import MentorBookings from './MentorBookings'
import AvailableSlots from './AvailableSlots'
import StudentBookings from './StudentBookings'
import { getMyMentor, getMentors } from '../api'
import MentorProfile from './MentorProfile'

export default function Dashboard({ user, onViewProfile, onExplore }) {
  const [mentorProfile, setMentorProfile] = useState(null)
  const [mentors, setMentors] = useState([])
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [loadingMentors, setLoadingMentors] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [activeField, setActiveField] = useState('all')

  useEffect(() => {
    if (!user) return

    if (user.role === 'mentor') {
      setLoading(true)
      getMyMentor()
        .then((m) => setMentorProfile(m))
        .catch(() => setMentorProfile(null))
        .finally(() => setLoading(false))
      return
    }

    async function loadMentors() {
      try {
        setLoadingMentors(true)
        const data = await getMentors()
        const list = Array.isArray(data) ? data : []
        setMentors(list)
        if (list.length > 0) {
          setSelectedMentorId(list[0]._id || list[0].id)
        }
      } catch (err) {
        console.error('Failed to load mentors', err)
        setMentors([])
      } finally {
        setLoadingMentors(false)
      }
    }

    loadMentors()
  }, [user])

  if (!user) return <div className="card">Please log in.</div>

  const fieldOptions = Array.from(new Set(mentors.flatMap((m) => m.interests || []))).sort()

  const filteredMentors = mentors
    .filter((m) => activeField === 'all' || (m.interests || []).includes(activeField))
    .filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : (b.rating || 0) - (a.rating || 0))

  if (user.role === 'mentor') {
    const reviews = mentorProfile?.reviews || []

    return (
      <div className="mentor-dashboard">
        <header className="mentor-dashboard-header">
          <div className="brand-block">
            <span className="logo-icon">🎓</span>
            <span className="brand-name">Careerak</span>
          </div>
          <button className="pill-button mentor-cta">Get started</button>
        </header>

        {loading ? (
          <div className="surface-panel">Loading your profile...</div>
        ) : !mentorProfile ? (
          <div>
            <div className="surface-panel compact-panel">
              <h2 className="panel-title light">Create your mentor profile</h2>
              <p className="muted">Set up your title, bio, and availability to start accepting students.</p>
            </div>
            <MentorProfile onSaved={(m) => { setMentorProfile(m); setEditing(false) }} />
          </div>
        ) : (
          <div>
            <div className="surface-panel profile-summary-panel">
              <div className="profile-topline">
                <div className="profile-avatar">{mentorProfile.name?.split(' ').map((piece) => piece[0]).slice(0, 2).join('').toUpperCase() || 'M'}</div>
                <div className="profile-meta">
                  <div className="profile-name-row">
                    <h2>{mentorProfile.name}</h2>
                    <button className="secondary-button compact" onClick={() => setEditing(!editing)}>
                      {editing ? 'Close editor' : 'Edit profile'}
                    </button>
                  </div>
                  <p className="profile-title">{mentorProfile.title || 'Mentor'}</p>
                </div>
              </div>

              <div className="profile-body">
                <p><strong>Bio</strong><span>{mentorProfile.bio || 'No bio yet.'}</span></p>
                <p><strong>Skills</strong><span>{mentorProfile.skills?.join(', ') || 'No skills added yet.'}</span></p>
              </div>
            </div>

            {editing && (
              <div className="surface-panel form-panel">
                <MentorProfile
                  initial={mentorProfile}
                  onSaved={(m) => { setMentorProfile(m); setEditing(false) }}
                />
              </div>
            )}

            <div className="stats-grid">
              <div className="surface-panel stat-panel">
                <div className="stat-label">UPCOMING SESSIONS</div>
                <div className="stat-value">{mentorProfile.sessionsCount || 3}</div>
              </div>

              <div className="surface-panel stat-panel">
                <div className="stat-label">AVERAGE RATING</div>
                <div className="stat-value large-rating">
                  {mentorProfile.rating ? mentorProfile.rating.toFixed(1) : '4.9'}
                </div>
              </div>
            </div>

            <MentorBookings user={user} />
            <MentorAvailability user={user} />

            <div className="surface-panel review-panel">
              <div className="section-header-row">
                <h3 className="panel-title light">RECENT REVIEWS</h3>
              </div>
              <div className="review-list">
                {reviews.map((review, index) => (
                  <div className="review-card" key={`${review.name}-${index}`}>
                    <div className="review-heading">
                      <h4>{review.name}</h4>
                      <span className="star-rating">★ {Number(review.rating || 5).toFixed(1)}</span>
                    </div>
                    <p>{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const initials = user.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'S'

  return (
    <div className="student-dashboard">

      <div className="surface-panel profile-summary-panel">
        <div className="profile-topline">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-meta">
            <div className="profile-name-row">
              <h2>Welcome back, {user.name}</h2>
              <div className="student-header-actions">
                {onViewProfile && (
                  <button className="secondary-button compact" onClick={onViewProfile}>My Profile</button>
                )}
                {onExplore && (
                  <button className="secondary-button compact" onClick={onExplore}>Explore</button>
                )}
              </div>
            </div>
            <p className="profile-title">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="surface-panel">
        <div className="section-header-row">
          <h3 className="panel-title light">FIND YOUR MENTOR</h3>
          <span className="muted" style={{ fontSize: '0.9rem' }}>
            {mentors.length} mentor{mentors.length === 1 ? '' : 's'} available
          </span>
        </div>

        <div className="mentor-filter-row">
          <input
            className="mentor-search-input"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="mentor-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Highest rated</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>

        <div className="field-pills">
          <button
            type="button"
            className={`field-pill${activeField === 'all' ? ' active' : ''}`}
            onClick={() => setActiveField('all')}
          >
            All fields
          </button>
          {fieldOptions.map((field) => (
            <button
              key={field}
              type="button"
              className={`field-pill${activeField === field ? ' active' : ''}`}
              onClick={() => setActiveField(field)}
            >
              {field}
            </button>
          ))}
        </div>

        {loadingMentors ? (
          <p className="booking-empty">Loading mentors…</p>
        ) : mentors.length === 0 ? (
          <p className="booking-empty">No mentors are available yet.</p>
        ) : filteredMentors.length === 0 ? (
          <p className="booking-empty">No mentors match your search.</p>
        ) : (
          <div className="mentor-grid">
            {filteredMentors.map((mentor) => {
              const id = mentor._id || mentor.id
              return (
                <button
                  type="button"
                  key={id}
                  className={`mentor-card${selectedMentorId === id ? ' active' : ''}`}
                  onClick={() => setSelectedMentorId(id)}
                >
                  <div className="mentor-card-avatar">
                    {mentor.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'M'}
                  </div>
                  <strong>{mentor.name}</strong>
                  <span className="mentor-rating">★ {mentor.rating ? mentor.rating.toFixed(1) : 'New'}</span>
                  {mentor.interests?.length > 0 && (
                    <span className="muted" style={{ fontSize: '0.82rem' }}>{mentor.interests.join(', ')}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <AvailableSlots user={user} mentorId={selectedMentorId} />
      <StudentBookings user={user} />
    </div>
  )
}
