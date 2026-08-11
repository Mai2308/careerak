const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student','mentor'], default: 'student' },
  interests: { type: [String], default: [] },
  educationLevel: { type: String, enum: ['undergraduate','graduate','other'], default: 'undergraduate' },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
