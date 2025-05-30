import express from 'express';
import ChargingStation from '../models/ChargingStation.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get all charging stations
router.get('/', async (req, res) => {
  try {
    const stations = await ChargingStation.find()
      .sort({ createdAt: -1 });
    res.status(200).json(stations);
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({
      message: 'Error fetching charging stations',
      error: error.message
    });
  }
});

// Get a single charging station by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid station ID' });
    }

    const station = await ChargingStation.findById(id);
    if (!station) {
      return res.status(404).json({ message: 'Charging station not found' });
    }
    res.status(200).json(station);
  } catch (error) {
    console.error('Get station error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid station ID format' });
    }
    res.status(500).json({
      message: 'Error fetching charging station',
      error: error.message
    });
  }
});

// Create a new charging station
router.post('/', async (req, res) => {
  try {
    const { name, location, status, powerOutput, connectorType } = req.body;

    // Create new station with user ID
    const newStation = new ChargingStation({
      name,
      location,
      status,
      powerOutput,
      connectorType,
      createdBy: req.user.id
    });

    const savedStation = await newStation.save();
    res.status(201).json(savedStation);
  } catch (error) {
    console.error('Create station error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      message: 'Error creating charging station',
      error: error.message
    });
  }
});

// Update a charging station
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, status, powerOutput, connectorType } = req.body;

    // Prepare update object with only the fields that are provided
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (status !== undefined) updates.status = status;
    if (powerOutput !== undefined) updates.powerOutput = powerOutput;
    if (connectorType !== undefined) updates.connectorType = connectorType;

    const updatedStation = await ChargingStation.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedStation) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    res.status(200).json(updatedStation);
  } catch (error) {
    console.error('Update station error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid station ID format' });
    }
    res.status(500).json({
      message: 'Error updating charging station',
      error: error.message
    });
  }
});

// Delete a charging station
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStation = await ChargingStation.findByIdAndDelete(id);

    if (!deletedStation) {
      return res.status(404).json({ message: 'Charging station not found' });
    }

    res.status(200).json({
      message: 'Charging station deleted successfully',
      deletedStation
    });
  } catch (error) {
    console.error('Delete station error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid station ID format' });
    }
    res.status(500).json({
      message: 'Error deleting charging station',
      error: error.message
    });
  }
});

export default router;