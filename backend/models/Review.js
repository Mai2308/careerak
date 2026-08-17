const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.post('save', async function () {
  const User = require('./User');
  await User.recalculateRating(this.mentorId);
});

module.exports = mongoose.model('Review', ReviewSchema);
