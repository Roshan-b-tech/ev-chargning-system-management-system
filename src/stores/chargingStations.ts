import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from './auth';
import type { ChargingStation } from '../types/chargingStation';
import { api } from '../services/api';

export const useChargingStationsStore = defineStore('chargingStations', () => {
    const stations = ref<ChargingStation[]>([]);
    const selectedStation = ref<ChargingStation | null>(null);
    const filters = ref({
        status: '',
        connectorType: '',
        minPower: 0
    });
    const loading = ref(false);
    const error = ref<string | null>(null);
    const toast = useToast();
    const authStore = useAuthStore();

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

    async function fetchStations() {
        loading.value = true;
        error.value = null;
        try {
            console.log('Starting fetchStations...');
            const response = await api.get('/api/charging-stations', {
                headers: getHeaders()
            });
            console.log('Stations fetched successfully:', response.data);
            console.log('First station data structure:', response.data[0] ? JSON.stringify(response.data[0], null, 2) : 'No stations');

            // Map the response to convert _id to id
            stations.value = response.data.map((station: any) => ({
                ...station,
                id: station._id,
                _id: undefined
            }));
        } catch (err: any) {
            console.error('Error fetching stations:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.config?.headers
            });
            error.value = err.response?.data?.message || 'Failed to fetch charging stations';
            toast.error(error.value);
        } finally {
            loading.value = false;
        }
    }

    async function addStation(station: Omit<ChargingStation, 'id'>) {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.post('/api/charging-stations', station, {
                headers: getHeaders()
            });
            stations.value.push(response.data);
            toast.success('Station added successfully');
        } catch (err: any) {
            console.error('Error creating station:', err);
            error.value = err.response?.data?.message || 'Failed to create charging station';
            toast.error(error.value);
        } finally {
            loading.value = false;
        }
    }

    async function updateStation(id: string, updates: Partial<ChargingStation>) {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.put(`/api/charging-stations/${id}`, updates, {
                headers: getHeaders()
            });
            const index = stations.value.findIndex(s => s.id === id);
            if (index !== -1) {
                stations.value[index] = response.data;
            }
            toast.success('Station updated successfully');
        } catch (err: any) {
            console.error('Error updating station:', err);
            error.value = err.response?.data?.message || 'Failed to update charging station';
            toast.error(error.value);
        } finally {
            loading.value = false;
        }
    }

    async function deleteStation(id: string) {
        loading.value = true;
        error.value = null;
        try {
            await api.delete(`/api/charging-stations/${id}`, {
                headers: getHeaders()
            });
            stations.value = stations.value.filter(s => s.id !== id);
            toast.success('Station deleted successfully');
        } catch (err: any) {
            console.error('Error deleting station:', err);
            error.value = err.response?.data?.message || 'Failed to delete charging station';
            toast.error(error.value);
        } finally {
            loading.value = false;
        }
    }

    const getStation = async (id: string | undefined) => {
        console.log('chargingStations.ts: getStation called with ID:', id, 'type:', typeof id);

        if (typeof id !== 'string' || !id) {
            console.error('chargingStations.ts: getStation received invalid ID. Type:', typeof id, 'Value:', id);
            return null;
        }

        try {
            loading.value = true;
            error.value = null;

            if (!authStore.isAuthenticated) {
                throw new Error('User must be authenticated to get a station');
            }

            const response = await api.get(`/api/charging-stations/${id}`, {
                headers: getHeaders()
            });

            return response.data;
        } catch (err: any) {
            console.error('Error fetching station:', err);
            error.value = err.response?.data?.message || 'Failed to fetch charging station';
            throw err;
        } finally {
            loading.value = false;
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
        loading,
        error,
        fetchStations,
        addStation,
        updateStation,
        deleteStation,
        getStation,
        setFilters,
        resetFilters,
        filteredStations
    };
}); 