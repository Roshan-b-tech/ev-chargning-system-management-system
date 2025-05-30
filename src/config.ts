export const apiBaseUrl = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api';

export const connectorTypes = [
  'Type 1',
  'Type 2',
  'CCS',
  'CHAdeMO',
  'Tesla'
];

export const stationStatusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'in_use', label: 'In Use' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'offline', label: 'Offline' }
];

export const powerOutputOptions = [
  { min: 0, max: 11, label: 'Level 1 (Up to 11 kW)' },
  { min: 11, max: 50, label: 'Level 2 (11-50 kW)' },
  { min: 50, max: 150, label: 'Level 3 (50-150 kW)' },
  { min: 150, max: 350, label: 'Ultra-Fast (150-350 kW)' },
  { min: 350, max: 9999, label: 'Experimental (350+ kW)' },
];