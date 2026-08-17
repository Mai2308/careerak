const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const Review = require('../models/Review');
const User = require('../models/User');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Get all reviews for a mentor (mentorId is the mentor's User _id)
router.get('/:mentorId/reviews', async (req, res) => {
  try{
    const reviews = await Review.find({ mentorId: req.params.mentorId }).sort({ createdAt: -1 });
    res.json(reviews);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a review for a mentor (student must be authenticated and have booked this mentor)
router.post('/:mentorId/reviews', auth, async (req, res) => {
  try{
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    if (!comment) return res.status(400).json({ message: 'Comment is required' });

    const mentorUser = await User.findOne({ _id: req.params.mentorId, role: 'mentor' });
    if (!mentorUser) return res.status(404).json({ message: 'Mentor not found' });

    const hasBooked = await Booking.findOne({
      studentId: req.user._id,
      mentorId: req.params.mentorId,
      status: { $in: ['confirmed', 'completed'] }
    });
    if (!hasBooked) return res.status(403).json({ message: 'You can only review a mentor after booking a session with them' });

    const review = await Review.create({
      mentorId: req.params.mentorId,
      reviewerName: req.user.name,
      rating,
      comment
    });

    res.status(201).json(review);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update mentor profile for authenticated user
router.post('/', auth, async (req, res) => {
  try{
    const { name, title, bio, skills, availableSlots } = req.body;
    const data = { name, title, bio, skills, availableSlots, email: req.user.email, userId: req.user._id };
    let mentor = await Mentor.findOne({ userId: req.user._id });
    if (mentor){
      Object.assign(mentor, data);
      await mentor.save();
    }else{
      mentor = new Mentor(data);
      await mentor.save();
    }
    res.json(mentor);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's mentor profile
router.get('/me', auth, async (req, res) => {
  try{
    const mentor = await Mentor.findOne({ userId: req.user._id });
    if (!mentor) return res.status(404).json({ message: 'Mentor profile not found' });
    const merged = mentor.toObject();
    merged.rating = req.user.rating || 0;
    merged.reviewCount = req.user.reviewCount || 0;
    res.json(merged);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List mentors
router.get('/', async (req, res) => {
  try{
    const mentors = await Mentor.find().limit(50).lean();
    res.json(mentors);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mentor by id
router.get('/:id', async (req, res) => {
  try{
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.json(mentor);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
