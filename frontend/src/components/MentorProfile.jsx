import React, { useState } from 'react'
import { createMentor } from '../api'

export default function MentorProfile({ initial = null, onSaved }){
  const [form, setForm] = useState({
    name: initial?.name || (JSON.parse(sessionStorage.getItem('user')||'null')?.name) || '',
    title: initial?.title || '',
    bio: initial?.bio || '',
    skills: (initial?.skills || []).join(', '),
    availableSlots: (initial?.availableSlots || []).join(', ')
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const submit = async e => {
    e && e.preventDefault()
    setMsg(null)
    setLoading(true)
    try{
      const payload = {
        name: form.name,
        title: form.title,
        bio: form.bio,
        skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean),
        availableSlots: form.availableSlots.split(',').map(s=>s.trim()).filter(Boolean)
      }
      const res = await createMentor(payload)
      onSaved && onSaved(res)
      setMsg('Profile saved')
    }catch(err){
      setMsg(err.message || 'Save failed')
    }finally{setLoading(false)}
  }

  return (
    <form onSubmit={submit} className="card">
      <h2>{initial ? 'Edit profile' : 'Create mentor profile'}</h2>
      {msg && <p style={{color: msg.includes('failed') ? 'crimson' : 'green'}}>{msg}</p>}
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
      <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
      <textarea placeholder="Bio" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} />
      <input placeholder="Skills (comma separated)" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} />
      <input placeholder="Available slots (comma separated)" value={form.availableSlots} onChange={e=>setForm({...form,availableSlots:e.target.value})} />
      <div style={{display:'flex',gap:8}}>
        <button className="action" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save profile'}</button>
      </div>
    </form>
  )
}
