import React from "react";
import "./About.css";

export default function About({ onNavigate, onGoToSignup, isLoggedIn }) {
  return (
    <div className="about-page-container">
      {/* Header Banner */}
      <section className="about-hero surface-panel">
        <span className="about-badge">About Careerak</span>
        <h1>Bridging the Gap Between Learning & Industry</h1>
        <p className="about-hero-sub">
          We empower students to discover their passion, acquire real-world insight, 
          and connect directly with experienced mentors in their dream fields.
        </p>
      </section>

      {/* Core Mission & Vision Grid */}
      <section className="about-grid">
        <div className="surface-panel about-card">
          <div className="about-icon">🎯</div>
          <h3>Our Mission</h3>
          <p>
            To democratize career mentorship by giving every student seamless access 
            to domain experts, customized advice, and clear industry roadmaps.
          </p>
        </div>

        <div className="surface-panel about-card">
          <div className="about-icon">🚀</div>
          <h3>Our Vision</h3>
          <p>
            A world where students step confidently into their professional journeys, 
            backed by guidance, practical knowledge, and direct connections.
          </p>
        </div>

        <div className="surface-panel about-card">
          <div className="about-icon">💡</div>
          <h3>Why We Built This</h3>
          <p>
            Academic studies teach theory, but navigating actual industry dynamics 
            requires hands-on wisdom. Careerak bridges that final crucial step.
          </p>
        </div>
      </section>

      {/* Statistics / Impact Section */}
      <section className="about-stats-panel surface-panel">
        <h2>Careerak at a Glance</h2>
        <div className="about-stats-grid">
          <div className="stat-item">
            <span className="stat-number">10+</span>
            <span className="stat-label">Career Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Verified Mentors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1-on-1</span>
            <span className="stat-label">Personal Sessions</span>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta-panel surface-panel">
        <h2>Ready to start your journey?</h2>
        <p>Explore mentors across software engineering, business, healthcare, design, and more.</p>
        <div className="about-cta-buttons">
          <button 
            type="button" 
            className="pill-button" 
            onClick={() => onNavigate && onNavigate(isLoggedIn ? 'explore' : 'signup')}
          >
            Explore Mentors
          </button>
          {!isLoggedIn && (
            <button 
              type="button" 
              className="secondary-button" 
              style={{ borderRadius: '999px', padding: '12px 24px' }}
              onClick={() => onGoToSignup && onGoToSignup('student')}
            >
              Get Started
            </button>
          )}
        </div>
      </section>
    </div>
  );
}