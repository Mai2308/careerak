const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Note: Replace User model require path with your actual Mongoose User model location
// e.g., const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'careerak-dev-secret';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, interests, educationLevel } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Example user creation logic:
    // const existingUser = await User.findOne({ email });
    // if (existingUser) return res.status(400).json({ message: 'User already exists' });
    // const user = await User.create({ name, email, password, role, interests, educationLevel });

    // Mock response structure (adjust to fit your User model/database execution):
    const mockUser = { id: 'user_id', name, email, role: role || 'student' };
    const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: mockUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Add your authentication logic here

    return res.status(200).json({ message: 'Login endpoint active' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;