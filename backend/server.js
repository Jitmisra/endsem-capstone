const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Helper function to normalize URLs (remove trailing slashes)
const normalizeUrl = (url) => {
  if (!url) return '';
  return url.replace(/\/+$/, '').toLowerCase(); // Remove trailing slashes and normalize case
};

// Allow CORS for development (multiple localhost ports) and production
const frontendUrl = normalizeUrl(process.env.FRONTEND_URL);
const allowedOrigins = frontendUrl
  ? [frontendUrl] // Store normalized version
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

// Add Vercel pattern matching
const vercelPattern = /^https:\/\/.*\.vercel\.app$/i;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Normalize origin for comparison
    const normalizedOrigin = normalizeUrl(origin);
    
    // In development, allow common localhost ports
    if (process.env.NODE_ENV !== 'production' && normalizedOrigin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Check if normalized origin matches allowed list
    const normalizedAllowed = allowedOrigins.map(normalizeUrl);
    if (normalizedAllowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // Check if origin matches Vercel pattern (for production)
    if (process.env.NODE_ENV === 'production' && vercelPattern.test(origin)) {
      return callback(null, true);
    }
    
    // Log for debugging
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Normalized:', normalizedOrigin);
    console.log('CORS check - Allowed (normalized):', normalizedAllowed);
    console.log('CORS check - FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('CORS check - NODE_ENV:', process.env.NODE_ENV);
    
    // Allow it anyway for now to debug
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24 hours
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EduStore API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
