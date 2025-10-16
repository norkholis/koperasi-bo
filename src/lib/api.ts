import Axios from 'axios';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

const axios = Axios.create({
    baseURL: import.meta.env.PUBLIC_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor -> attach token
axios.interceptors.request.use((config) => {
    if (browser) {
        const t = localStorage.getItem('token');
        if (t) config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
});

// Response interceptor -> auto logout on 401
axios.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && browser) {
            localStorage.removeItem('token');
            goto('/login');
        }
        return Promise.reject(err);
    }
);

export default axios;