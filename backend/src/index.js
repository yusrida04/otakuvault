import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import mediaRoutes from './routes/media.js';
import collectionRoutes from './routes/collections.js';
import chapterRoutes from './routes/chapters.js';
import gameRoutes from './routes/game.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/game', gameRoutes);  

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'OtakuVault API is running 🎮', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 OtakuVault server running on http://localhost:${PORT}`);
  console.log(`📡 API docs: http://localhost:${PORT}/api/health`);
});
