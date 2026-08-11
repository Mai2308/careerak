const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  field: { type: String, required: true },
  sessionPrice: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  recommendedPercent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

MentorSchema.statics.calculateRating = async function (mentorId) {
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

module.exports = mongoose.model('Mentor', MentorSchema);
