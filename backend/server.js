const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
const mentorsRoutes = require('./routes/mentors');
app.use('/api/mentors', mentorsRoutes);

const PORT = process.env.PORT || 5000;
// If MONGO_URI looks like a placeholder (contains <username> or cluster0), fall back to local DB for dev.
let MONGO_URI = process.env.MONGO_URI || '';
if (MONGO_URI.includes('<') || MONGO_URI.includes('cluster0.mongodb.net')) {
  console.warn('Detected placeholder MONGO_URI; falling back to local MongoDB for development.');
  MONGO_URI = 'mongodb://localhost:27017/careerak';
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
  });
