const express = require('express');
const router = express.Router();

const {
  createAvailability,
  getMentorAvailability,
  deleteAvailability
} = require('../controllers/availabilityController');


// Create a new availability slot
router.post('/', createAvailability);


// Get all availability slots for one mentor
router.get('/mentor/:mentorId', getMentorAvailability);


// Delete an availability slot
router.delete('/:id', deleteAvailability);


module.exports = router;