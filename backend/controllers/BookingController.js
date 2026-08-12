const Booking = require('../models/Booking');
const Availability = require('../models/Availability');


// CREATE a booking
const createBooking = async (req, res) => {
  try {
    const { studentId, availabilityId } = req.body;

    if (!studentId || !availabilityId) {
      return res.status(400).json({
        message: 'studentId and availabilityId are required'
      });
    }

    const availability = await Availability.findById(availabilityId);

    if (!availability) {
      return res.status(404).json({
        message: 'Availability slot not found'
      });
    }

    if (availability.status !== 'available') {
      return res.status(409).json({
        message: 'This slot is already booked'
      });
    }

    const existingBooking = await Booking.findOne({
      availabilityId
    });

    if (existingBooking) {
      return res.status(409).json({
        message: 'This slot already has a booking'
      });
    }

    const booking = await Booking.create({
      studentId,
      mentorId: availability.mentorId,
      availabilityId,
      status: 'pending'
    });

    availability.status = 'booked';
    await availability.save();

    res.status(201).json(booking);

  } catch (error) {
    res.status(500).json({
      message: 'Failed to create booking',
      error: error.message
    });
  }
};


// GET bookings for one student
const getStudentBookings = async (req, res) => {
  try {
    const { studentId } = req.params;

    const bookings = await Booking.find({
      studentId
    })
      .populate('mentorId', 'name email')
      .populate('availabilityId')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);

  } catch (error) {
    res.status(500).json({
      message: 'Failed to get student bookings',
      error: error.message
    });
  }
};


// GET bookings for one mentor
const getMentorBookings = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const bookings = await Booking.find({
      mentorId
    })
      .populate('studentId', 'name email')
      .populate('availabilityId')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);

  } catch (error) {
    res.status(500).json({
      message: 'Failed to get mentor bookings',
      error: error.message
    });
  }
};


// CANCEL a booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        message: 'Booking is already cancelled'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    const availability = await Availability.findById(
      booking.availabilityId
    );

    if (availability) {
      availability.status = 'available';
      await availability.save();
    }

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};


module.exports = {
  createBooking,
  getStudentBookings,
  getMentorBookings,
  cancelBooking
};