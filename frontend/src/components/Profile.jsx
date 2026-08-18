import React, { useEffect, useState } from 'react'
import { getProfile, updateProfile, changePassword, deleteAccount } from '../api'
import Interests from './Interests'

const CATEGORY_OPTIONS = [
  'Technology',
  'Business & Finance',
  'Design & Creative',
  'Marketing',
  'Engineering',
  'Health & Science',
  'Education'
]

export default function Profile({ user, onBack, onLogout, onUserUpdated }) {
  const [profile, setProfile] = useState(user)
  const [loading, setLoading] = useState(true)
  const [showInterests, setShowInterests] = useState(false)

  // Edit Profile form state
  const [name, setName] = useState(user?.name || '')
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'undergraduate')
  const [category, setCategory] = useState(user?.category || CATEGORY_OPTIONS[0])
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [changingPwd, setChangingPwd] = useState(false)

  // Delete account dialog state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getProfile()
        if (!cancelled && res.user) {
          setProfile(res.user)
          setName(res.user.name || '')
          setEducationLevel(res.user.educationLevel || 'undergraduate')
          if (res.user.category) setCategory(res.user.category)
        }
      } catch (err) {
        if (!cancelled) setProfileMsg(err.message || 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (showInterests) {
    return <Interests onBack={() => setShowInterests(false)} />
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileMsg(null)
    setProfileSuccess(null)

    if (!name.trim()) {
      setProfileMsg('Name cannot be empty')
      return
    }

    setSavingProfile(true)
    try {
      const payload = { name: name.trim() }
      if (profile?.role === 'mentor') {
        payload.category = category
      } else {
        payload.educationLevel = educationLevel
      }

      const res = await updateProfile(payload)
      if (res.user) {
        setProfile(res.user)
        if (onUserUpdated) onUserUpdated(res.user)
        setProfileSuccess('Profile updated successfully!')
      }
    } catch (err) {
      setProfileMsg(err.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg(null)
    setPasswordSuccess(null)

    if (!currentPassword || !newPassword) {
      setPasswordMsg('Please fill in both current and new password')
      return
    }

    if (newPassword.length < 6) {
      setPasswordMsg('New password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match')
      return
    }

    setChangingPwd(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setPasswordSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg(err.message || 'Failed to change password')
    } finally {
      setChangingPwd(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccount()
      if (onLogout) onLogout()
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  const initials = (profile?.name || 'User')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="profile-page-container">
      <button className="link-button inline-back" onClick={onBack}>
        ← Back to Dashboard
      </button>

      {/* Header Profile Summary Panel */}
      <div className="surface-panel profile-header-card">
        <div className="profile-header-avatar">{initials}</div>
        <div className="profile-header-info">
          <h2>{profile?.name}</h2>
          <p className="muted">{profile?.email}</p>
          <div className="profile-badge-row">
            <span className="profile-role-badge">
              {profile?.role === 'mentor' ? '🎓 Mentor' : '🎓 Student'}
            </span>
            {profile?.role === 'mentor' ? (
              <span className="profile-level-badge">{profile?.category || category}</span>
            ) : (
              profile?.educationLevel && (
                <span className="profile-level-badge">{profile.educationLevel}</span>
              )
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="surface-panel">Loading profile...</div>
      ) : (
        <div className="profile-sections-grid">
          {/* Section 1: Personal Information */}
          <div className="surface-panel profile-section-card">
            <h3 className="section-card-title">Personal Information</h3>
            <p className="muted">Update your profile details and education level.</p>

            {profileMsg && <div className="error-message" style={{ marginTop: 12 }}>{profileMsg}</div>}
            {profileSuccess && <div className="success-message" style={{ marginTop: 12 }}>{profileSuccess}</div>}

            <form onSubmit={handleSaveProfile} className="profile-form">
              <label className="field-label">
                <span>Full Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </label>

              <label className="field-label">
                <span>Email Address (Read-only)</span>
                <input type="email" value={profile?.email || ''} disabled />
              </label>

              {profile?.role === 'mentor' ? (
                <label className="field-label">
                  <span>Mentor Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="field-label">
                  <span>Education Level</span>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                  >
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              )}

              <div className="profile-form-actions">
                <button type="submit" disabled={savingProfile} className="pill-button">
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>

                {profile?.role === 'student' && (
                  <button
                    type="button"
                    className="pill-button outline"
                    onClick={() => setShowInterests(true)}
                  >
                    Manage Interests
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Section 2: Security & Password */}
          <div className="surface-panel profile-section-card">
            <h3 className="section-card-title">Security & Password</h3>
            <p className="muted">Ensure your account is using a strong password.</p>

            {passwordMsg && <div className="error-message" style={{ marginTop: 12 }}>{passwordMsg}</div>}
            {passwordSuccess && <div className="success-message" style={{ marginTop: 12 }}>{passwordSuccess}</div>}

            <form onSubmit={handleChangePassword} className="profile-form">
              <label className="field-label">
                <span>Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              <label className="field-label">
                <span>New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </label>

              <label className="field-label">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                />
              </label>

              <button type="submit" disabled={changingPwd} className="secondary-button" style={{ alignSelf: 'flex-start', padding: '12px 24px', borderRadius: '999px', fontWeight: '700' }}>
                {changingPwd ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Section 3: Danger Zone */}
          <div className="surface-panel profile-section-card danger-zone-card">
            <h3 className="section-card-title danger-title">Danger Zone</h3>
            <p className="muted">
              Permanently delete your Careerak account and all associated profile data.
            </p>

            <button
              type="button"
              className="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="messages-drawer-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account?</h3>
            <p className="muted">
              Are you sure you want to delete your account? This action is permanent and cannot be reversed.
            </p>
            {deleteError && <div className="error-message">{deleteError}</div>}
            <div className="delete-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
