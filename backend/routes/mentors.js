const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const auth = require('../middleware/auth');

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
    res.json(mentor);
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
