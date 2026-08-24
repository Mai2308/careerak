const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const dbConnect = require('./db');

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

// Configurable CORS Origins (CORS_ORIGIN in .env, comma-separated)
const allowedOrigins = [
  'https://careerak-frontend.vercel.app',
  'http://localhost:5173',
  ...(process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim())
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isVercelDomain = /\.vercel\.app$/.test(origin);
    const isAllowed = allowedOrigins.includes(origin) || isVercelDomain;

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Respond directly to CORS preflight checks

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Database Connection Middleware for Serverless
app.use(async (req, res, next) => {
  // Skip DB connection check for health check endpoint
  if (req.path === '/api/health') return next();

  try {
    await dbConnect();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/messages', messageRoutes);

// Local Development Server Only (Ignored by Vercel serverless functions)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  dbConnect().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch(err => console.error('Startup error:', err));
}

module.exports = app;