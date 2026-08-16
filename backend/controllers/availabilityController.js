const Availability = require('../models/Availability');

// CREATE a new availability slot
const createAvailability = async (req, res) => {
  try {
    const { mentorId, date, startTime, endTime } = req.body;

    // Check required fields
    if (!mentorId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: 'mentorId, date, startTime and endTime are required'
      });
    }

    // Check that end time is after start time
    if (endTime <= startTime) {
      return res.status(400).json({
        message: 'End time must be after start time'
      });
    }

    const availability = await Availability.create({
      mentorId,
      date,
      startTime,
      endTime
    });

    res.status(201).json(availability);

  } catch (error) {
    res.status(500).json({
      message: 'Failed to create availability',
      error: error.message
    });
  }
};


// GET all availability slots for one mentor
const getMentorAvailability = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const slots = await Availability.find({
      mentorId
    }).sort({
      date: 1,
      startTime: 1
    });

    res.status(200).json(slots);

  } catch (error) {
    res.status(500).json({
      message: 'Failed to get availability',
      error: error.message
    });
  }
};


// DELETE an availability slot
const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const slot = await Availability.findById(id);

    if (!slot) {
      return res.status(404).json({
        message: 'Availability slot not found'
      });
    }

    if (slot.status === 'booked') {
      return res.status(400).json({
        message: 'A booked slot cannot be deleted'
      });
    }

    await slot.deleteOne();

    res.status(200).json({
      message: 'Availability slot deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete availability',
      error: error.message
    });
  }
};


module.exports = {
  createAvailability,
  getMentorAvailability,
  deleteAvailability
};