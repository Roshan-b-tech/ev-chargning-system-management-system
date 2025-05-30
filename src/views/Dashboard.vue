<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useChargingStationsStore } from '../stores/chargingStations';
import { useAuthStore } from '../stores/auth';
import type { ChargingStation } from '../types/chargingStation';

const router = useRouter();
const stationStore = useChargingStationsStore();
const authStore = useAuthStore();

const stats = ref({
  totalStations: 0,
  activeStations: 0,
  inactiveStations: 0,
  maintenanceStations: 0
});

// Calculate stats from stations data
const calculateStats = () => {
  if (!stationStore.stations || stationStore.stations.length === 0) {
    stats.value = { totalStations: 0, activeStations: 0, inactiveStations: 0, maintenanceStations: 0 };
    return;
  }
  stats.value.totalStations = stationStore.stations.length;
  stats.value.activeStations = stationStore.stations.filter((s: ChargingStation) => s.status === 'available').length;
  stats.value.inactiveStations = stationStore.stations.filter((s: ChargingStation) => s.status === 'in_use').length;
  stats.value.maintenanceStations = stationStore.stations.filter((s: ChargingStation) => s.status === 'maintenance').length;
};

// Get 5 most recently added stations
const recentStations = computed(() => {
  if (!stationStore.stations || stationStore.stations.length === 0) {
    return [];
  }
  return [...stationStore.stations]
    .sort((a: ChargingStation, b: ChargingStation) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);
});

onMounted(async () => {
  console.log('Dashboard onMounted hook fired.');
  console.log('Auth state:', authStore.isAuthenticated, authStore.isInitialized);
  console.log('Station store state on mount:', stationStore.stations.length, stationStore.loading);

  if (!authStore.isAuthenticated) {
    console.log('User not authenticated, redirecting to login.');
    router.push('/login');
    return;
  }

  if (stationStore.stations.length === 0 && !stationStore.loading) {
    console.log('Stations not loaded, fetching...');
    try {
      await stationStore.fetchStations();
      console.log('fetchStations completed.');
    } catch (error) {
      console.error('Error fetching stations for dashboard:', error);
    }
  } else {
    console.log('Stations already loaded or loading, skipping fetch on mount.');
  }
});

watch(() => stationStore.stations, () => {
  calculateStats();
}, { immediate: true });

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const navigateToStationList = () => {
  router.push('/stations');
};

const navigateToAddStation = () => {
  router.push('/station/add');
};

const navigateToStationMap = () => {
  router.push('/map');
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="stationStore.loading" class="flex justify-center items-center min-h-[300px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="stationStore.stations.length === 0 && !stationStore.loading" class="text-center py-12">
      <p class="text-gray-600">No charging stations found.</p>
      <button @click="navigateToAddStation" class="mt-4 btn-primary">Add Your First Station</button>
    </div>

    <div v-else>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p class="mt-1 text-neutral-600">
            Welcome back, {{ authStore.user?.email }}
          </p>
        </div>
        <div class="mt-4 md:mt-0">
          <button @click="navigateToAddStation" class="btn-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clip-rule="evenodd" />
            </svg>
            Add New Charging Station
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-primary-100 text-sm font-medium">Total Stations</p>
              <p class="text-3xl font-bold mt-1">{{ stats.totalStations }}</p>
            </div>
            <div class="p-2 bg-white/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <button @click="navigateToStationList" class="text-sm text-white/80 hover:text-white flex items-center">
              View All Stations
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-green-100 text-sm font-medium">Active Stations</p>
              <p class="text-3xl font-bold mt-1">{{ stats.activeStations }}</p>
            </div>
            <div class="p-2 bg-white/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-white/80">
              {{ Math.round((stats.activeStations / stats.totalStations) * 100) || 0 }}% of total stations
            </p>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-yellow-100 text-sm font-medium">Under Maintenance</p>
              <p class="text-3xl font-bold mt-1">{{ stats.maintenanceStations }}</p>
            </div>
            <div class="p-2 bg-white/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-white/80">
              {{ Math.round((stats.maintenanceStations / stats.totalStations) * 100) || 0 }}% of total stations
            </p>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-neutral-500 to-neutral-600 text-white">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-neutral-100 text-sm font-medium">Inactive Stations</p>
              <p class="text-3xl font-bold mt-1">{{ stats.inactiveStations }}</p>
            </div>
            <div class="p-2 bg-white/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-white/80">
              {{ Math.round((stats.inactiveStations / stats.totalStations) * 100) || 0 }}% of total stations
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div @click="navigateToStationList"
          class="card cursor-pointer hover:bg-primary-50 transition-colors flex items-center">
          <div class="p-3 bg-primary-100 text-primary-600 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-neutral-900">Manage Stations</h3>
            <p class="text-sm text-neutral-600">View and edit your charging stations</p>
          </div>
        </div>

        <div @click="navigateToAddStation"
          class="card cursor-pointer hover:bg-secondary-50 transition-colors flex items-center">
          <div class="p-3 bg-secondary-100 text-secondary-600 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-neutral-900">Add New Station</h3>
            <p class="text-sm text-neutral-600">Register a new charging station</p>
          </div>
        </div>

        <div @click="navigateToStationMap"
          class="card cursor-pointer hover:bg-accent-50 transition-colors flex items-center">
          <div class="p-3 bg-accent-100 text-accent-600 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-neutral-900">View Map</h3>
            <p class="text-sm text-neutral-600">See all stations on the map</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-neutral-900">Recently Added Stations</h2>
          <router-link to="/stations" class="text-sm text-primary-600 hover:text-primary-800">View all</router-link>
        </div>

        <div v-if="recentStations.length === 0" class="text-center py-6 text-neutral-500">
          No charging stations found. Add your first station!
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Station
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Power Output
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Connector
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Added On
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="station in recentStations" :key="station.id" class="hover:bg-neutral-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-neutral-900">{{ station.name }}</div>
                  <div class="text-xs text-neutral-500">
                    <template v-if="station.location && station.location.coordinates && station.location.coordinates.length >= 2">
                      {{ station.location.coordinates[1].toFixed(6) }}, {{ station.location.coordinates[0].toFixed(6) }}
                    </template>
                    <template v-else>
                      Location data missing
                    </template>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                    'bg-success-100 text-success-800': station.status === 'available',
                    'bg-warning-100 text-warning-800': station.status === 'maintenance',
                    'bg-neutral-100 text-neutral-800': station.status === 'in_use'
                  }">
                    {{ station.status.charAt(0).toUpperCase() + station.status.slice(1) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                  {{ station.powerOutput }} kW
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                  {{ station.connectorType }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  {{ formatDate(station.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles for the dashboard here */
</style>