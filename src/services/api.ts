import axios from 'axios';

// Create axios instance with base URL
export const api = axios.create({
    baseURL: 'https://ev-chargning-system-management-system.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log('Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
); 