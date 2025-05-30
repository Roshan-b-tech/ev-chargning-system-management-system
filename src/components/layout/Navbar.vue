<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  closeMobileMenu();
};
</script>

<template>
  <nav class="bg-primary-700 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center" @click="closeMobileMenu">
            <span class="text-xl font-bold">EV Charge</span>
            <span class="ml-1 text-secondary-400">Hub</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-4">
          <template v-if="authStore.isAuthenticated">
            <a @click="router.push('/'); closeMobileMenu()" class="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors cursor-pointer">
              Home
            </a>
            <a @click="router.push('/map'); closeMobileMenu()" class="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors cursor-pointer">
              Find Stations
            </a>
            <a @click="router.push('/dashboard'); closeMobileMenu()" class="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors cursor-pointer">
              Dashboard
            </a>
            <a @click="router.push('/stations'); closeMobileMenu()" class="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors cursor-pointer">
              Manage Stations
            </a>
            <button @click="handleLogout"
              class="px-3 py-2 rounded-md bg-primary-800 hover:bg-primary-900 transition-colors">
              Logout
            </button>
          </template>

          <template v-else>
            <a @click="router.push('/login'); closeMobileMenu()" class="px-3 py-2 rounded-md hover:bg-primary-600 transition-colors cursor-pointer">
              Login
            </a>
            <a @click="router.push('/register'); closeMobileMenu()"
              class="px-3 py-2 rounded-md bg-secondary-500 hover:bg-secondary-600 transition-colors cursor-pointer">
              Register
            </a>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button @click="toggleMobileMenu"
            class="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-600">
            <svg :class="{ 'hidden': mobileMenuOpen, 'block': !mobileMenuOpen }" class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }" class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-800">
        <template v-if="authStore.isAuthenticated">
          <a @click="router.push('/'); closeMobileMenu()"
            class="block px-3 py-2 rounded-md hover:bg-primary-700 transition-colors cursor-pointer">
            Home
          </a>
          <a @click="router.push('/map'); closeMobileMenu()"
            class="block px-3 py-2 rounded-md hover:bg-primary-700 transition-colors cursor-pointer">
            Find Stations
          </a>
          <a @click="router.push('/dashboard'); closeMobileMenu()"
            class="block px-3 py-2 rounded-md hover:bg-primary-700 transition-colors cursor-pointer">
            Dashboard
          </a>
          <a @click="router.push('/stations'); closeMobileMenu()"
            class="block px-3 py-2 rounded-md hover:bg-primary-700 transition-colors cursor-pointer">
            Manage Stations
          </a>
          <button @click="handleLogout"
            class="w-full text-left px-3 py-2 rounded-md hover:bg-primary-900 transition-colors">
            Logout
          </button>
        </template>

        <template v-else>
          <a @click="router.push('/login'); closeMobileMenu()"
            class="block px-3 py-2 rounded-md hover:bg-primary-700 transition-colors cursor-pointer">
            Login
          </a>
          <a @click="router.push('/register'); closeMobileMenu()"
            class="block px-3 py-2 rounded-md bg-secondary-500 hover:bg-secondary-600 transition-colors cursor-pointer">
            Register
          </a>
        </template>
      </div>
    </div>
  </nav>
</template>