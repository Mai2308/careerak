const express = require('express');
const Mentor = require('../models/Mentor');
const Review = require('../models/Review');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ averageRating: -1, reviewCount: -1 });
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch mentors', error: error.message });
  }
});

router.get('/:mentorId', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    const reviews = await Review.find({ mentorId: mentor._id }).sort({ createdAt: -1 });
    res.json({ mentor, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch mentor details', error: error.message });
  }
});

router.post('/:mentorId/reviews', async (req, res) => {
  try {
    const { reviewerName, rating, comment } = req.body;
    const mentor = await Mentor.findById(req.params.mentorId);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

    const review = new Review({
      mentorId: mentor._id,
      reviewerName,
      rating,
      comment
    });

    await review.save();
    const updatedMentor = await Mentor.calculateRating(mentor._id);

    res.status(201).json({ mentor: updatedMentor, review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, field, sessionPrice } = req.body;
    const mentor = new Mentor({ name, field, sessionPrice });
    await mentor.save();
    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create mentor', error: error.message });
  }
});

module.exports = router;
