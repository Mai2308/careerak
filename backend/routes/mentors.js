const express = require('express')
const router = express.Router()

const Mentor = require('../models/Mentor')
const Review = require('../models/Review')
const User = require('../models/User')
const Booking = require('../models/Booking')
const auth = require('../middleware/auth')

// =====================================================
// GET ALL REVIEWS FOR A MENTOR
// =====================================================
// mentorId is the mentor's User _id
router.get('/:mentorId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({
      mentorId: req.params.mentorId
    }).sort({ createdAt: -1 })

    res.json(reviews)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Server error'
    })
  }
})

// =====================================================
// SUBMIT A REVIEW FOR A MENTOR
// =====================================================
router.post('/:mentorId/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      })
    }

    if (!comment) {
      return res.status(400).json({
        message: 'Comment is required'
      })
    }

    const mentorUser = await User.findOne({
      _id: req.params.mentorId,
      role: 'mentor'
    })

    if (!mentorUser) {
      return res.status(404).json({
        message: 'Mentor not found'
      })
    }

    const hasBooked = await Booking.findOne({
      studentId: req.user._id,
      mentorId: req.params.mentorId,
      status: {
        $in: ['confirmed', 'completed']
      }
    })

    if (!hasBooked) {
      return res.status(403).json({
        message: 'You can only review a mentor after booking a session with them'
      })
    }

    const review = await Review.create({
      mentorId: req.params.mentorId,
      reviewerName: req.user.name,
      rating,
      comment
    })

    res.status(201).json(review)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Server error'
    })
  }
})

// =====================================================
// CREATE OR UPDATE MENTOR PROFILE
// =====================================================
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      title,
      bio,
      skills,
      category,
      field,
      availableSlots,
      sessionPrice,
      currency = 'EGP'
    } = req.body

    const numericPrice = Number(sessionPrice)

    if (
      sessionPrice !== undefined &&
      sessionPrice !== '' &&
      (!Number.isFinite(numericPrice) || numericPrice <= 0)
    ) {
      return res.status(400).json({
        message: 'Session price must be a positive number'
      })
    }

    const interestList = []

    if (field) {
      interestList.push(field)
    }

    if (category) {
      interestList.push(category)
    }

    const normalizedCurrency = (currency || 'EGP').toUpperCase()

    const data = {
      name,
      title,
      bio,
      skills,
      category,
      field,
      interests: interestList,
      availableSlots,
      sessionPrice: numericPrice || 0,
      currency: normalizedCurrency,
      email: req.user.email,
      userId: req.user._id
    }

    // Keep basic mentor information on User as well.
    // Category/field are primarily stored in Mentor.
    const userUpdate = {
      sessionPrice: numericPrice || 0,
      currency: normalizedCurrency
    }

    if (category) {
      userUpdate.category = category
    }

    if (field) {
      userUpdate.fieldName = field
    }

    if (interestList.length > 0) {
      userUpdate.interests = interestList
    }

    await User.findByIdAndUpdate(
      req.user._id,
      userUpdate
    )

    let mentor = await Mentor.findOne({
      userId: req.user._id
    })

    if (mentor) {
      Object.assign(mentor, data)
      await mentor.save()
    } else {
      mentor = new Mentor(data)
      await mentor.save()
    }

    res.json(mentor)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error'
    })
  }
})

// =====================================================
// GET CURRENT USER'S MENTOR PROFILE
// =====================================================
router.get('/me', auth, async (req, res) => {
  try {
    const mentor = await Mentor.findOne({
      userId: req.user._id
    })

    if (!mentor) {
      return res.status(404).json({
        message: 'Mentor profile not found'
      })
    }

    const merged = mentor.toObject()

    merged.rating = req.user.rating || 0
    merged.reviewCount = req.user.reviewCount || 0

    res.json(merged)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error'
    })
  }
})

// =====================================================
// UPDATE CURRENT USER'S MENTOR PROFILE
// =====================================================
// Used by Profile.jsx when a mentor changes
// their category, field, or name.
router.put('/me', auth, async (req, res) => {
  try {
    const mentor = await Mentor.findOne({
      userId: req.user._id
    })

    if (!mentor) {
      return res.status(404).json({
        message: 'Mentor profile not found'
      })
    }

    const {
      name,
      category,
      field
    } = req.body

    // Only update values that were actually provided.
    if (name !== undefined) {
      mentor.name = name
    }

    if (category !== undefined) {
      mentor.category = category
    }

    if (field !== undefined) {
      mentor.field = field
    }

    // Keep interests synchronized with category + field.
    mentor.interests = []

    if (mentor.field) {
      mentor.interests.push(mentor.field)
    }

    if (mentor.category) {
      mentor.interests.push(mentor.category)
    }

    await mentor.save()

    // Keep the User name/category information synchronized too.
    const userUpdate = {}

    if (name !== undefined) {
      userUpdate.name = name
    }

    if (category !== undefined) {
      userUpdate.category = category
    }

    if (field !== undefined) {
      userUpdate.fieldName = field
    }

    if (mentor.interests.length > 0) {
      userUpdate.interests = mentor.interests
    }

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(
        req.user._id,
        userUpdate
      )
    }

    res.json(mentor)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error'
    })
  }
})

// =====================================================
// LIST MENTORS
// =====================================================
router.get('/', async (req, res) => {
  try {
    const mentors = await Mentor.find()
      .limit(50)
      .lean()

    res.json(mentors)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error'
    })
  }
})

// =====================================================
// GET MENTOR BY ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)

    if (!mentor) {
      return res.status(404).json({
        message: 'Mentor not found'
      })
    }

    res.json(mentor)
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: 'Server error'
    })
  }
})

module.exports = router