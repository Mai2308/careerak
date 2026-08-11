import React, { useState } from 'react'
import { register } from '../api'

export default function Signup({ onAuth }){
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student', interests:'', educationLevel:'undergraduate' })
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = []
    if (!form.name || form.name.length < 2) errs.push('Name must be at least 2 characters')
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRe.test(form.email)) errs.push('Enter a valid email')
    if (!form.password || form.password.length < 6) errs.push('Password must be at least 6 characters')
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
      const payload = { ...form, interests: form.interests.split(',').map(s=>s.trim()).filter(Boolean) }
      const res = await register(payload)
      if (res.token){
        onAuth && onAuth({ token: res.token, user: res.user })
      } else {
        setMsg(res.message || 'Registration failed')
      }
    }catch(err){
      setMsg(err.message || 'Network or server error')
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="card">
      <h2>Sign up</h2>
      {errors.length > 0 && (
        <ul style={{color:'crimson'}}>
          {errors.map((e,i)=>(<li key={i}>{e}</li>))}
        </ul>
      )}
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
      <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
      <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
        <option value="student">Student</option>
        <option value="mentor">Mentor</option>
      </select>
      {form.role === 'student' && (
        <select value={form.educationLevel} onChange={e=>setForm({...form,educationLevel:e.target.value})}>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="other">Other</option>
        </select>
      )}
      <input placeholder="Interests (comma separated)" value={form.interests} onChange={e=>setForm({...form,interests:e.target.value})} />
      <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      {msg && <p className="msg" style={{color:'crimson'}}>{msg}</p>}
    </form>
  )
}
