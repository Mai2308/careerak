const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Route Imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exploreRoutes = require('./routes/explore');
const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/booking');
const mentorsRoutes = require('./routes/mentors');
const messageRoutes = require('./routes/messages');

const app = express();

// Fallback JWT Secret for Development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'careerak-dev-secret';
}

// Configurable CORS Origins (combines env vars and defaults)
const allowedOrigins = [
  'https://careerak-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl)
    if (!origin) return callback(null, true);

    // Check fixed origins or match any *.vercel.app domain
    const isVercelDomain = /\.vercel\.app$/.test(origin);
    const isAllowed = allowedOrigins.includes(origin) || isVercelDomain;

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/messages', messageRoutes);

// Database Connection & Server Startup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerak';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Mongo connection error:', err));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;