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
  const token = sessionStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createMentor(profile){
  const res = await fetch(`${API_BASE}/api/mentors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(profile)
  });
  return parseResponse(res);
}

export async function getMyMentor(){
  const res = await fetch(`${API_BASE}/api/mentors/me`, { headers: authHeaders() });
  return parseResponse(res);
}

export async function getMentors(){
  const res = await fetch(`${API_BASE}/api/mentors`);
  return parseResponse(res);
}

export async function getMentorById(id){
  const res = await fetch(`${API_BASE}/api/mentors/${id}`);
  return parseResponse(res);
}
