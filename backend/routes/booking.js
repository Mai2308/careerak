const express = require('express');
const router = express.Router();

const {
  createMockPayment,
  createBooking,
  getStudentBookings,
  getMentorBookings,
  cancelBooking
} = require('../controllers/BookingController');


// Mock payment before booking is created
router.post('/mock-payment', createMockPayment);


// Create a new booking
router.post('/', createBooking);


// Get all bookings for one student
router.get('/student/:studentId', getStudentBookings);


// Get all bookings for one mentor
router.get('/mentor/:mentorId', getMentorBookings);


// Cancel a booking
router.patch('/:id/cancel', cancelBooking);


module.exports = router;