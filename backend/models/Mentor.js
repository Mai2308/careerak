const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  title: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  availableSlots: { type: [String], default: [] },
  bookings: { type: [{ slot: String, studentName: String, paymentMethod: String, cardLast4: String, walletProvider: String, status: String }], default: [] },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  recommendedPercent: { type: Number, default: 0 }
}, { timestamps: true });

mentorSchema.statics.calculateRating = async function (mentorId) {
  const Review = require('./Review');
  const reviews = await Review.find({ mentorId });
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;
  const recommendedPercent = reviewCount
    ? Math.round((reviews.filter((review) => review.rating >= 4).length / reviewCount) * 100)
    : 0;

  return this.findByIdAndUpdate(
    mentorId,
    {
      averageRating: Number(averageRating.toFixed(2)),
      reviewCount,
      recommendedPercent
    },
    { new: true }
  );
};

module.exports = mongoose.model('Mentor', mentorSchema);
