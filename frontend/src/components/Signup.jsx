import React, { useState } from 'react'
import { register, createMentor } from '../api'

const FIELD_OPTIONS = ['Engineering', 'Computer Science', 'Data Analysis', 'Marketing', 'Finance', 'Business', 'Design', 'Healthcare']

export default function Signup({ initialRole = 'student', onAuth, onBack }){
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', role:initialRole, interests: FIELD_OPTIONS[0], educationLevel:'undergraduate' })
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = []
    if (!form.name || form.name.length < 2) errs.push('Name must be at least 2 characters')
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRe.test(form.email)) errs.push('Enter a valid email')
    if (!form.password || form.password.length < 6) errs.push('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) errs.push('Passwords must match')
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
      const payload = { ...form, interests: form.role === 'student' ? [form.interests] : [] }
      const res = await register(payload)
      if (res.token){
        // store token immediately so subsequent API calls are authenticated
        try{ sessionStorage.setItem('token', res.token); sessionStorage.setItem('user', JSON.stringify(res.user)); }catch(e){}
        // If user signed up as mentor, create a mentor profile record then authenticate
        if (payload.role === 'mentor'){
          try{
            // minimal profile created; user can edit later from dashboard
            await createMentor({ name: payload.name, title: '', bio: '', skills: [], availableSlots: [] });
          }catch(err){
            // ignore profile creation error for now
            console.warn('Failed to create mentor profile', err.message)
          }
        }
        onAuth && onAuth({ token: res.token, user: res.user })
      } else {
        setMsg(res.message || 'Registration failed')
      }
    }catch(err){
      setMsg(err.message || 'Network or server error')
    }finally{ setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel auth-copy">
        
        <h2>Start your next chapter</h2>
        <p>Join students and mentors building stronger career paths through guidance, trust and better decisions.</p>
        <ul>
          <li>Discover mentors in your field</li>
          <li>Book sessions that fit your goals</li>
          <li>Build a clearer path forward</li>
        </ul>
      </div>

      <form onSubmit={submit} className="card auth-card auth-form">
        <button type="button" className="link-button inline-back" onClick={onBack}>
          ← Back
        </button>
        <div className="auth-heading">
          <span className="eyebrow">Create account</span>
          <h2>Tell us who you are</h2>
        </div>

        <div className="role-toggle">
          <button
            type="button"
            className={form.role === 'student' ? 'active' : ''}
            onClick={()=>setForm({...form, role:'student'})}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={form.role === 'mentor' ? 'active' : ''}
            onClick={()=>setForm({...form, role:'mentor'})}
          >
            👤 Mentor
          </button>
        </div>

        {errors.length > 0 && (
          <ul className="error-list">
            {errors.map((e,i)=>(<li key={i}>{e}</li>))}
          </ul>
        )}

        <label className="field-label">
          Full name
          <input placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
        </label>

        <label className="field-label">
          Email
          <input placeholder="you@example.com" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
        </label>

        <label className="field-label">
          Password
          <input placeholder="At least 8 characters" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        </label>

        <label className="field-label">
          Confirm password
          <input placeholder="Re-enter your password" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required />
        </label>

        <label className="checkbox-label">
          <input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)} />
          Show password
        </label>

        {form.role === 'student' && (
          <label className="field-label">
            Field of interest
            <select value={form.interests} onChange={e=>setForm({...form,interests:e.target.value})}>
              {FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        )}

        <button type="submit" className="pill-button full-width" disabled={loading}>
          {loading ? 'Creating...' : 'Create account & see mentors'}
        </button>
        {msg && <p className="msg">{msg}</p>}
      </form>
    </div>
  )
}
