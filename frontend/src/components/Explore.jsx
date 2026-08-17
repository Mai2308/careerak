import React, { useEffect, useState } from 'react'
import { getCategories, getFieldsByCategory, getMentorsByField } from '../api'

export default function Explore({ onBack }){
  const [step, setStep] = useState('categories') // categories | fields | mentors
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [mentors, setMentors] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [notice, setNotice] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let cancelled = false
    async function load(){
      setLoading(true)
      setMsg(null)
      try{
        const res = await getCategories()
        if (!cancelled) setCategories(res.categories || [])
      }catch(err){
        if (!cancelled) setMsg(err.message || 'Failed to load categories')
      }finally{
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return ()=>{ cancelled = true }
  },[])

  const openCategory = async (category) => {
    setSelectedCategory(category)
    setLoading(true)
    setMsg(null)
    try{
      const res = await getFieldsByCategory(category._id)
      setFields(res.fields || [])
      setStep('fields')
    }catch(err){
      setMsg(err.message || 'Failed to load fields')
    }finally{ setLoading(false) }
  }

  const openField = async (field) => {
    setSelectedField(field)
    setLoading(true)
    setMsg(null)
    setNotice(null)
    setSuggestions([])
    try{
      const res = await getMentorsByField(field._id)
      setMentors(res.mentors || [])
      if (res.message) setNotice(res.message)
      if (res.suggestions) setSuggestions(res.suggestions)
      setStep('mentors')
    }catch(err){
      setMsg(err.message || 'Failed to load mentors')
    }finally{ setLoading(false) }
  }

  const backToCategories = () => {
    setStep('categories')
    setSelectedCategory(null)
    setFields([])
  }

  const backToFields = () => {
    setStep('fields')
    setSelectedField(null)
    setMentors([])
    setNotice(null)
    setSuggestions([])
  }

  return (
    <div className="card">
      <h2>Explore Categories</h2>
      <button onClick={onBack}>Back to Dashboard</button>
      {msg && <p className="msg">{msg}</p>}
      {loading && <p>Loading...</p>}

      {!loading && step === 'categories' && (
        <div>
          <p>Browse career categories:</p>
          <ul>
            {categories.map(cat => (
              <li key={cat._id}>
                <button onClick={()=>openCategory(cat)}>{cat.name}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && step === 'fields' && (
        <div>
          <button onClick={backToCategories}>&larr; Categories</button>
          <h3>{selectedCategory?.name} fields</h3>
          <ul>
            {fields.map(f => (
              <li key={f._id}>
                <button onClick={()=>openField(f)}>{f.name}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && step === 'mentors' && (
        <div>
          <button onClick={backToFields}>&larr; Fields</button>
          <h3>Mentors in {selectedField?.name}</h3>
          {notice && <p>{notice}</p>}
          {mentors.length === 0 && suggestions.length > 0 && (
            <div>
              <p>You might be interested in these related fields instead:</p>
              <ul>
                {suggestions.map(f => (
                  <li key={f._id}>
                    <button onClick={()=>openField(f)}>{f.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mentors.length > 0 && (
            <ul>
              {mentors.map(m => (
                <li key={m._id}>
                  <strong>{m.name}</strong> — Rating: {m.rating}
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
