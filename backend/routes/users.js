const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Field = require('../models/Field');

// Get the logged-in user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get the logged-in user's field interests
router.get('/me/interests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'interestedFields',
      populate: { path: 'category' }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ interestedFields: user.interestedFields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set (replace) the logged-in user's field interests
router.put('/me/interests', auth, async (req, res) => {
  try {
    const { fieldIds } = req.body;
    if (!Array.isArray(fieldIds)) return res.status(400).json({ message: 'fieldIds must be an array' });

    const uniqueFieldIds = Array.from(new Set(fieldIds.map(String)));
    const validFields = await Field.find({ _id: { $in: uniqueFieldIds } });
    if (validFields.length !== uniqueFieldIds.length) {
      return res.status(400).json({ message: 'One or more fields are invalid' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { interestedFields: uniqueFieldIds },
      { new: true }
    ).populate({ path: 'interestedFields', populate: { path: 'category' } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ interestedFields: user.interestedFields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
