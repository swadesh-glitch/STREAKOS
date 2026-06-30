// On Windows dev, the local DNS stub (127.0.0.1) refuses SRV record queries
// needed for mongodb+srv:// — override with public resolvers only when needed.
if (process.platform === 'win32') {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Build allowed origins list from env var (supports comma-separated URLs)
// e.g. FRONTEND_URL=http://localhost:5173,https://streakos.vercel.app
const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check — Render pings this to confirm the service is up
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
