import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { apiBaseUrl } from '../config'

export interface User {
  id: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast()
  const router = useRouter()

  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(false)
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isInitialized = ref(false)

  async function initAuth() {
    if (isInitialized.value) return

    try {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        token.value = storedToken
        const response = await axios.get(`${apiBaseUrl}/auth/me`, getHeaders())
        user.value = response.data
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    } finally {
      isInitialized.value = true
    }
  }

  function getHeaders() {
    if (!token.value) {
      throw new Error('No authentication token available')
    }
    return {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    }
  }

  async function register(email: string, password: string) {
    loading.value = true
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/register`, {
        email,
        password
      })

      toast.success('Registration successful! Please log in.')
      router.push('/login')
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const loginUrl = `${apiBaseUrl}/auth/login`;
      console.log('Full login URL:', loginUrl);
      console.log('Request payload:', { email, password });

      const response = await axios.post(loginUrl, {
        email,
        password
      });

      console.log('Login response:', response.data);
      const { token: newToken, user: userData } = response.data;
      token.value = newToken;
      user.value = userData;
      localStorage.setItem('token', newToken);
      isInitialized.value = true;

      toast.success('Login successful!');
      router.push('/dashboard');
      return userData;
    } catch (error: any) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    if (!token.value) return null

    try {
      const response = await axios.get(`${apiBaseUrl}/auth/me`, getHeaders())

      user.value = response.data
      return response.data
    } catch (error) {
      logout()
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    isInitialized.value = false
    toast.info('Logged out successfully')
    router.push('/login')
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isInitialized,
    initAuth,
    register,
    login,
    logout,
    fetchUser
  }
})