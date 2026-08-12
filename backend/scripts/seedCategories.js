require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Field = require('../models/Field');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerak';

const data = {
  Technology: ['Software Engineering', 'Data Science', 'Cybersecurity', 'IT Support'],
  Engineering: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
  Medicine: ['General Medicine', 'Nursing', 'Pharmacy', 'Dentistry'],
  Finance: ['Accounting', 'Investment Banking', 'Financial Planning'],
  Marketing: ['Digital Marketing', 'Brand Management', 'Market Research'],
  Business: ['Entrepreneurship', 'Human Resources', 'Operations Management'],
  Architecture: ['Residential Architecture', 'Urban Planning', 'Interior Design'],
  Law: ['Corporate Law', 'Criminal Law', 'Intellectual Property Law']
};

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  for (const [categoryName, fields] of Object.entries(data)) {
    const category = await Category.findOneAndUpdate(
      { slug: slugify(categoryName) },
      { name: categoryName, slug: slugify(categoryName) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    for (const fieldName of fields) {
      await Field.findOneAndUpdate(
        { category: category._id, slug: slugify(fieldName) },
        { name: fieldName, slug: slugify(fieldName), category: category._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Seeded category: ${categoryName} (${fields.length} fields)`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
  console.error('Seed error', err);
  process.exit(1);
});
