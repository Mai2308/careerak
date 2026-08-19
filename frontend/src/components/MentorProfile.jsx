import React, { useState } from 'react'
import { createMentor } from '../api'

export const CATEGORY_FIELDS_MAP = {
  Technology: ['Software Engineering', 'Data Science', 'Cybersecurity', 'IT Support', 'Cloud & DevOps', 'Product Management'],
  Engineering: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Robotics'],
  Medicine: ['General Medicine', 'Nursing', 'Pharmacy', 'Dentistry'],
  Finance: ['Accounting', 'Investment Banking', 'Financial Planning', 'Financial Analysis'],
  Marketing: ['Digital Marketing', 'Brand Management', 'Market Research', 'Content Strategy', 'SEO & Growth'],
  Business: ['Entrepreneurship', 'Human Resources', 'Operations Management', 'Business Strategy', 'Project Management'],
  Architecture: ['Residential Architecture', 'Urban Planning', 'Interior Design'],
  Law: ['Corporate Law', 'Criminal Law', 'Intellectual Property Law'],
  'Design & Creative': ['UX/UI Design', 'Graphic Design', 'Game Design', 'Animation & 3D'],
  Education: ['Academic Coaching', 'Curriculum Design', 'Educational Tech']
}

// Case-insensitive lookup helper
export const getFieldsForCategory = (categoryName) => {
  if (!categoryName) return CATEGORY_FIELDS_MAP.Technology
  if (CATEGORY_FIELDS_MAP[categoryName]) return CATEGORY_FIELDS_MAP[categoryName]

  const matchedKey = Object.keys(CATEGORY_FIELDS_MAP).find(
    (key) => key.toLowerCase() === String(categoryName).toLowerCase()
  )
  return matchedKey ? CATEGORY_FIELDS_MAP[matchedKey] : CATEGORY_FIELDS_MAP.Technology
}

const CATEGORY_OPTIONS = Object.keys(CATEGORY_FIELDS_MAP)

export default function MentorProfile({ initial = null, onSaved }){
  const initialCategory = initial?.category || CATEGORY_OPTIONS[0]
  const initialField = initial?.field || getFieldsForCategory(initialCategory)?.[0] || ''

  const [form, setForm] = useState({
    name: initial?.name || (JSON.parse(sessionStorage.getItem('user')||'null')?.name) || '',
    title: initial?.title || '',
    category: initialCategory,
    field: initialField,
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
        field: form.field,
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

      <label className="field-label">
        <span>Mentor Category</span>
        <select
          value={form.category}
          onChange={e => {
            const newCat = e.target.value
            const defaultField = getFieldsForCategory(newCat)?.[0] || ''
            setForm({ ...form, category: newCat, field: defaultField })
          }}
        >
          {CATEGORY_OPTIONS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </label>

      <label className="field-label">
        <span>Mentor Field</span>
        <select
          value={form.field}
          onChange={e => setForm({ ...form, field: e.target.value })}
        >
          {getFieldsForCategory(form.category).map(fld => (
            <option key={fld} value={fld}>{fld}</option>
          ))}
        </select>
      </label>
      <textarea placeholder="Bio" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} />
      <input placeholder="Skills (comma separated)" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} />
      <input placeholder="Available slots (comma separated)" value={form.availableSlots} onChange={e=>setForm({...form,availableSlots:e.target.value})} />
      <div className="price-input-wrapper">
        <span className="price-currency-tag">EGP</span>
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Session price"
          value={form.sessionPrice}
          onChange={e=>setForm({...form,sessionPrice:e.target.value})}
          className="price-input-field"
        />
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="action" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save profile'}</button>
      </div>
    </form>
  )
}