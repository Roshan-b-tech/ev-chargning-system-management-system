<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChargingStationsStore } from '../stores/chargingStations';
import { useAuthStore } from '../stores/auth';
import StationCard from '../components/ui/StationCard.vue';
import StationFilters from '../components/ui/StationFilters.vue';
import { useToast } from 'vue-toastification';
import MapComponent from '../components/ui/MapComponent.vue';

const router = useRouter();
const stationStore = useChargingStationsStore();
const authStore = useAuthStore();
const toast = useToast();

const searchQuery = ref('');
const isDeleteModalOpen = ref(false);
const stationToDelete = ref<string | null>(null);
const view = ref<'grid' | 'list' | 'map'>('grid');

// Derived from store's filteredStations with additional search filtering
const displayedStations = computed(() => {
  if (!searchQuery.value) {
    console.log('ChargingStationList: First station in filteredStations:', 
      stationStore.filteredStations[0] ? JSON.stringify(stationStore.filteredStations[0], null, 2) : 'No stations');
    return stationStore.filteredStations;
  }
  
  const query = searchQuery.value.toLowerCase();
  return stationStore.filteredStations.filter(station => 
    station.name.toLowerCase().includes(query) ||
    station.connectorType.toLowerCase().includes(query) ||
    (station.location.address && station.location.address.toLowerCase().includes(query))
  );
});

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  try {
    await stationStore.fetchStations();
  } catch (error) {
    console.error('Error fetching charging stations:', error);
  }
});

const openDeleteModal = (stationId: string) => {
  stationToDelete.value = stationId;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  stationToDelete.value = null;
  isDeleteModalOpen.value = false;
};

const confirmDelete = async () => {
  if (!stationToDelete.value) return;
  
  try {
    await stationStore.deleteStation(stationToDelete.value);
    closeDeleteModal();
  } catch (error) {
    console.error('Error deleting station:', error);
  }
};

const editStation = (stationId: string) => {
  console.log('ChargingStationList: editStation called with ID:', stationId, 'type:', typeof stationId);
  console.log('ChargingStationList: stationId value:', JSON.stringify(stationId));
  
  // Validate ID before navigation
  if (!stationId) {
    console.error('ChargingStationList: No station ID provided');
    toast.error('No station ID provided');
    return;
  }

  if (typeof stationId !== 'string') {
    console.error('ChargingStationList: Invalid station ID type:', typeof stationId);
    toast.error('Invalid station ID type');
    return;
  }

  if (stationId.trim() === '') {
    console.error('ChargingStationList: Empty station ID provided');
    toast.error('Empty station ID provided');
    return;
  }

  if (stationId === 'undefined' || stationId === 'null') {
    console.error('ChargingStationList: Station ID is "undefined" or "null" string');
    toast.error('Invalid station ID');
    return;
  }
  
  console.log('ChargingStationList: Valid station ID, navigating to edit page');
  router.push(`/station/${stationId}/edit`);
};

const addNewStation = () => {
  router.push('/station/add');
};

const handleFilters = (newFilters: any) => {
  stationStore.setFilters(newFilters);
};

const resetFilters = () => {
  stationStore.resetFilters();
  searchQuery.value = '';
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Charging Stations</h1>
        <p class="mt-1 text-neutral-600">
          Manage your charging station network
        </p>
      </div>
      <div class="mt-4 md:mt-0 flex items-center space-x-4">
        <button @click="view = 'map'" 
          :class="[
            'btn-outline flex items-center',
            view === 'map' ? 'bg-primary-50 text-primary-700 border-primary-200' : ''
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clip-rule="evenodd" />
          </svg>
          Map View
        </button>
        <button @click="addNewStation" class="btn-primary flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add New Station
        </button>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Filters Sidebar -->
      <div class="lg:w-1/4">
        <div class="card p-4">
          <h2 class="text-lg font-semibold text-neutral-900 mb-4">Filters</h2>
        <StationFilters 
          :initial-filters="stationStore.filters"
          @filter="handleFilters"
          @reset="resetFilters"
        />
        </div>
      </div>
      
      <!-- Stations Content -->
      <div class="lg:w-3/4">
        <!-- Search and View Options -->
        <div class="card p-4 mb-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="relative w-full sm:w-96">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              v-model="searchQuery"
                placeholder="Search stations by name, location, or connector type..."
                class="pl-10 input w-full"
            />
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-sm text-neutral-600">View:</span>
            <button 
              @click="view = 'grid'"
              :class="[
                  'p-2 rounded-md transition-colors', 
                  view === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50'
              ]"
                title="Grid View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              @click="view = 'list'"
              :class="[
                  'p-2 rounded-md transition-colors', 
                  view === 'list' ? 'bg-primary-100 text-primary-700' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50'
              ]"
                title="List View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
          </div>
        </div>
        
        <!-- Map View -->
        <div v-if="view === 'map'" class="card p-0 overflow-hidden h-[600px]">
          <MapComponent
            :stations="displayedStations"
            :interactive="false"
          />
        </div>
        
        <!-- Grid View -->
        <div v-else-if="view === 'grid'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-if="displayedStations.length === 0" class="md:col-span-2 card p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="mt-4 text-neutral-600">No charging stations found. Try adjusting your filters or add a new station.</p>
            <button @click="resetFilters" class="mt-4 btn-outline">Reset Filters</button>
          </div>
          
          <template v-for="station in displayedStations" :key="station.id">
          <StationCard
            :station="station"
            @edit="editStation(station.id)"
            @delete="openDeleteModal(station.id)"
          />
          </template>
        </div>
        
        <!-- List View -->
        <div v-else class="overflow-x-auto card p-0">
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Power Output
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Connector Type
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody v-if="displayedStations.length > 0" class="bg-white divide-y divide-neutral-200">
              <tr v-for="station in displayedStations" :key="station.id" class="hover:bg-neutral-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-neutral-900">{{ station.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="{
                          'bg-success-100 text-success-800': station.status === 'available',
                          'bg-primary-100 text-primary-800': station.status === 'in_use',
                          'bg-warning-100 text-warning-800': station.status === 'maintenance',
                          'bg-neutral-100 text-neutral-800': station.status === 'offline'
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                  {{ station.location.address || 'No address' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="editStation(station.id)" class="text-primary-600 hover:text-primary-900 mr-3">
                    Edit
                  </button>
                  <button @click="openDeleteModal(station.id)" class="text-error-600 hover:text-error-900">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-neutral-600">
                  No charging stations found. Try adjusting your filters or add a new station.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-neutral-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-neutral-900 mb-4">Delete Station</h3>
        <p class="text-neutral-600 mb-6">Are you sure you want to delete this charging station? This action cannot be undone.</p>
        <div class="flex justify-end space-x-4">
          <button @click="closeDeleteModal" class="btn-outline">Cancel</button>
          <button @click="confirmDelete" class="btn-error">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm border border-neutral-200;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}

.btn-outline {
  @apply inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}

.btn-error {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500;
}

.input {
  @apply block w-full rounded-md border-neutral-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm;
}
</style>