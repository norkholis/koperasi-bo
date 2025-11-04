import Axios from 'axios';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { extractErrorMessage, isErrorResponse } from './errorUtils';
import { showError } from '$lib/stores/notifications';

const axios = Axios.create({
    baseURL: import.meta.env.PUBLIC_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Enhanced request interceptor with comprehensive logging
axios.interceptors.request.use((config) => {
    const isServer = !browser;
    const timestamp = new Date().toISOString();

    // Add token and sync between localStorage and cookies
    if (browser) {
        const tokenFromStorage = localStorage.getItem('token');
        const tokenFromCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        const token = tokenFromStorage || tokenFromCookie;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;

            // Sync tokens if they exist
            if (tokenFromStorage && !tokenFromCookie) {
                // Set cookie from localStorage
                document.cookie = `token=${tokenFromStorage}; path=/; max-age=${60 * 60 * 24}`;
            } else if (tokenFromCookie && !tokenFromStorage) {
                // Set localStorage from cookie
                localStorage.setItem("token", tokenFromCookie);
            }
        }
    }

    // Enhanced logging
    console.log(`🌐 [${isServer ? 'SERVER' : 'CLIENT'}] ${timestamp}`);
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) {
        console.log('📦 Request Body:', config.data);
    }
    if (config.params) {
        console.log('🔍 Query Params:', config.params);
    }
    console.log('🔑 Headers:', {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers.Authorization ? 'Bearer [HIDDEN]' : 'None'
    });
    console.log('─'.repeat(50));

    return config;
});

// Enhanced response interceptor with comprehensive logging  
axios.interceptors.response.use(
    (res) => {
        const isServer = !browser;
        const timestamp = new Date().toISOString();

        console.log(`🌐 [${isServer ? 'SERVER' : 'CLIENT'}] ${timestamp}`);
        console.log(`📥 Response ${res.status} ${res.config.method?.toUpperCase()} ${res.config.url}`);
        console.log('📊 Response Data:', res.data);
        console.log('─'.repeat(50));

        // Check if response has error format or non-200 status
        if (isErrorResponse(res)) {
            const timestamp = new Date().toISOString();
            console.error(`🌐 [${isServer ? 'SERVER' : 'CLIENT'}] ${timestamp}`);
            console.error(`❌ API Error ${res.status} ${res.config.method?.toUpperCase()} ${res.config.url}`);
            console.error('💥 Error Response:', res.data);
            console.error('─'.repeat(50));

            // Extract error message using utility function
            const errorMessage = extractErrorMessage({ response: res });

            // Create a proper error object
            const error = new Error(errorMessage);
            (error as any).response = res;
            (error as any).status = res.status;
            (error as any).data = res.data;

            return Promise.reject(error);
        }

        return res;
    },
    (err) => {
        const isServer = !browser;
        const timestamp = new Date().toISOString();

        console.error(`🌐 [${isServer ? 'SERVER' : 'CLIENT'}] ${timestamp}`);
        console.error(`❌ Error ${err.response?.status || 'NETWORK'} ${err.config?.method?.toUpperCase()} ${err.config?.url}`);
        console.error('💥 Error Data:', err.response?.data || err.message);
        console.error('─'.repeat(50));

        if (err.response?.status === 401 && browser) {
            localStorage.removeItem('token');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            showError('Session expired. Please login again.', 'Authentication Error');
            goto('/login');
        } else if (browser) {
            // Show error notification for other errors
            const errorMessage = extractErrorMessage(err);
            showError(errorMessage, 'Request Failed');
        }
        return Promise.reject(err);
    }
);

export default axios;