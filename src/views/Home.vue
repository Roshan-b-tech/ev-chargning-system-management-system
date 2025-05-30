<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChargingStationStore } from '../stores/chargingStations.ts';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const stationStore = useChargingStationStore();
const authStore = useAuthStore();

const stationCount = computed(() => stationStore.stations.length);

onMounted(async () => {
  console.log('Home onMounted hook fired.');
  console.log('Auth state:', authStore.isAuthenticated, authStore.isInitialized);
  console.log('Station store state on mount:', stationStore.stations.length, stationStore.isLoading);

  if (!authStore.isAuthenticated) {
     console.log('User not authenticated, redirecting to login.');
     router.push('/login');
     return;
  }

  if (stationStore.stations.length === 0 && !stationStore.isLoading) {
    console.log('Stations not loaded, fetching...');
    try {
      await stationStore.fetchStations();
      console.log('fetchStations completed in Home.vue');
    } catch (error) {
      console.error('Error fetching stations for Home page:', error);
    }
  } else {
    console.log('Stations already loaded or loading in Home.vue, skipping fetch on mount.');
  }
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-primary-700 text-white">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-800 to-primary-600 opacity-90"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div class="text-center md:text-left md:max-w-2xl">
          <h1 class="text-4xl md:text-5xl font-bold leading-tight">
            Find Electric Vehicle Charging Stations Near You
          </h1>
          <p class="mt-4 text-xl text-primary-100">
            Locate and manage EV charging stations with real-time availability and detailed information.
          </p>
          <div class="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
            <router-link to="/map" class="btn-primary">
              Find Charging Stations
            </router-link>
            <router-link to="/register" class="btn-outline border-white text-white hover:bg-white/10">
              Register Now
            </router-link>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-neutral-900">Connecting EV Drivers to Charging Solutions</h2>
          <p class="mt-4 text-lg text-neutral-600 max-w-3xl mx-auto">
            Our platform provides comprehensive information about charging stations across the country.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="card hover:translate-y-[-4px] transition-all">
            <div class="text-primary-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-900">Interactive Map</h3>
            <p class="mt-2 text-neutral-600">
              Browse our interactive map to find charging stations near you or at your destination.
            </p>
          </div>
          
          <div class="card hover:translate-y-[-4px] transition-all">
            <div class="text-secondary-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-900">Detailed Information</h3>
            <p class="mt-2 text-neutral-600">
              View power output, connector types, availability status and more for each charging station.
            </p>
          </div>
          
          <div class="card hover:translate-y-[-4px] transition-all">
            <div class="text-accent-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-900">Filtering & Search</h3>
            <p class="mt-2 text-neutral-600">
              Find exactly what you need with powerful filtering by power output, connector type, and status.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Stats Section -->
    <section class="py-12 bg-neutral-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="stationStore.isLoading" class="flex justify-center items-center min-h-[100px]">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="stationStore.stations.length === 0 && !stationStore.isLoading" class="text-center py-6 text-neutral-600">
           No station data available.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="text-4xl font-bold text-primary-600">{{ stationCount }}</div>
            <div class="mt-2 text-neutral-600">Charging Stations</div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="text-4xl font-bold text-secondary-600">8</div>
            <div class="mt-2 text-neutral-600">Connector Types</div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="text-4xl font-bold text-accent-600">24/7</div>
            <div class="mt-2 text-neutral-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-neutral-900">Ready to manage your charging infrastructure?</h2>
        <p class="mt-4 text-lg text-neutral-600 max-w-3xl mx-auto">
          Join our platform today and get access to advanced tools for managing EV charging stations.
        </p>
        <div class="mt-8">
          <router-link to="/register" class="btn-primary text-lg px-6 py-3">
            Get Started Now
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>