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


// =======================
// AUTH
// =======================

export async function register(payload) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return parseResponse(res)
}


export async function login(payload) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return parseResponse(res)
}


// =======================
// AVAILABILITY
// =======================

// Mentor creates an availability slot
export async function createAvailability(payload) {
  const res = await fetch(`${API_BASE}/api/availability`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return parseResponse(res)
}


// Get all availability slots for one mentor
export async function getMentorAvailability(mentorId) {
  const res = await fetch(
    `${API_BASE}/api/availability/mentor/${mentorId}`
  )

  return parseResponse(res)
}

export async function getMentors() {
  const res = await fetch(`${API_BASE}/api/users/mentors`)
  return parseResponse(res)
}


// Delete an availability slot
export async function deleteAvailability(availabilityId) {
  const res = await fetch(
    `${API_BASE}/api/availability/${availabilityId}`,
    {
      method: 'DELETE'
    }
  )

  return parseResponse(res)
}


// =======================
// BOOKINGS
// =======================

// Student creates a booking
export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return parseResponse(res)
}


// Get bookings for one student
export async function getStudentBookings(studentId) {
  const res = await fetch(
    `${API_BASE}/api/bookings/student/${studentId}`
  )

  return parseResponse(res)
}


// Get bookings for one mentor
export async function getMentorBookings(mentorId) {
  const res = await fetch(
    `${API_BASE}/api/bookings/mentor/${mentorId}`
  )

  return parseResponse(res)
}


// Cancel a booking
export async function cancelBooking(bookingId) {
  const res = await fetch(
    `${API_BASE}/api/bookings/${bookingId}/cancel`,
    {
      method: 'PATCH'
    }
  )

  return parseResponse(res)
}