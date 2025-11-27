import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyCloudinaryConfig } from './config/cloudinary.js';
import uploadRoute from './routes/uploadRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import resourceRoute from './routes/resourceRoute.js';
import aiRoute from './routes/aiRoute.js';
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
// CORS configuration
const defaultOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URLS,
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const allowedOrigins = defaultOrigins
  .flatMap((origin) => origin.split(',').map((item) => item.trim()))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In non-production environments, allow all origins to ease local development
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`🚫 CORS blocked request from origin: ${origin}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', uploadRoute);
app.use('/api', notificationRoute);
app.use('/api', resourceRoute);
app.use('/api', aiRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);

  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Handle other errors
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
const startServer = async () => {
  try {
    // Verify Cloudinary configuration
    const isCloudinaryConfigured = verifyCloudinaryConfig();
    
    if (!isCloudinaryConfigured) {
      console.error('⚠️  Server starting without Cloudinary configuration');
      console.error('   Image uploads will not work until configuration is complete');
    }

    app.listen(PORT, () => {
      console.log('\n🚀 Server started successfully!');
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   Upload endpoint: http://localhost:${PORT}/api/upload`);
      console.log('\n📝 Available endpoints:');
      console.log('   POST   /api/upload          - Upload single image');
      console.log('   POST   /api/upload/multiple - Upload multiple images');
      console.log('   DELETE /api/upload/:id      - Delete image by public_id');
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
startServer();
