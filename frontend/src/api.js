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
