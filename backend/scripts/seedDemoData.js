require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Category = require('../models/Category');
const Field = require('../models/Field');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerak';
const DEMO_PASSWORD = 'Password123!';

const categoryData = {
  Technology: ['Software Engineering', 'Data Science', 'Cybersecurity', 'IT Support'],
  Engineering: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
  Medicine: ['General Medicine', 'Nursing', 'Pharmacy', 'Dentistry'],
  Finance: ['Accounting', 'Investment Banking', 'Financial Planning'],
  Marketing: ['Digital Marketing', 'Brand Management', 'Market Research'],
  Business: ['Entrepreneurship', 'Human Resources', 'Operations Management'],
  Architecture: ['Residential Architecture', 'Urban Planning', 'Interior Design'],
  Law: ['Corporate Law', 'Criminal Law', 'Intellectual Property Law']
};

// Mentors are only added for some fields, leaving others empty on purpose
// so the "no mentors available" alternative flow can be tested too.
const mentorData = [
  { name: 'Sara Mentor', email: 'sara.mentor@careerak.test', fieldName: 'Software Engineering', rating: 4.8 },
  { name: 'Omar Mentor', email: 'omar.mentor@careerak.test', fieldName: 'Data Science', rating: 4.6 },
  { name: 'Lina Mentor', email: 'lina.mentor@careerak.test', fieldName: 'Digital Marketing', rating: 4.9 },
  { name: 'Karim Mentor', email: 'karim.mentor@careerak.test', fieldName: 'Corporate Law', rating: 4.5 }
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function seedCategoriesAndFields() {
  const fieldsByName = {};
  for (const [categoryName, fieldNames] of Object.entries(categoryData)) {
    const category = await Category.findOneAndUpdate(
      { slug: slugify(categoryName) },
      { name: categoryName, slug: slugify(categoryName) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    for (const fieldName of fieldNames) {
      const field = await Field.findOneAndUpdate(
        { category: category._id, slug: slugify(fieldName) },
        { name: fieldName, slug: slugify(fieldName), category: category._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      fieldsByName[fieldName] = field;
    }
  }
  console.log(`Seeded ${Object.keys(categoryData).length} categories.`);
  return fieldsByName;
}

async function seedMentors(fieldsByName) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const mentors = [];

  for (const m of mentorData) {
    const field = fieldsByName[m.fieldName];
    const mentor = await User.findOneAndUpdate(
      { email: m.email },
      {
        name: m.name,
        email: m.email,
        password: passwordHash,
        role: 'mentor',
        field: field._id,
        rating: m.rating
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    mentors.push(mentor);

    // Refresh this mentor's availability slots: a mix of booked and open sessions.
    await Availability.deleteMany({ mentor: mentor._id });
    await Availability.insertMany([
      { mentor: mentor._id, date: hoursFromNow(24), duration: 30, isBooked: false },
      { mentor: mentor._id, date: hoursFromNow(48), duration: 45, isBooked: false },
      { mentor: mentor._id, date: hoursFromNow(72), duration: 30, isBooked: true }
    ]);
  }

  console.log(`Seeded ${mentors.length} mentors with availability.`);
  return mentors;
}

async function seedStudent(fieldsByName, mentors) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const interestedFields = [fieldsByName['Software Engineering']._id, fieldsByName['Data Science']._id];

  const student = await User.findOneAndUpdate(
    { email: 'alex.student@careerak.test' },
    {
      name: 'Alex Student',
      email: 'alex.student@careerak.test',
      password: passwordHash,
      role: 'student',
      educationLevel: 'undergraduate',
      interests: ['coding', 'startups'],
      interestedFields
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const softwareMentor = mentors.find(m => m.email === 'sara.mentor@careerak.test');
  await Booking.deleteMany({ student: student._id });
  await Booking.create({
    student: student._id,
    mentor: softwareMentor._id,
    topic: 'Getting started in software engineering',
    date: hoursFromNow(24),
    status: 'confirmed'
  });

  console.log('Seeded demo student with interests and a booking.');
  return student;
}

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run demo seed script with NODE_ENV=production.');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const fieldsByName = await seedCategoriesAndFields();
  const mentors = await seedMentors(fieldsByName);
  await seedStudent(fieldsByName, mentors);

  console.log('\nDemo accounts (all use the same password):');
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log('  Student:  alex.student@careerak.test');
  mentorData.forEach(m => console.log(`  Mentor:   ${m.email} (${m.fieldName})`));
  console.log('\nFields with no mentors on purpose (test "no mentors available"): Cybersecurity, IT Support, and most others.');

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => {
  console.error('Seed error', err);
  process.exit(1);
});
