const API_BASE = import.meta.env.VITE_API_BASE || ''

async function parseResponse(res){
  let data = null
  const text = await res.text()
  if (text){
    try{
      data = JSON.parse(text)
    }catch{
      data = null
    }
  }

  if (!res.ok){
    const message = data?.message || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data || {}
}

export async function register(payload){
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

export async function login(payload){
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return parseResponse(res)
}

function authHeaders(){
  const token = sessionStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getMyBookings(){
  const res = await fetch(`${API_BASE}/api/bookings/mine`, {
    headers: authHeaders()
  })
  return parseResponse(res)
}

export async function getProfile(){
  const res = await fetch(`${API_BASE}/api/users/me`, {
    headers: authHeaders()
  })
  return parseResponse(res)
}

export async function getCategories(){
  const res = await fetch(`${API_BASE}/api/explore/categories`, {
    headers: authHeaders()
  })
  return parseResponse(res)
}

export async function getFieldsByCategory(categoryId){
  const res = await fetch(`${API_BASE}/api/explore/categories/${categoryId}/fields`, {
    headers: authHeaders()
  })
  return parseResponse(res)
}

export async function getMentorsByField(fieldId){
  const res = await fetch(`${API_BASE}/api/explore/fields/${fieldId}/mentors`, {
    headers: authHeaders()
  })
  return parseResponse(res)
}

export async function getAllFields(){
  const res = await fetch(`${API_BASE}/api/explore/fields`, {
    headers: authHeaders()
  })
  return parseResponse(res)
}

export async function getRecommendations(){
  const res = await fetch(`${API_BASE}/api/explore/recommendations`, {
    headers: authHeaders()
  })
  return parseResponse(res)
}

export async function getMyInterests(){
  const res = await fetch(`${API_BASE}/api/users/me/interests`, {
    headers: authHeaders()
  })
  return parseResponse(res)
}

export async function saveMyInterests(fieldIds){
  const res = await fetch(`${API_BASE}/api/users/me/interests`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ fieldIds })
  })
  return parseResponse(res)
}
