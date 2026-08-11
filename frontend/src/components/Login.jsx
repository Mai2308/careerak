import React, { useState } from 'react'
import { login } from '../api'

export default function Login({ onAuth }){
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
      setMsg('Network or server error')
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="card">
      <h2>Log in</h2>
      {errors.length > 0 && (
        <ul style={{color:'crimson'}}>
          {errors.map((e,i)=>(<li key={i}>{e}</li>))}
        </ul>
      )}
      <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
      <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
      {msg && <p className="msg" style={{color:'crimson'}}>{msg}</p>}
    </form>
  )
}
