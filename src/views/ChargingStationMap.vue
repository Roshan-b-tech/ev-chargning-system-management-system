<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChargingStationStore } from '../stores/chargingStations.ts';
import MapComponent from '../components/ui/MapComponent.vue';
import StationFilters from '../components/ui/StationFilters.vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '../stores/auth';
import type { ChargingStation } from '../types/chargingStation';

const router = useRouter();
const stationStore = useChargingStationStore();
const toast = useToast();
const selectedStationId = ref<string | null>(null);
const selectedStation = ref<ChargingStation | null>(null);
const isDetailOpen = ref(false);
const authStore = useAuthStore();

const handleStationSelect = async (stationId: string) => {
  selectedStationId.value = stationId;
  isDetailOpen.value = true;

  // Find the station in our store
  const station = stationStore.stations.find((s: ChargingStation) => s.id === stationId);
  if (station) {
    selectedStation.value = station;
  } else {
    // If not in store, fetch it
    try {
      const fetchedStation = await stationStore.getStation(stationId);
      selectedStation.value = fetchedStation;
    } catch (error) {
      console.error('Error fetching station details:', error);
    }
  }
};

const closeDetail = () => {
  isDetailOpen.value = false;
  selectedStationId.value = null;
  selectedStation.value = null;
};

const navigateToEditStation = () => {
  if (selectedStationId.value) {
    router.push(`/station/${selectedStationId.value}/edit`);
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success-100 text-success-800';
    case 'inactive':
      return 'bg-neutral-100 text-neutral-800';
    case 'maintenance':
      return 'bg-warning-100 text-warning-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
};

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const loadStations = async () => {
  // isLoading.value is now managed by the store
  // try {
    // Ensure user is authenticated
    if (!authStore.isAuthenticated) {
      toast.error('Please log in to view charging stations');
      router.push('/login');
      return;
    }

    // Only reset filters if they haven't been initialized
    if (!stationStore.filters.status) {
      stationStore.resetFilters();
    }

    // The fetchStations action in the store handles its own loading state
    await stationStore.fetchStations();
  // } catch (error: any) {
  //   console.error('Error loading stations:', error);
  //   if (error.response?.status === 401) {
  //     toast.error('Please log in to view charging stations');
  //     router.push('/login');
  //   } else {
  //     toast.error('Failed to load charging stations. Please try again later.');
  //   }
  // } finally {
  //   isLoading.value = false;
  // }
};

onMounted(async () => {
  // Ensure auth is initialized before loading stations
  await authStore.initAuth();
  await loadStations();
});
</script>

<template>
  <div class="find-station-page min-h-screen bg-neutral-50">
    <!-- Filters (mobile: top card, desktop: sidebar) -->
    <div class="block lg:hidden px-2 pt-4">
      <div class="filters-card bg-white rounded-xl shadow-md p-4 mb-4">
        <StationFilters :initial-filters="stationStore.filters" @filter="stationStore.setFilters"
          @reset="stationStore.resetFilters" />
      </div>
    </div>

    <div class="flex flex-col lg:flex-row h-full">
      <!-- Sidebar - desktop only -->
      <div class="hidden lg:block w-80 p-4 overflow-y-auto border-r border-neutral-200 bg-white min-h-screen">
        <h1 class="text-xl font-bold text-neutral-900 mb-4">Charging Station Map</h1>
        <StationFilters :initial-filters="stationStore.filters" @filter="stationStore.setFilters"
          @reset="stationStore.resetFilters" />
        <div class="mt-4 text-sm text-neutral-500">
          Showing {{ stationStore.filteredStations.length }} stations
        </div>
      </div>

      <!-- Map container -->
      <div class="flex-1 flex flex-col items-stretch">
        <!-- Loading State -->
        <div v-if="stationStore.isLoading" class="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="stationStore.stations.length === 0 && !stationStore.isLoading" class="text-center py-12">
          <p class="text-gray-600">No charging stations found.</p>
        </div>

        <!-- Map View -->
        <div v-else class="map-section flex-1 w-full px-0 sm:px-4 pb-4">
          <div class="w-full h-[350px] sm:h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-lg bg-white">
            <MapComponent :stations="stationStore.stations" :selected-station-id="selectedStationId"
              @select-station="handleStationSelect" />
          </div>
        </div>

        <!-- Station detail sidebar -->
        <div v-if="isDetailOpen && selectedStation"
          class="fixed inset-0 sm:absolute sm:top-0 sm:right-0 sm:h-full bg-white shadow-lg w-full sm:w-96 transform transition-transform duration-300 z-20 overflow-y-auto">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-neutral-900">Station Details</h2>
              <button @click="closeDetail" class="p-2 rounded-full hover:bg-neutral-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-medium text-neutral-900">{{ selectedStation.name }}</h3>
                <div class="flex items-center mt-1">
                  <span
                    :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(selectedStation.status)}`">
                    {{ getStatusText(selectedStation.status) }}
                  </span>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-neutral-700">Location</h4>
                <p class="text-neutral-600 text-sm">
                  {{ selectedStation.location.coordinates[1].toFixed(6) }}, {{
                    selectedStation.location.coordinates[0].toFixed(6) }}
                </p>
                <p v-if="selectedStation.location.address" class="text-neutral-600 text-sm mt-1">
                  {{ selectedStation.location.address }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h4 class="text-sm font-medium text-neutral-700">Power Output</h4>
                  <p class="text-neutral-900">{{ selectedStation.powerOutput }} kW</p>
                </div>

                <div>
                  <h4 class="text-sm font-medium text-neutral-700">Connector Type</h4>
                  <p class="text-neutral-900">{{ selectedStation.connectorType }}</p>
                </div>
              </div>

              <div v-if="selectedStation.createdAt">
                <h4 class="text-sm font-medium text-neutral-700">Added On</h4>
                <p class="text-neutral-600 text-sm">
                  {{ new Date(selectedStation.createdAt).toLocaleDateString() }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button @click="navigateToEditStation" class="btn-primary">
                Edit Station
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.find-station-page {
  min-height: 100vh;
  background: #f3f4f6;
}
.filters-card {
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.04);
}
.map-section {
  margin-top: 0;
}
@media (max-width: 1024px) {
  .map-section {
    margin-top: 0;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>