const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
