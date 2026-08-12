const express = require('express');
const router = express.Router();

const {
  createBooking,
  getStudentBookings,
  getMentorBookings,
  cancelBooking
} = require('../controllers/bookingController');


// Create a new booking
router.post('/', createBooking);


// Get all bookings for one student
router.get('/student/:studentId', getStudentBookings);


// Get all bookings for one mentor
router.get('/mentor/:mentorId', getMentorBookings);


// Cancel a booking
router.patch('/:id/cancel', cancelBooking);


module.exports = router;