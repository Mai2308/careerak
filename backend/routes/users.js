const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const Field = require('../models/Field');

// Get all mentors (public)
router.get('/mentors', async (req, res) => {
  try {
    const userMentors = await User.find({ role: 'mentor' })
      .select('name email interests educationLevel rating sessionPrice currency category')
      .sort({ name: 1 })
      .lean();

    const mentorProfiles = await Mentor.find().lean();
    const profileMap = new Map(mentorProfiles.map((m) => [m.userId?.toString(), m]));

    res.status(200).json(userMentors.map((mentor) => {
      const p = profileMap.get(mentor._id.toString());
      const cat = mentor.category || p?.category || (mentor.interests?.[0]) || (p?.interests?.[0]) || 'Technology';
      const fld = mentor.fieldName || p?.field || (mentor.interests?.[1]) || (p?.interests?.[1]) || '';
      const interestsList = (mentor.interests && mentor.interests.length > 0)
        ? mentor.interests
        : (p?.interests && p.interests.length > 0)
          ? p.interests
          : [cat, fld].filter(Boolean);

      return {
        id: mentor._id,
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        title: p?.title || 'Mentor',
        bio: p?.bio || '',
        skills: p?.skills || [],
        category: cat,
        field: fld,
        interests: interestsList,
        educationLevel: mentor.educationLevel || 'undergraduate',
        rating: mentor.rating || p?.averageRating || 0,
        sessionPrice: mentor.sessionPrice || p?.sessionPrice || 0,
        currency: mentor.currency || p?.currency || 'EGP'
      };
    }));
  } catch (error) {
    res.status(500).json({ message: 'Failed to get mentors', error: error.message });
  }
});

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

// Update logged-in user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, educationLevel, category, field, interests } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name && name.trim()) user.name = name.trim();
    if (educationLevel) user.educationLevel = educationLevel;
    if (category) user.category = category;
    if (field) user.fieldName = field;

    const interestList = [];
    if (field) interestList.push(field);
    if (category) interestList.push(category);
    if (Array.isArray(interests)) interestList.push(...interests);
    if (interestList.length > 0) user.interests = Array.from(new Set(interestList));

    await user.save();

    // If user is a mentor, sync name, category, field, and interests to Mentor profile
    if (user.role === 'mentor') {
      const updateData = {};
      if (name) updateData.name = user.name;
      if (category) updateData.category = category;
      if (field) updateData.field = field;
      if (interestList.length > 0) updateData.interests = user.interests;
      await Mentor.findOneAndUpdate({ userId: user._id }, updateData, { upsert: false });
    }

    res.json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        educationLevel: user.educationLevel,
        category: user.category,
        field: user.fieldName,
        interests: user.interests
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Change password
router.put('/me/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Delete account
router.delete('/me', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'mentor') {
      await Mentor.findOneAndDelete({ userId: req.userId });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

module.exports = router;