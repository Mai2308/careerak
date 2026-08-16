const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');
const Field = require('../models/Field');
const User = require('../models/User');
const Availability = require('../models/Availability');

// List all career categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List fields belonging to a category
router.get('/categories/:categoryId/fields', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const fields = await Field.find({ category: category._id }).sort({ name: 1 });
    res.json({ category, fields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all fields (flat), grouped-by-category on the client, e.g. for interest selection
router.get('/fields', auth, async (req, res) => {
  try {
    const fields = await Field.find().populate('category').sort({ name: 1 });
    res.json({ fields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find mentors (with available sessions) teaching any of the given field ids
async function findMentorsForFields(fieldIds) {
  const mentors = await User.find({ role: 'mentor', field: { $in: fieldIds } })
    .select('name rating interests educationLevel field')
    .populate('field');

  const mentorIds = mentors.map(m => m._id);
  const availability = await Availability.find({
    mentor: { $in: mentorIds },
    isBooked: false,
    date: { $gte: new Date() }
  }).sort({ date: 1 });

  const sessionsByMentorId = availability.reduce((acc, a) => {
    const key = String(a.mentor);
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return mentors.map(mentor => ({
    ...mentor.toObject(),
    availableSessions: sessionsByMentorId[String(mentor._id)] || []
  }));
}

// Recommended mentors/sessions based on the logged-in student's chosen interests
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.interestedFields || user.interestedFields.length === 0) {
      return res.json({ mentors: [], message: 'Choose some fields of interest to get personalized recommendations.' });
    }

    const mentors = await findMentorsForFields(user.interestedFields);
    if (mentors.length === 0) {
      return res.json({ mentors: [], message: 'No mentors are currently available in your fields of interest.' });
    }

    res.json({ mentors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List mentors and available sessions for a field, with suggestions if none found
router.get('/fields/:fieldId/mentors', auth, async (req, res) => {
  try {
    const field = await Field.findById(req.params.fieldId).populate('category');
    if (!field) return res.status(404).json({ message: 'Field not found' });

    const mentors = await findMentorsForFields([field._id]);

    if (mentors.length === 0) {
      const relatedFields = await Field.find({ category: field.category._id, _id: { $ne: field._id } });
      const relatedFieldIds = relatedFields.map(f => f._id);
      const suggestions = relatedFieldIds.length
        ? await User.distinct('field', { role: 'mentor', field: { $in: relatedFieldIds } })
        : [];
      const suggestedFields = await Field.find({ _id: { $in: suggestions } });
      return res.json({
        field,
        mentors: [],
        message: 'No mentors are currently available in this field.',
        suggestions: suggestedFields
      });
    }

    res.json({ field, mentors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
