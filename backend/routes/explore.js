const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');
const Field = require('../models/Field');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Mentor = require('../models/Mentor');

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

// List all fields (flat), grouped-by-category on the client
router.get('/fields', auth, async (req, res) => {
  try {
    const fields = await Field.find().populate('category').sort({ name: 1 });
    res.json({ fields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find mentors teaching any of the given field ids or matching category/field name exactly
async function findMentorsForFields(fieldIds) {
  const fields = await Field.find({ _id: { $in: fieldIds } }).populate('category');
  const fieldNames = fields.map(f => f.name);
  const categoryNames = fields.map(f => f.category?.name).filter(Boolean);

  const searchTerms = [...fieldNames, ...categoryNames];
  const regexes = searchTerms.map(term => new RegExp(`^${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'));

  // Query User collection for mentors matching this specific field/category
  const userMentors = await User.find({
    role: 'mentor',
    $or: [
      { field: { $in: fieldIds } },
      { fieldName: { $in: [...fieldNames, ...regexes] } },
      { interests: { $elemMatch: { $in: [...fieldNames, ...regexes] } } }
    ]
  }).select('name email rating interests category fieldName educationLevel sessionPrice currency');

  // Also query Mentor collection
  const mentorDocs = await Mentor.find({
    $or: [
      { field: { $in: [...fieldNames, ...regexes] } },
      { interests: { $elemMatch: { $in: [...fieldNames, ...regexes] } } }
    ]
  });

  const mentorUserIds = mentorDocs.map(m => m.userId).filter(Boolean);
  const extraUserMentors = await User.find({
    _id: { $in: mentorUserIds },
    role: 'mentor'
  }).select('name email rating interests category fieldName educationLevel sessionPrice currency');

  // Combine unique mentors
  const mentorMap = new Map();
  for (const m of [...userMentors, ...extraUserMentors]) {
    mentorMap.set(m._id.toString(), m);
  }

  const matchingMentors = Array.from(mentorMap.values());
  if (matchingMentors.length === 0) {
    return [];
  }

  const mentorIds = matchingMentors.map(m => m._id);
  const mentorProfiles = await Mentor.find({ userId: { $in: mentorIds } });
  const profileMap = new Map(mentorProfiles.map(p => [p.userId?.toString(), p]));

  return matchingMentors.map(mentor => {
    const p = profileMap.get(mentor._id.toString());
    const slots = p?.availableSlots || [];
    const availableSessions = slots.map((d, i) => ({
      _id: `${mentor._id}-slot-${i}`,
      date: d,
      duration: 45
    }));

    return {
      _id: mentor._id,
      id: mentor._id,
      name: mentor.name,
      rating: mentor.rating || p?.rating || 4.9,
      category: mentor.category || p?.category || 'Technology',
      field: mentor.fieldName || p?.field || '',
      interests: mentor.interests || p?.interests || [],
      sessionPrice: mentor.sessionPrice || p?.sessionPrice || 0,
      currency: mentor.currency || p?.currency || 'EGP',
      availableSessions
    };
  });
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
      return res.json({
        field,
        mentors: [],
        message: 'No mentors are currently available in this field.',
        suggestions: relatedFields
      });
    }

    res.json({ field, mentors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
