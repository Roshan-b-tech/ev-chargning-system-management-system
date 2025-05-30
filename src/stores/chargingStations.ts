import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useAuthStore } from './auth';
import type { ChargingStation } from '../types/chargingStation';
import { apiBaseUrl } from '../config';

// Create axios instance with interceptors
const api = axios.create({
    baseURL: apiBaseUrl,
    timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log('Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export const useChargingStationStore = defineStore('chargingStations', () => {
    const toast = useToast();
    const authStore = useAuthStore();

    const stations = ref<ChargingStation[]>([]);
    const selectedStation = ref<ChargingStation | null>(null);
    const filters = ref({
        status: '',
        connectorType: '',
        minPower: 0
    });
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const getHeaders = () => {
        if (!authStore.isAuthenticated) {
            console.error('Authentication check failed:', {
                isAuthenticated: authStore.isAuthenticated,
                token: authStore.token ? 'present' : 'missing'
            });
            throw new Error('User not authenticated');
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
        };
        console.log('Request headers:', headers);
        return headers;
    };

    const fetchStations = async () => {
        if (isLoading.value) {
            console.log('Fetch already in progress, skipping...');
            return;
        }

        try {
            console.log('Starting fetchStations...');
            isLoading.value = true;
            error.value = null;

            if (!authStore.isAuthenticated) {
                console.error('Authentication check failed in fetchStations');
                throw new Error('User must be authenticated to fetch stations');
            }

            const headers = getHeaders();
            console.log('Making API request to fetch stations...');

            const response = await api.get('/charging-stations', { headers });

            console.log('Stations fetched successfully:', response.data);
            console.log('First station data structure:', response.data[0] ? JSON.stringify(response.data[0], null, 2) : 'No stations');

            // Map the response to convert _id to id
            stations.value = response.data.map((station: any) => ({
                ...station,
                id: station._id,
                _id: undefined
            }));

            return stations.value;
        } catch (err: any) {
            console.error('Error fetching stations:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.config?.headers
            });
            error.value = err.response?.data?.message || 'Failed to fetch charging stations';
            toast.error(error.value);
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const createStation = async (stationData: Omit<ChargingStation, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            isLoading.value = true;
            error.value = null;

            if (!authStore.isAuthenticated) {
                throw new Error('User must be authenticated to create a station');
            }

            const response = await axios.post(`${apiBaseUrl}/charging-stations`, stationData, {
                headers: getHeaders()
            });

            // Convert the response to match our frontend expectations
            const newStation = {
                ...response.data,
                id: response.data._id,
                _id: undefined
            };

            stations.value.push(newStation);
            return newStation;
        } catch (err: any) {
            console.error('Error creating station:', err);
            error.value = err.response?.data?.message || 'Failed to create charging station';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updateStation = async (id: string, stationData: Partial<ChargingStation>) => {
        try {
            isLoading.value = true;
            error.value = null;

            if (!authStore.isAuthenticated) {
                throw new Error('User must be authenticated to update a station');
            }

            // Convert the data to match API expectations
            const apiData = {
                ...stationData,
                _id: id,
                id: undefined
            };

            console.log('Updating station with data:', JSON.stringify(apiData, null, 2));

            const response = await axios.put(`${apiBaseUrl}/charging-stations/${id}`, apiData, {
                headers: getHeaders()
            });

            // Convert the response back to match our frontend expectations
            const updatedStation = {
                ...response.data,
                id: response.data._id,
                _id: undefined
            };

            const index = stations.value.findIndex(s => s.id === id);
            if (index !== -1) {
                stations.value[index] = updatedStation;
            }
            return updatedStation;
        } catch (err: any) {
            console.error('Error updating station:', err);
            error.value = err.response?.data?.message || 'Failed to update charging station';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteStation = async (id: string) => {
        try {
            isLoading.value = true;
            error.value = null;

            if (!authStore.isAuthenticated) {
                throw new Error('User must be authenticated to delete a station');
            }

            await axios.delete(`${apiBaseUrl}/charging-stations/${id}`, {
                headers: getHeaders()
            });

            stations.value = stations.value.filter(s => s.id !== id);
        } catch (err: any) {
            console.error('Error deleting station:', err);
            error.value = err.response?.data?.message || 'Failed to delete charging station';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const getStation = async (id: string | undefined) => {
        console.log('chargingStations.ts: getStation called with ID:', id, 'type:', typeof id);

        if (typeof id !== 'string' || !id) {
            console.error('chargingStations.ts: getStation received invalid ID. Type:', typeof id, 'Value:', id);
            return null;
        }

        try {
            isLoading.value = true;
            error.value = null;

            if (!authStore.isAuthenticated) {
                throw new Error('User must be authenticated to get a station');
            }

            const response = await axios.get(`${apiBaseUrl}/charging-stations/${id}`, {
                headers: getHeaders()
            });

            return response.data;
        } catch (err: any) {
            console.error('Error fetching station:', err);
            error.value = err.response?.data?.message || 'Failed to fetch charging station';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const setFilters = (newFilters: typeof filters.value) => {
        filters.value = { ...newFilters };
    };

    const resetFilters = () => {
        filters.value = {
            status: '',
            connectorType: '',
            minPower: 0
        };
    };

    const filteredStations = computed(() => {
        if (!Array.isArray(stations.value)) {
            console.log('chargingStations.ts: stations.value is not an array:', stations.value);
            return [];
        }

        console.log('chargingStations.ts: Raw stations data:', JSON.stringify(stations.value, null, 2));

        return stations.value.filter(station => {
            if (filters.value.status && station.status !== filters.value.status) {
                return false;
            }
            if (filters.value.connectorType && !station.connectorType.includes(filters.value.connectorType)) {
                return false;
            }
            if (filters.value.minPower > 0 && station.powerOutput < filters.value.minPower) {
                return false;
            }
            return true;
        });
    });

    return {
        stations,
        selectedStation,
        filters,
        isLoading,
        error,
        fetchStations,
        createStation,
        updateStation,
        deleteStation,
        getStation,
        setFilters,
        resetFilters,
        filteredStations
    };
}); 