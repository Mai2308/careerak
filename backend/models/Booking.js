const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    availabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Availability',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },

    amount: {
      type: Number,
      default: 0
    },

    currency: {
      type: String,
      default: 'INR'
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid'
    },

    paymentReference: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);