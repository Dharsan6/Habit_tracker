require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes    = require('./routes/auth');
const habitRoutes   = require('./routes/habits');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes  = require('./routes/budgets');
const moodRoutes    = require('./routes/moods');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
}));
app.use(express.json());

// ── Health check (no auth) ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'lifetrack-node-backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/habits',   habitRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets',  budgetRoutes);
app.use('/api/moods',    moodRoutes);

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Connect to MongoDB Atlas, then start server ───────────────────────────────
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB Atlas connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀  LifeTrack backend running on http://localhost:${PORT}`);
      console.log(`📋  Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
