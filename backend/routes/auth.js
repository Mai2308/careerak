const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'careerak-dev-secret';
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const authAttempts = new Map();

function authRateLimit(req, res, next) {
  const key = `${req.path}:${req.ip || 'unknown'}`;
  const now = Date.now();
  const current = authAttempts.get(key);

  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    authAttempts.set(key, { windowStart: now, count: 1 });
    return next();
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  current.count += 1;
  authAttempts.set(key, current);
  return next();
}

// Register
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { name, email, password, role, interests, educationLevel } = req.body;
    if (!name || typeof email !== 'string' || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email: normalizedEmail,
      password: hash,
      role,
      interests,
      educationLevel,
    });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;