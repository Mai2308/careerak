require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { createMentorDocument, createBookingDocument } = require('./models');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'careerak';

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment. Copy .env.example to .env and set your Atlas URI.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const client = new MongoClient(MONGODB_URI);
let db;
let mentorsCollection;
let bookingsCollection;

const seedMentors = [
  {
    name: 'Aisha Patel',
    title: 'Senior Software Engineer',
    expertiseFields: ['Computer Science', 'Engineering'],
    experienceYears: 8,
    rating: 4.9,
    price: 55,
    skills: ['System Design', 'Backend Architecture', 'Career Coaching'],
    bio: 'Helps students transition into high-growth tech roles with practical interview advice and roadmap planning.',
    availableSlots: ['2026-08-12 10:00', '2026-08-12 14:00', '2026-08-13 09:00']
  },
  {
    name: 'Samuel Green',
    title: 'Data Analyst Lead',
    expertiseFields: ['Data Analysis', 'Finance'],
    experienceYears: 7,
    rating: 4.8,
    price: 45,
    skills: ['SQL', 'Tableau', 'Career Pivot'],
    bio: 'Focuses on building data skills for analysts and helping students land data-driven roles.',
    availableSlots: ['2026-08-12 11:00', '2026-08-13 15:00']
  },
  {
    name: 'Nina Johnson',
    title: 'Marketing Strategist',
    expertiseFields: ['Marketing', 'Business'],
    experienceYears: 10,
    rating: 4.7,
    price: 50,
    skills: ['Brand Strategy', 'Digital Campaigns', 'Resume Review'],
    bio: 'Helps early career students and marketers refine their personal brand and accelerate marketing careers.',
    availableSlots: ['2026-08-14 13:00', '2026-08-14 16:00']
  },
  {
    name: 'Carlos Ramirez',
    title: 'Product Design Mentor',
    expertiseFields: ['Design', 'Business'],
    experienceYears: 9,
    rating: 4.85,
    price: 48,
    skills: ['UI/UX', 'Portfolio Review', 'Design Interviews'],
    bio: 'Guides aspiring designers through career planning, portfolio building, and mentorship sessions.',
    availableSlots: ['2026-08-13 10:00', '2026-08-15 09:00']
  }
];

async function seedData() {
  const existingMentors = await mentorsCollection.countDocuments();
  if (existingMentors === 0) {
    const mentorDocs = seedMentors.map(createMentorDocument);
    await mentorsCollection.insertMany(mentorDocs);
    console.log('Seeded mentors into MongoDB Atlas.');
  }
}

app.get('/api/mentors', async (req, res) => {
  const mentors = await mentorsCollection.find({}).toArray();
  res.json(mentors.map((mentor) => ({
    ...mentor,
    id: mentor._id.toString()
  })));
});

app.get('/api/mentors/:id', async (req, res) => {
  const mentor = await mentorsCollection.findOne({ _id: new ObjectId(req.params.id) });
  if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
  res.json({ ...mentor, id: mentor._id.toString() });
});

app.get('/api/mentors/:id/availability', async (req, res) => {
  const mentor = await mentorsCollection.findOne({ _id: new ObjectId(req.params.id) });
  if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

  const bookedSlots = await bookingsCollection
    .find({ mentorId: req.params.id })
    .project({ slot: 1, _id: 0 })
    .toArray();

  const bookedSet = new Set(bookedSlots.map((booking) => booking.slot));
  const available = (mentor.availableSlots || []).filter((slot) => !bookedSet.has(slot));
  res.json(available);
});

app.get('/api/bookings', async (req, res) => {
  const { mentorId } = req.query;
  const query = mentorId ? { mentorId } : {};
  const bookings = await bookingsCollection.find(query).toArray();
  res.json(bookings.map((booking) => ({
    ...booking,
    id: booking._id.toString()
  })));
});

app.post('/api/bookings', async (req, res) => {
  const { mentorId, slot, paymentMethod, card, wallet } = req.body;

  if (!mentorId || !slot || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  const mentor = await mentorsCollection.findOne({ _id: new ObjectId(mentorId) });
  if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

  const availability = mentor.availableSlots || [];
  const alreadyBooked = await bookingsCollection.findOne({ mentorId, slot });
  if (!availability.includes(slot) || alreadyBooked) {
    return res.status(400).json({ error: 'Selected slot is not available' });
  }

  if (paymentMethod === 'card') {
    if (!card || !card.number || !card.expiry || !card.cvc) {
      return res.status(400).json({ error: 'Missing card payment details' });
    }
  } else if (paymentMethod === 'wallet') {
    if (!wallet || !wallet.provider || !wallet.account) {
      return res.status(400).json({ error: 'Missing wallet payment details' });
    }
  } else {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  const bookingData = {
    mentorId,
    mentorName: mentor.name,
    slot,
    paymentMethod,
    cardLast4: paymentMethod === 'card' ? card.number.slice(-4) : null,
    walletProvider: paymentMethod === 'wallet' ? wallet.provider : null,
    status: 'Confirmed'
  };

  const booking = createBookingDocument(bookingData);
  const result = await bookingsCollection.insertOne(booking);
  res.json({ message: 'Booking confirmed', booking: { ...booking, id: result.insertedId.toString() } });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

async function start() {
  await client.connect();
  db = client.db(MONGODB_DB);
  mentorsCollection = db.collection('mentors');
  bookingsCollection = db.collection('bookings');
  await seedData();

  app.listen(PORT, () => {
    console.log(`Careerak backend running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});
