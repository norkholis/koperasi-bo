import Axios from 'axios';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

const axios = Axios.create({
    baseURL: import.meta.env.PUBLIC_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Enhanced request interceptor with comprehensive logging
axios.interceptors.request.use((config) => {
    const isServer = !browser;
    const timestamp = new Date().toISOString();

    // Add token
    if (browser) {
        const t = localStorage.getItem('token');
        if (t) config.headers.Authorization = `Bearer ${t}`;
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
            goto('/login');
        }
        return Promise.reject(err);
    }
);

export default axios;