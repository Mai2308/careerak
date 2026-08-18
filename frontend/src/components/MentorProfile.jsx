import React, { useState } from 'react'
import { createMentor } from '../api'

const CATEGORY_OPTIONS = [
  'Technology',
  'Business & Finance',
  'Design & Creative',
  'Marketing',
  'Engineering',
  'Health & Science',
  'Education'
]

export default function MentorProfile({ initial = null, onSaved }){
  const [form, setForm] = useState({
    name: initial?.name || (JSON.parse(sessionStorage.getItem('user')||'null')?.name) || '',
    title: initial?.title || '',
    category: initial?.category || CATEGORY_OPTIONS[0],
    bio: initial?.bio || '',
    skills: (initial?.skills || []).join(', '),
    availableSlots: (initial?.availableSlots || []).join(', '),
    sessionPrice: initial?.sessionPrice ?? ''
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const submit = async e => {
    e && e.preventDefault()
    setMsg(null)
    setLoading(true)
    try{
      const numericPrice = Number(form.sessionPrice)
      if (form.sessionPrice !== '' && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
        setMsg('Session price must be a positive number')
        return
      }

      const payload = {
        name: form.name,
        title: form.title,
        category: form.category,
        bio: form.bio,
        skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean),
        availableSlots: form.availableSlots.split(',').map(s=>s.trim()).filter(Boolean),
        sessionPrice: numericPrice || 0,
        currency: 'EGP'
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

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontWeight: 600, color: 'var(--slate-700)' }}>
        <span>Mentor Category</span>
        <select
          value={form.category}
          onChange={e=>setForm({...form,category:e.target.value})}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--slate-200)', fontSize: 15 }}
        >
          {CATEGORY_OPTIONS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>
      <textarea placeholder="Bio" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} />
      <input placeholder="Skills (comma separated)" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} />
      <input placeholder="Available slots (comma separated)" value={form.availableSlots} onChange={e=>setForm({...form,availableSlots:e.target.value})} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #dfe7ee', borderRadius: 8, padding: '10px 12px', background: '#f8fbff' }}>
        <span style={{ fontWeight: 700, color: '#0e7a6a' }}>EGP</span>
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Session price"
          value={form.sessionPrice}
          onChange={e=>setForm({...form,sessionPrice:e.target.value})}
          style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 16, outline: 'none' }}
        />
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="action" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save profile'}</button>
      </div>
    </form>
  )
}
