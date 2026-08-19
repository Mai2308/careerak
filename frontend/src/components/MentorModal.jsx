import React from 'react'

export default function MentorModal({ mentor, onClose, onOpenMessages }) {
  if (!mentor) return null

  // Safely extract bio across different potential API field names
  const bioText = mentor.bio || mentor.about || mentor.description

  // Safely extract skills into an array
  const skillsList = Array.isArray(mentor.skills)
    ? mentor.skills
    : typeof mentor.skills === 'string' && mentor.skills.trim()
    ? mentor.skills.split(',').map((s) => s.trim())
    : []

  const initials = (mentor.name || 'Mentor')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '540px',
          padding: '32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Top Header Section */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '22px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
              flexShrink: 0
            }}
          >
            {initials}
          </div>

          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {mentor.name}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0', fontWeight: '500' }}>
              {mentor.title || 'Mentor'} • {mentor.category || 'Technology'}
              {mentor.field ? ` · ${mentor.field}` : ''}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '14px' }}>
                ⭐ {mentor.rating ? Number(mentor.rating).toFixed(1) : 'New'}
              </span>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' }} />

        {/* Bio Section */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ABOUT MENTOR
          </span>
          <p
            style={{
              color: bioText ? '#334155' : '#94a3b8',
              fontSize: '14px',
              marginTop: '6px',
              lineHeight: '1.6',
              fontStyle: bioText ? 'normal' : 'italic'
            }}
          >
            {bioText || 'No bio available for this mentor yet.'}
          </p>
        </div>

        {/* Skills Section */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
            SKILLS
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {skillsList.length > 0 ? (
              skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
                No skills listed.
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginTop: '20px'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
              SESSION RATE
            </span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              {mentor.sessionPrice > 0
                ? `${mentor.currency || 'EGP'} ${Number(mentor.sessionPrice).toLocaleString()} / session`
                : 'Free / Not set'}
            </div>
          </div>

          {onOpenMessages && (
            <button
              onClick={() => {
                onClose()
                onOpenMessages(mentor)
              }}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              💬 Message
            </button>
          )}
        </div>
      </div>
    </div>
  )
}