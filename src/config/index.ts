export const stationStatusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'in_use', label: 'In Use' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'offline', label: 'Offline' }
];

export const connectorTypes = [
    'Type 1 (J1772)',
    'Type 2 (IEC 62196)',
    'CCS (Combo 1)',
    'CCS (Combo 2)',
    'CHAdeMO',
    'Tesla Supercharger',
    'Tesla Destination'
];

export const powerOutputOptions = [
    { min: 0, max: 0, label: 'All Power Outputs' },
    { min: 3, max: 7, label: 'Level 1 (1-7 kW)' },
    { min: 7, max: 22, label: 'Level 2 (7-22 kW)' },
    { min: 22, max: 50, label: 'Level 2+ (22-50 kW)' },
    { min: 50, max: 150, label: 'Level 3 (50-150 kW)' },
    { min: 150, max: 350, label: 'Level 3+ (150-350 kW)' },
    { min: 350, max: 1000, label: 'Ultra-Fast (350+ kW)' }
];

export const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://ev-chargning-system-management-system.onrender.com/api'; 