const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'careerak-dev-secret';
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exploreRoutes = require('./routes/explore');
const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/booking');
const mentorsRoutes = require('./routes/mentors');
const messageRoutes = require('./routes/messages');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerak';
if (!process.env.MONGO_URI || MONGO_URI.includes('<') || MONGO_URI.includes('cluster0.mongodb.net')) {
  console.warn('Detected placeholder or missing MONGO_URI; falling back to local MongoDB for development.');
  MONGO_URI = 'mongodb://localhost:27017/careerak';
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Mongo connection error', err);
  });

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
