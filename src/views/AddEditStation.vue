<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect, nextTick } from 'vue';
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useChargingStationStore } from '../stores/chargingStations.ts';
import type { ChargingStation } from '../types/chargingStation';
import { useAuthStore } from '../stores/auth';
import { connectorTypes, stationStatusOptions } from '../config';
import MapComponent from '../components/ui/MapComponent.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const route = useRoute();
const stationStore = useChargingStationStore();
const authStore = useAuthStore();
const toast = useToast();

// Determine if we're editing or adding
const stationId = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!stationId.value);
const pageTitle = computed(() => isEditing.value ? 'Edit Charging Station' : 'Add New Charging Station');

// Form state
const loading = ref(false);
const station = ref<Omit<ChargingStation, 'id' | 'createdAt' | 'updatedAt'>>({
  name: '',
  location: {
    type: 'Point',
    coordinates: [-74.0060, 40.7128], // Default to NYC [longitude, latitude]
    address: ''
  },
  status: 'available',
  powerOutput: 22,
  connectorType: connectorTypes[0],
  pricePerKwh: 0.35,
  operatingHours: '24/7',
  amenities: []
});

// Handle map click to set location
const handleMapClick = (location: { latitude: number; longitude: number }) => {
  station.value.location.coordinates = [location.longitude, location.latitude];
};

// Load station data if editing
const loadStationData = async (id: string | undefined) => {
  console.log('AddEditStation: loadStationData called with ID:', id, 'type:', typeof id);
  
  // Validate ID
  if (!id) {
    console.error('AddEditStation: loadStationData received no ID');
    toast.error('No station ID provided');
    router.push('/stations');
    return;
  }

  if (typeof id !== 'string') {
    console.error('AddEditStation: loadStationData received invalid ID type:', typeof id);
    toast.error('Invalid station ID type');
    router.push('/stations');
    return;
  }

  if (id.trim() === '') {
    console.error('AddEditStation: loadStationData received empty ID string');
    toast.error('Empty station ID provided');
    router.push('/stations');
    return;
  }
  
  loading.value = true;
  try {
    const data = await stationStore.getStation(id);
    if (!data) {
      toast.error('Station not found');
      router.push('/stations');
      return;
    }
    station.value = {
      name: data.name,
      location: {
        type: 'Point',
        coordinates: data.location.coordinates,
        address: data.location.address || ''
      },
      status: data.status,
      powerOutput: data.powerOutput,
      connectorType: data.connectorType,
      pricePerKwh: data.pricePerKwh,
      operatingHours: data.operatingHours,
      amenities: data.amenities || []
    };
  } catch (error) {
    console.error('Error loading station:', error);
    toast.error('Failed to load station details');
    router.push('/stations');
  } finally {
    loading.value = false;
  }
};

// --- Lifecycle Hooks and Watchers --- //

// Initial load on component mount IF on edit route
onMounted(async () => {
  console.log('AddEditStation: onMounted triggered. route.params.id:', route.params.id);
   const currentId = route.params.id;
   // Rely on the robust check in loadStationData
   if (typeof currentId === 'string' && currentId) {
     console.log('AddEditStation: onMounted - Calling loadStationData with ID:', currentId);
     await loadStationData(currentId);
   } else {
     console.log('AddEditStation: onMounted - No valid ID found or not edit route.');
     // No data load needed for add mode, form is already initialized
   }
});

// Watch for route changes to handle form resets when leaving edit mode
watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log('AddEditStation: watch route.params.id:', newId, 'oldId:', oldId);
    // If navigating away from an edit route (oldId was valid, newId is undefined),
    // or navigating to add route directly, reset the form.
    if (!newId && oldId) {
       console.log('AddEditStation: watch - ID became undefined, resetting form');
       resetForm();
    } else if (!newId && !oldId && route.name === 'add-station') {
       console.log('AddEditStation: watch - On add route, resetting form');
       resetForm();
    }
  }
);

// Guard for navigation between edit routes (station/:id/edit -> station/:otherId/edit)
onBeforeRouteUpdate(async (to, from, next) => {
  console.log('AddEditStation: onBeforeRouteUpdate - to.params.id:', to.params.id);
  const newId = to.params.id;
  // Rely on the robust check in loadStationData
  if (to.name === 'edit-station' && typeof newId === 'string' && newId) {
    console.log('AddEditStation: onBeforeRouteUpdate - Calling loadStationData with new ID:', newId);
    try {
      await loadStationData(newId);
      next();
    } catch (error) {
      console.error('AddEditStation: Error loading data in onBeforeRouteUpdate:', error);
      toast.error('Failed to load station details');
      next({ name: 'stations' });
    }
  } else {
    next();
  }
});

// Form validation
const errors = ref({
  name: '',
  location: '',
  powerOutput: '',
  connectorType: '',
  general: ''
});

