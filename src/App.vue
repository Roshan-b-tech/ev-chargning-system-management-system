<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import Navbar from './components/layout/Navbar.vue';
import Footer from './components/layout/Footer.vue';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initAuth();
  if (authStore.isAuthenticated) {
    // Data fetching is now primarily handled by individual views on mount
    // Remove this fetchStations call from App.vue
    // try {
    //   await stationStore.fetchStations();
    // } catch (error) {
    //   console.error('Failed to fetch stations:', error);
    // }
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-50">
    <Navbar />
    <main class="flex-grow container mx-auto px-4 py-8">
      <router-view :key="$route.fullPath" />
    </main>
    <Footer />
  </div>
</template>