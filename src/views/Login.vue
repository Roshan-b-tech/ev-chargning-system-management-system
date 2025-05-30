<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errors = ref({
  email: '',
  password: '',
  general: ''
});

const validateForm = () => {
  let isValid = true;
  errors.value = {
    email: '',
    password: '',
    general: ''
  };

  if (!email.value) {
    errors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!password.value) {
    errors.value.password = 'Password is required';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    await authStore.login(email.value, password.value);
    // No need to redirect, the store already handles this
  } catch (error: any) {
    errors.value.general = error.response?.data?.message || 'Login failed';
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-neutral-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-neutral-600">
          Or
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
            register for a new account
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div v-if="errors.general" class="bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded relative">
          {{ errors.general }}
        </div>
        
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-neutral-700">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="email"
                class="input"
                :class="{ 'border-error-500 focus:ring-error-500 focus:border-error-500': errors.email }"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-error-600">{{ errors.email }}</p>
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-neutral-700">Password</label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                v-model="password"
                class="input"
                :class="{ 'border-error-500 focus:ring-error-500 focus:border-error-500': errors.password }"
              />
              <p v-if="errors.password" class="mt-1 text-sm text-error-600">{{ errors.password }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label for="remember_me" class="ml-2 block text-sm text-neutral-700">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>