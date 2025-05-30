export interface Location {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
}

export interface ChargingStation {
    id: string;
    name: string;
    location: {
        type: string;
        coordinates: [number, number];
        address?: string;
    };
    status: 'available' | 'in_use' | 'maintenance' | 'offline';
    powerOutput: number;
    connectorType: string;
    pricePerKwh: number;
    operatingHours: string;
    amenities: string[];
    createdAt?: string;
    updatedAt?: string;
} 