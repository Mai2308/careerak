const mongoose = require('mongoose');
const Mentor = require('./models/Mentor');
const dotenv = require('dotenv');

dotenv.config();

const sampleMentors = [
  {
    name: 'Grace Johnson',
    field: 'Data Science & Career Growth',
    sessionPrice: 40
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/careerak', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Mentor.deleteMany({});
    await Mentor.insertMany(sampleMentors);
    console.log('Seed completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
