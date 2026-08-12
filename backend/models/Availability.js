const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  isBooked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
