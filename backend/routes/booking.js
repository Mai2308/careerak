const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authenticateToken = require('../middleware/auth');

// GET /api/bookings - Fetch bookings for the logged-in user (student)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'mentor' ? { mentor: req.user._id } : { student: req.user._id };
    const bookings = await Booking.find(filter)
      .populate('mentor', 'name email rating')
      .populate('student', 'name email educationLevel')
      .sort({ date: 1 });

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

// POST /api/bookings - Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { mentor, mentorName, title, date, duration, notes } = req.body;

    if (!mentorName || !title || !date) {
      return res.status(400).json({ message: 'mentorName, title, and date are required fields' });
    }

    const booking = new Booking({
      student: req.user._id,
      mentor: mentor || null,
      mentorName,
      title,
      date: new Date(date),
      duration: duration || 60,
      notes: notes || ''
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Server error creating booking' });
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('mentor', 'name email rating')
      .populate('student', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.student._id.toString() !== req.user._id.toString() &&
      booking.mentor?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking details:', err);
    res.status(500).json({ message: 'Server error fetching booking details' });
  }
});

// PATCH /api/bookings/:id/cancel - Cancel a booking
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.student.toString() !== req.user._id.toString() &&
      booking.mentor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
});

module.exports = router;
