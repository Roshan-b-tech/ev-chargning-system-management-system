import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import stationRoutes from './routes/chargingStations.js';
import { authenticateJWT } from './middleware/auth.js';
import ChargingStation from './models/ChargingStation.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://roshangehlot500:roshan999@emailreminder.ibdudgs.mongodb.net/?retryWrites=true&w=majority&appName=emailReminder';
    console.log('Attempting to connect to MongoDB...');

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);
    console.log('Connected to MongoDB successfully');

    // Log connection state
    console.log('MongoDB connection state:', {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  } catch (err) {
    console.error('MongoDB connection error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    process.exit(1); // Exit if cannot connect to database
  }
};

connectDB();

// Add test data endpoint
app.post('/api/seed-data', async (req, res) => {
  try {
    await ChargingStation.deleteMany({}); // Clear existing data
    const testStations = [
      {
        name: "Downtown Station",
        location: { type: "Point", coordinates: [-73.935242, 40.730610] },
        status: "Available",
        powerOutput: 50,
        connectorType: "Type 2"
      },
      {
        name: "Central Park Station",
        location: { type: "Point", coordinates: [-73.965354, 40.782865] },
        status: "In Use",
        powerOutput: 100,
        connectorType: "CCS"
      },
      {
        name: "Brooklyn Station",
        location: { type: "Point", coordinates: [-73.949721, 40.678178] },
        status: "Available",
        powerOutput: 75,
        connectorType: "CHAdeMO"
      }
    ];
    await ChargingStation.insertMany(testStations);
    res.json({ message: "Test data added successfully" });
  } catch (error) {
    console.error('Seed data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/charging-stations', authenticateJWT, stationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'EV Charging Station API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API available at http://localhost:${port}/api`);
});