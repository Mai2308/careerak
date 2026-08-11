import React from 'react'

export default function Dashboard({ user }){
  return (
    <div className="card">
      <h2>Welcome, {user.name}</h2>
      <p>Role: {user.role}</p>
      <p>Email: {user.email}</p>
      <p>This is a placeholder dashboard. Next: mentor listing, booking, payments.</p>
    </div>
  )
}
