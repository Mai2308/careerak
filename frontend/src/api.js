const API_BASE = import.meta.env.VITE_API_BASE || ''

async function parseResponse(res) {
  let data = null

  const text = await res.text()

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data || {}
}

function authHeaders() {
  const token = sessionStorage.getItem('token') || ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// =======================
// AUTH
// =======================

export async function register(payload) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

export async function login(payload) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

// =======================
// MENTOR PROFILE
// =======================

export async function createMentor(profile) {
  const res = await fetch(`${API_BASE}/api/mentors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(profile)
  })
  return parseResponse(res)
}

export async function getMyMentor() {
  const res = await fetch(`${API_BASE}/api/mentors/me`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function getMentors() {
  const res = await fetch(`${API_BASE}/api/users/mentors`)
  return parseResponse(res)
}

export async function getMentorById(id) {
  const res = await fetch(`${API_BASE}/api/mentors/${id}`)
  return parseResponse(res)
}

export async function getMentorReviews(mentorId) {
  const res = await fetch(`${API_BASE}/api/mentors/${mentorId}/reviews`)
  return parseResponse(res)
}

export async function submitMentorReview(mentorId, payload) {
  const res = await fetch(`${API_BASE}/api/mentors/${mentorId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

// =======================
// USER PROFILE & INTERESTS
// =======================

export async function getProfile() {
  const res = await fetch(`${API_BASE}/api/users/me`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function getMyInterests() {
  const res = await fetch(`${API_BASE}/api/users/me/interests`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function saveMyInterests(fieldIds) {
  const res = await fetch(`${API_BASE}/api/users/me/interests`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ fieldIds })
  })
  return parseResponse(res)
}

// =======================
// EXPLORE
// =======================

export async function getCategories() {
  const res = await fetch(`${API_BASE}/api/explore/categories`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function getFieldsByCategory(categoryId) {
  const res = await fetch(`${API_BASE}/api/explore/categories/${categoryId}/fields`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function getMentorsByField(fieldId) {
  const res = await fetch(`${API_BASE}/api/explore/fields/${fieldId}/mentors`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function getAllFields() {
  const res = await fetch(`${API_BASE}/api/explore/fields`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function getRecommendations() {
  const res = await fetch(`${API_BASE}/api/explore/recommendations`, { headers: authHeaders() })
  return parseResponse(res)
}

// =======================
// AVAILABILITY
// =======================

export async function createAvailability(payload) {
  const res = await fetch(`${API_BASE}/api/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

export async function getMentorAvailability(mentorId) {
  const res = await fetch(`${API_BASE}/api/availability/mentor/${mentorId}`)
  return parseResponse(res)
}

export async function deleteAvailability(availabilityId) {
  const res = await fetch(`${API_BASE}/api/availability/${availabilityId}`, { method: 'DELETE' })
  return parseResponse(res)
}

// =======================
// BOOKINGS
// =======================

export async function createMockPayment(payload) {
  const res = await fetch(`${API_BASE}/api/bookings/mock-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

export async function getStudentBookings(studentId) {
  const res = await fetch(`${API_BASE}/api/bookings/student/${studentId}`)
  return parseResponse(res)
}

export async function getMentorBookings(mentorId) {
  const res = await fetch(`${API_BASE}/api/bookings/mentor/${mentorId}`)
  return parseResponse(res)
}

export async function cancelBooking(bookingId) {
  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, { method: 'PATCH' })
  return parseResponse(res)
}

// =======================
// MESSAGES
// =======================

export async function sendMessage(payload) {
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

export async function getConversations() {
  const res = await fetch(`${API_BASE}/api/messages/conversations`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function getMessagesWithUser(otherUserId) {
  const res = await fetch(`${API_BASE}/api/messages/${otherUserId}`, { headers: authHeaders() })
  return parseResponse(res)
}

export async function getUnreadMessageCount() {
  const res = await fetch(`${API_BASE}/api/messages/unread-count`, { headers: authHeaders() })
  return parseResponse(res)
}
