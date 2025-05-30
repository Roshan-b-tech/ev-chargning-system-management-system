<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <form @submit.prevent="login" class="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
            <div class="mb-4">
                <label class="block mb-1 font-semibold">Email</label>
                <input v-model="email" type="email" required class="w-full px-3 py-2 border rounded" />
            </div>
            <div class="mb-4">
                <label class="block mb-1 font-semibold">Password</label>
                <input v-model="password" type="password" required class="w-full px-3 py-2 border rounded" />
            </div>
            <div v-if="error" class="mb-4 text-red-500 text-center">{{ error }}</div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useRoute } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();

const login = async () => {
    error.value = '';
    try {
        await authStore.login(email.value, password.value);
        const redirectPath = route.query.redirect as string || '/';
        router.push(redirectPath);
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Login failed';
    }
};
</script>