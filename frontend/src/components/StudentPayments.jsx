import React, { useState, useEffect } from 'react'
import { getStudentBookings } from '../api'

export default function StudentPayments({ user }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadPayments() {
      // Determine student ID safely across different backend user shapes
      const studentId = user?._id || user?.id

      if (!studentId) {
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await getStudentBookings(studentId)
        
        if (isMounted) {
          // Format response into array if data is wrapped inside an object
          const list = Array.isArray(data) ? data : (data?.bookings || [])
          setBookings(list)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load payment history:', err)
          setError(err.message || 'Failed to load transaction history')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPayments()

    return () => {
      isMounted = false
    }
  }, [user])

  // Extract payment transaction history from completed/paid bookings
  const paidTransactions = bookings.filter(
    (b) => b.paymentStatus === 'paid' || b.status === 'confirmed' || b.status === 'completed' || b.amount
  )

  return (
    <div className="surface-panel payment-methods-card" style={{ marginTop: '24px' }}>
      {/* SAVED PAYMENT METHODS */}
      <h3 className="section-card-title">SAVED PAYMENT METHODS</h3>
      <div className="saved-cards-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px', marginTop: '12px' }}>
        <div
          className="credit-card-preview"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            padding: '18px',
            borderRadius: '12px',
            width: '240px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
            <span>Visa</span>
            <span style={{ color: '#94a3b8' }}>•••• 4242</span>
          </div>
          <div style={{ margin: '20px 0 12px', letterSpacing: '2px', fontSize: '16px' }}>
            •••• •••• •••• 4242
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1' }}>
            <span>{user?.name || 'Cardholder'}</span>
            <span>Expires 12/30</span>
          </div>
        </div>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid var(--border-color, #e2e8f0)', margin: '24px 0' }} />

      {/* PAYMENT & TRANSACTION HISTORY */}
      <h3 className="section-card-title">PAYMENT & TRANSACTION HISTORY</h3>

      {loading ? (
        <p className="muted" style={{ marginTop: '8px' }}>Loading payment records...</p>
      ) : error ? (
        <div className="error-message" style={{ marginTop: '8px' }}>{error}</div>
      ) : paidTransactions.length === 0 ? (
        <p className="muted" style={{ marginTop: '8px' }}>No payment transactions found.</p>
      ) : (
        <div className="table-responsive" style={{ marginTop: '12px' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                <th style={{ padding: '8px' }}>Date</th>
                <th style={{ padding: '8px' }}>Description</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {paidTransactions.map((item) => (
                <tr key={item._id || item.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <td style={{ padding: '10px 8px' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {item.topic || item.mentorName ? `Mentorship Session - ${item.mentorName || 'Mentor'}` : 'Booking Session'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span className="badge success" style={{ textTransform: 'capitalize' }}>
                      {item.paymentStatus || 'Paid'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${item.amount || item.price || '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}