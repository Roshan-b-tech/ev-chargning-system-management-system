import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticateJWT } from '../middleware/auth.js';
import mongoose from 'mongoose';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// User schema for MongoDB
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Drop any existing indexes to remove the username index
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: false }); // Remove this index if it exists

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Register a new user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', { body: req.body });

    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing email or password:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.log('User already exists:', { email });
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user with lowercase email
      console.log('Creating new user:', { email });
      const newUser = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword
      });

      console.log('User created successfully:', { userId: newUser._id });
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: newUser._id, email: newUser.email }
      });
    } catch (dbError) {
      console.error('Database operation error:', {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code
      });

      // Handle duplicate key error
      if (dbError.code === 11000) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      throw dbError; // Re-throw other database errors
    }
  } catch (error) {
    console.error('Registration error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    res.status(500).json({
      message: 'Server error during registration',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Create JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get current user
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('id email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user data', error: error.message });
  }
});

// Cleanup endpoint to reset users collection
router.post('/cleanup', async (req, res) => {
  try {
    await User.collection.drop();
    console.log('Users collection dropped successfully');
    res.json({ message: 'Users collection reset successfully' });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Error resetting users collection', error: error.message });
  }
});

export default router;