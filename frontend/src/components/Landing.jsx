import React from 'react'

const featureCards = [
  { title: 'Find your fit', text: 'Compare mentors by field, rating and availability in seconds.' },
  { title: 'Book confidently', text: 'Choose a slot, confirm the session and pay online with ease.' },
  { title: 'Grow faster', text: 'Get honest feedback and keep moving toward your next career step.' }
]

export default function Landing({
  onGetStarted,
  onFindMentor,
  onJoinAsMentor,
  onLogin,
  darkMode,
  onToggleDarkMode
}) {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="brand-mark">
          <img src="/logo.png" alt="Careerak Logo" className="logo-image" />
        </div>
        
        <nav>
          <button type="button" className="theme-toggle" onClick={onToggleDarkMode}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button className="link-button" onClick={onLogin}>Log in</button>
          <button className="pill-button" onClick={onGetStarted}>Get started</button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="badge">MENTORSHIP, MADE SIMPLE</span>
          <h1>
            Find the right mentor.<br />
            <span className="accent">Build the right future.</span>
          </h1>
          <p>
            Careerak connects students with trusted professionals in the fields they care about.
            Browse mentors, compare reviews, reserve a slot and start your next chapter with clarity.
          </p>
          <div className="hero-actions">
            <button className="pill-button" onClick={onFindMentor}>Find a mentor</button>
            <button className="pill-button outline" onClick={onJoinAsMentor}>Join as a mentor</button>
          </div>
          <div className="proof-row">
            <div>
              <strong>3k+</strong>
              <span>students matched</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>average rating</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>support</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="mini-card surface-card">
            <span className="mini-label">Top mentor</span>
            <h3>Omar Hassan</h3>
            <p>Product strategy mentor</p>
            <div className="mini-stars">★★★★★</div>
          </div>
          <div className="mini-card gradient-card">
            <span className="mini-label light">This week</span>
            <h3>12 slots open</h3>
            <p>Across design, software and engineering</p>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {featureCards.map((item) => (
          <article key={item.title} className="feature-card">
            <span className="feature-icon">✦</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}