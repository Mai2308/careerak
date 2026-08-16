const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' })
      .select('name email interests educationLevel rating')
      .sort({ name: 1 })
      .lean();

    res.status(200).json(mentors.map((mentor) => ({
      id: mentor._id,
      _id: mentor._id,
      name: mentor.name,
      email: mentor.email,
      interests: mentor.interests || [],
      educationLevel: mentor.educationLevel || 'undergraduate',
      rating: mentor.rating || 0
    })));
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get mentors',
      error: error.message
    });
  }
});

module.exports = router;
