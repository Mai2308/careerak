const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  title: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  availableSlots: { type: [String], default: [] },
  bookings: { type: [{ slot: String, studentName: String, paymentMethod: String, cardLast4: String, walletProvider: String, status: String }], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Mentor', mentorSchema);
