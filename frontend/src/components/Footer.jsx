import React from "react";
import "./Footer.css";

function Footer({ onNavigate, onGoToSignup }) {
  const handleNav = (targetView) => (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate(targetView);
  };

  const handleSignup = (role) => (e) => {
    e.preventDefault();
    if (onGoToSignup) onGoToSignup(role);
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <h2>Careerak</h2>
          <p>
            Connecting students with mentors to gain real-world
            experience and discover their future careers.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="#" onClick={handleNav('landing')}>Home</a>
          <a href="#" onClick={handleNav('explore')}>Categories</a>
          <a href="#" onClick={handleNav('explore')}>Explore Mentors</a>
          <a href="#" onClick={handleNav('about')}>About Us</a>
        </div>

        {/* Students */}
        <div className="footer-section">
          <h3>For Students</h3>
          <a href="#" onClick={handleNav('explore')}>Explore Fields</a>
          <a href="#" onClick={handleNav('explore')}>Find a Mentor</a>
          <a href="#" onClick={handleSignup('student')}>Create Account</a>
        </div>

        {/* Mentors */}
        <div className="footer-section">
          <h3>For Mentors</h3>
          <a href="#" onClick={handleSignup('mentor')}>Become a Mentor</a>
          <a href="#" onClick={handleNav('login')}>Mentor Login</a>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 Careerak. All rights reserved.</p>

        <div className="footer-legal">
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;