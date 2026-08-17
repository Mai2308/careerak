import React, { useState } from 'react'
import { login } from '../api'

export default function Login({ onAuth, onBack }){
  const [form, setForm] = useState({ email:'', password:'' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const validate = ()=>{
    const errs = []
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRe.test(form.email)) errs.push('Enter a valid email')
    if (!form.password) errs.push('Password is required')
    return errs
  }

  const submit = async e => {
    e.preventDefault()
    setMsg(null)
    const v = validate()
    if (v.length){ setErrors(v); return }
    setErrors([])
    setLoading(true)
    try{
      const res = await login(form)
      if (res.token){
        onAuth && onAuth({ token: res.token, user: res.user })
      } else {
        setMsg(res.message || 'Login failed')
      }
    }catch(err){
      setMsg(err.message || 'Network or server error')
    }finally{ setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel auth-copy">
        <div className="logo">
        </div>
        <h2>Welcome back</h2>
        <p>Continue building your next career move with mentors who understand your path.</p>
        <ul>
          <li>Book expert sessions</li>
          <li>Compare mentors by field</li>
          <li>Track your goals in one place</li>
        </ul>
      </div>

      <form onSubmit={submit} className="card auth-card auth-form">
        <button type="button" className="link-button inline-back" onClick={onBack}>
          ← Back
        </button>
        <div className="auth-heading">
          <span className="eyebrow">Log in</span>
          <h2>Access your dashboard</h2>
        </div>

        {errors.length > 0 && (
          <ul className="error-list">
            {errors.map((e,i)=>(<li key={i}>{e}</li>))}
          </ul>
        )}

        <label className="field-label">
          Email
          <input placeholder="you@example.com" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
        </label>

        <label className="field-label">
          Password
          <input placeholder="Enter your password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        </label>

        <button type="submit" className="pill-button full-width" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        {msg && <p className="msg">{msg}</p>}
      </form>
    </div>
  )
}
