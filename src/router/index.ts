import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChargingStationStore } from '../stores/chargingStations.ts'
import type { AxiosError } from 'axios'
import { useToast } from 'vue-toastification'

import Home from '../views/Home.vue'
import Login from '../views/LoginView.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import ChargingStationList from '../views/ChargingStationList.vue'
import ChargingStationMap from '../views/ChargingStationMap.vue'
import AddEditStation from '../views/AddEditStation.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/stations',
      name: 'stations',
      component: ChargingStationList,
      meta: { requiresAuth: true }
    },
    {
      path: '/map',
      name: 'map',
      component: ChargingStationMap,
      meta: { requiresAuth: true }
    },
    {
      path: '/station/add',
      name: 'add-station',
      component: AddEditStation,
      meta: { requiresAuth: true }
    },
    {
      path: '/station/:id/edit',
      name: 'edit-station',
      component: AddEditStation,
      meta: { requiresAuth: true },
      beforeEnter: async (to, from, next) => {
        console.group('Router: beforeEnter for edit-station');
        console.log('to.params.id:', to.params.id, 'type:', typeof to.params.id);

        const id = to.params.id;

        // Check if id is undefined, null, or empty string
        if (!id) {
          console.log('Result: No ID provided. Redirecting to stations.');
          console.groupEnd();
          next({ name: 'stations' });
          return;
        }

        // Check if id is a valid string
        if (typeof id !== 'string') {
          console.log('Result: Invalid ID type. Redirecting to stations.');
          console.groupEnd();
          next({ name: 'stations' });
          return;
        }

        // Check if id is a non-empty string
        if (id.trim() === '') {
          console.log('Result: Empty ID string. Redirecting to stations.');
          console.groupEnd();
          next({ name: 'stations' });
          return;
        }

        // Additional check for 'undefined' string
        if (id === 'undefined') {
          console.log('Result: ID is string "undefined". Redirecting to stations.');
          console.groupEnd();
          next({ name: 'stations' });
          return;
        }

        // Additional check for 'null' string
        if (id === 'null') {
          console.log('Result: ID is string "null". Redirecting to stations.');
          console.groupEnd();
          next({ name: 'stations' });
          return;
        }

        console.log('Result: Valid string ID found. Proceeding.');
        console.groupEnd();
        next();
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not already initialized
  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }

  const isLoggedIn = authStore.isAuthenticated

  // Handle authentication requirements
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresGuest && isLoggedIn) {
    next({ name: 'dashboard' })
    return
  }

  // If not logged in and trying to access a protected route
  if (!isLoggedIn && !to.meta.requiresGuest) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Remove force refresh logic as it's handled by :key on router-view in App.vue
  // if (to.path === from.path) {
  //   next({ path: to.path, query: to.query, force: true })
  //   return
  // }

  // Remove data loading logic from here; individual views will fetch data on mount
  // if (to.meta.requiresData && isLoggedIn) {
  //   try {
  //     if (stationStore.stations.length === 0 || !from.meta.requiresData) {
  //       await stationStore.fetchStations()
  //     }
  //   } catch (error: unknown) {
  //     console.error('Error loading data:', error)
  //     if ((error as AxiosError)?.response?.status === 401) {
  //       next({ name: 'login', query: { redirect: to.fullPath } })
  //       return
  //     }
  //   }
  // }

  next()
})

export default router