import React, { useEffect, useState } from 'react'
import { getAllFields, getMyInterests, saveMyInterests, getRecommendations } from '../api'

export default function Interests({ onBack }){
  const [fields, setFields] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [recommendations, setRecommendations] = useState(null)
  const [recNotice, setRecNotice] = useState(null)
  const [msg, setMsg] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    let cancelled = false
    async function load(){
      setLoading(true)
      setMsg(null)
      try{
        const [fieldsRes, interestsRes] = await Promise.all([getAllFields(), getMyInterests()])
        if (cancelled) return
        setFields(fieldsRes.fields || [])
        const ids = (interestsRes.interestedFields || []).map(f => f._id)
        setSelectedIds(new Set(ids))
      }catch(err){
        if (!cancelled) setMsg(err.message || 'Failed to load fields')
      }finally{
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[])

  const toggleField = (id) => {
    setSaved(false)
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const confirm = async () => {
    setSaving(true)
    setMsg(null)
    setSaved(false)
    try{
      await saveMyInterests(Array.from(selectedIds))
      setSaved(true)
      const recRes = await getRecommendations()
      setRecommendations(recRes.mentors || [])
      setRecNotice(recRes.message || null)
    }catch(err){
      setMsg(err.message || 'Failed to save interests')
    }finally{ setSaving(false) }
  }

  const fieldsByCategory = fields.reduce((acc, f) => {
    const catName = f.category?.name || 'Other'
    if (!acc[catName]) acc[catName] = []
    acc[catName].push(f)
    return acc
  }, {})

  return (
    <div className="card">
      <h2>Choose Fields of Interest</h2>
      <button onClick={onBack}>Back to Profile</button>
      {loading && <p>Loading fields...</p>}
      {msg && <p className="msg" style={{color:'crimson'}}>{msg}</p>}

      {!loading && (
        <div>
          <p>Select one or more fields, then confirm. You can change these anytime.</p>
          {Object.entries(fieldsByCategory).map(([catName, catFields]) => (
            <div key={catName}>
              <h4>{catName}</h4>
              {catFields.map(f => (
                <label key={f._id} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(f._id)}
                    onChange={()=>toggleField(f._id)}
                  />
                  {' '}{f.name}
                </label>
              ))}
            </div>
          ))}
          <button onClick={confirm} disabled={saving}>{saving ? 'Saving...' : 'Confirm Interests'}</button>
          {saved && <p style={{color:'green'}}>Your interests have been saved.</p>}
        </div>
      )}

      {recommendations !== null && (
        <div>
          <h3>Recommended Mentors</h3>
          {recNotice && <p>{recNotice}</p>}
          {recommendations.length > 0 && (
            <ul>
              {recommendations.map(m => (
                <li key={m._id}>
                  <strong>{m.name}</strong> — {m.field?.name} — Rating: {m.rating}
                  {m.availableSessions && m.availableSessions.length > 0 ? (
                    <ul>
                      {m.availableSessions.map(s => (
                        <li key={s._id}>{new Date(s.date).toLocaleString()} ({s.duration} min)</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No upcoming sessions available.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
