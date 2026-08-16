const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');

// Get bookings for the logged-in student
router.get('/mine', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.userId })
      .populate('mentor', 'name')
      .sort({ date: -1 });
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
