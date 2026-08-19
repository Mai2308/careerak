import React from 'react'

export default function MentorModal({ mentor, onClose, onOpenMessages }) {
  if (!mentor) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#ffffff',
          color: '#333333',
          padding: '28px',
          borderRadius: '12px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            border: 'none',
            background: 'transparent',
            fontSize: '1.5rem',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >
          &times;
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '4px' }}>{mentor.name}</h2>
        <p style={{ color: '#666', fontWeight: 600, marginTop: 0, marginBottom: '16px' }}>
          {mentor.title || mentor.category || 'Mentor Profile'}
        </p>

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <strong>Category / Field:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#555' }}>
              {mentor.category || 'General'}{mentor.field ? ` · ${mentor.field}` : ''}
            </p>
          </div>

          <div>
            <strong>Bio:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#555', lineHeight: 1.5 }}>
              {mentor.bio || 'No detailed bio provided.'}
            </p>
          </div>

          <div>
            <strong>Skills:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#555' }}>
              {Array.isArray(mentor.skills) && mentor.skills.length > 0
                ? mentor.skills.join(', ')
                : 'Not specified'}
            </p>
          </div>

          <div>
            <strong>Session Rate:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
              {mentor.sessionPrice > 0 
                ? `${mentor.currency || 'EGP'} ${Number(mentor.sessionPrice).toLocaleString()} / session` 
                : 'Free / Not set'}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {onOpenMessages && (
            <button
              onClick={() => {
                onClose();
                onOpenMessages(mentor);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                border: '1px solid #0070f3',
                background: '#ffffff',
                color: '#0070f3',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              💬 Send Message
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '6px',
              border: 'none',
              background: '#0070f3',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}