const validateForm = () => {
  let isValid = true;
  errors.value = {
    name: '',
    location: '',
    powerOutput: '',
    connectorType: '',
    general: ''
  };

  if (!station.value.name.trim()) {
    errors.value.name = 'Station name is required';
    isValid = false;
  }

  if (station.value.powerOutput <= 0) {
    errors.value.powerOutput = 'Power output must be greater than 0';
    isValid = false;
  }

  if (!station.value.connectorType) {
    errors.value.connectorType = 'Connector type is required';
    isValid = false;
  }

  return isValid;
};

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  try {
    if (isEditing.value && stationId.value) {
      await stationStore.updateStation(stationId.value, station.value);
      toast.success('Station updated successfully');
    } else {
      const result = await stationStore.createStation(station.value);
      console.log('Station creation result:', result); // Debug log
      toast.success('New station added successfully');
    }
    router.push('/stations');
  } catch (error: any) {
    console.error('Station creation error:', error); // Debug log
    console.error('Error response:', error.response); // Debug log
    errors.value.general = error.response?.data?.message || error.message || 'Operation failed. Please check the console for details.';
    toast.error(errors.value.general);
  } finally {
    loading.value = false;
  }
};

// Prepare map display
const mapStations = computed(() => {
  // For new stations, show an empty array (map will just be interactive for selecting location)
  // For editing, show just this station on the map
  if (isEditing.value && stationId.value) {
    return [{
      id: stationId.value,
      name: station.value.name,
      location: station.value.location,
      status: station.value.status,
      powerOutput: station.value.powerOutput,
      connectorType: station.value.connectorType,
      pricePerKwh: station.value.pricePerKwh,
      operatingHours: station.value.operatingHours,
      amenities: station.value.amenities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }];
  }
  return [];
});

const resetForm = () => {
  station.value = {
    name: '',
    location: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128], // Default to NYC [longitude, latitude]
      address: ''
    },
    status: 'available',
    powerOutput: 22,
    connectorType: connectorTypes[0],
    pricePerKwh: 0.35,
    operatingHours: '24/7',
    amenities: []
  };
  errors.value = {
    name: '',
    location: '',
    powerOutput: '',
    connectorType: '',
    general: ''
  };
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">{{ pageTitle }}</h1>
      <p class="mt-1 text-neutral-600">
        {{ isEditing ? 'Update the details of this charging station' : 'Add a new charging station to the network' }}
      </p>
    </div>
    
    <div v-if="errors.general" class="bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded mb-6">
      {{ errors.general }}
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Station Details -->
        <div class="card space-y-6">
          <h2 class="text-xl font-semibold text-neutral-900">Station Information</h2>
          
          <div>
            <label for="name" class="block text-sm font-medium text-neutral-700 mb-1">
              Station Name *
            </label>
            <input id="name" v-model="station.name" type="text" required class="input"
              :class="{ 'border-error-500 focus:ring-error-500 focus:border-error-500': errors.name }" />
            <p v-if="errors.name" class="mt-1 text-sm text-error-600">{{ errors.name }}</p>
          </div>
          
          <div>
            <label for="status" class="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select id="status" v-model="station.status" class="input">
              <option v-for="option in stationStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="powerOutput" class="block text-sm font-medium text-neutral-700 mb-1">
                Power Output (kW) *
              </label>
              <input id="powerOutput" v-model.number="station.powerOutput" type="number" min="0" step="0.1" required
                class="input"
                :class="{ 'border-error-500 focus:ring-error-500 focus:border-error-500': errors.powerOutput }" />
              <p v-if="errors.powerOutput" class="mt-1 text-sm text-error-600">{{ errors.powerOutput }}</p>
            </div>
            
            <div>
              <label for="connectorType" class="block text-sm font-medium text-neutral-700 mb-1">
                Connector Type *
              </label>
              <select id="connectorType" v-model="station.connectorType" required class="input"
                :class="{ 'border-error-500 focus:ring-error-500 focus:border-error-500': errors.connectorType }">
                <option v-for="type in connectorTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
              <p v-if="errors.connectorType" class="mt-1 text-sm text-error-600">{{ errors.connectorType }}</p>
            </div>
          </div>
          
          <div>
            <label for="address" class="block text-sm font-medium text-neutral-700 mb-1">
              Address (Optional)
            </label>
            <input id="address" v-model="station.location.address" type="text" class="input" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="latitude" class="block text-sm font-medium text-neutral-700 mb-1">
                Latitude *
              </label>
              <input id="latitude" v-model.number="station.location.coordinates[1]" type="number" step="0.000001" required
                class="input" />
            </div>
            
            <div>
              <label for="longitude" class="block text-sm font-medium text-neutral-700 mb-1">
                Longitude *
              </label>
              <input id="longitude" v-model.number="station.location.coordinates[0]" type="number" step="0.000001" required
                class="input" />
            </div>
          </div>
          
          <p class="text-sm text-neutral-500 italic">
            * Click on the map to set the location
          </p>
          
          <div class="flex justify-end space-x-4 pt-4">
            <router-link to="/stations" class="btn-outline">
              Cancel
            </router-link>
            <button type="submit" class="btn-primary" :disabled="loading">
              <span v-if="loading">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
              </span>
              {{ isEditing ? 'Update Station' : 'Add Station' }}
            </button>
          </div>
        </div>
        
        <!-- Map -->
        <div class="card p-0 overflow-hidden h-[500px] lg:h-auto">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Location
            </label>
            <div class="h-64 rounded-lg overflow-hidden border border-neutral-300">
              <MapComponent
                :stations="mapStations"
                :selected-station-id="isEditing ? stationId : null"
                :interactive="true"
                @map-click="handleMapClick"
              />
            </div>
            <p class="mt-1 text-sm text-neutral-500">
              Click on the map to set the station location
            </p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>