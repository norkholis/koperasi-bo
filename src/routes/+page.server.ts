import { redirect } from '@sveltejs/kit';
import axios from '$lib/api';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');

    if (token) {
        try {
            // Verify token is valid
            axios.defaults.headers.Authorization = `Bearer ${token}`;
            await axios.get('/me');

            // Token is valid, redirect to dashboard
            throw redirect(303, '/dashboard');
        } catch (error) {
            // Token is invalid, remove it and let client handle the redirect
            cookies.delete('token', { path: '/' });
        }
    }

    // No token or invalid token - let the client-side component handle the redirect
    // This allows for localStorage token checking on the client side
    return {};
};
