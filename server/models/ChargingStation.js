import mongoose from 'mongoose';

const chargingStationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (coords) {
                    return coords.length === 2 &&
                        coords[0] >= -180 && coords[0] <= 180 && // longitude
                        coords[1] >= -90 && coords[1] <= 90;     // latitude
                },
                message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
            }
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200, 'Address cannot exceed 200 characters']
        }
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['available', 'in_use', 'maintenance', 'offline'],
            message: 'Status must be one of: available, in_use, maintenance, offline'
        }
    },
    powerOutput: {
        type: Number,
        required: true,
        min: [0, 'Power output cannot be negative'],
        max: [1000, 'Power output cannot exceed 1000 kW']
    },
    connectorType: {
        type: String,
        required: true,
        enum: {
            values: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla'],
            message: 'Connector type must be one of: Type 1, Type 2, CCS, CHAdeMO, Tesla'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for geospatial queries
chargingStationSchema.index({ location: '2dsphere' });

// Update the updatedAt timestamp before saving
chargingStationSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('ChargingStation', chargingStationSchema); 