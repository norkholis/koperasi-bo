import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import axios from '$lib/api';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('token');
    const url = event.url;

    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));

    // If no token and trying to access protected route, redirect to login
    if (!token && !isPublicRoute && url.pathname !== '/') {
        throw redirect(303, '/login');
    }

    // If token exists and trying to access login page, redirect to dashboard
    if (token && (url.pathname === '/login' || url.pathname === '/register')) {
        throw redirect(303, '/dashboard');
    }

    // For root path (/), handle redirection based on token
    if (url.pathname === '/') {
        if (token) {
            // Verify token is valid before redirecting to dashboard
            try {
                axios.defaults.headers.Authorization = `Bearer ${token}`;
                await axios.get('/me');
                throw redirect(303, '/dashboard');
            } catch (error) {
                // Token is invalid, remove it and redirect to login
                event.cookies.delete('token', { path: '/' });
                throw redirect(303, '/login');
            }
        } else {
            // No token, redirect to login
            throw redirect(303, '/login');
        }
    }

    // If token exists, validate it and add user info to locals
    if (token && !isPublicRoute) {
        try {
            axios.defaults.headers.Authorization = `Bearer ${token}`;
            const response = await axios.get('/me');

            let userData = response.data;
            if (userData.data) {
                userData = userData.data;
            }

            // Ensure role object exists for compatibility
            if (userData.role_id && !userData.role) {
                userData.role = {
                    id: userData.role_id,
                    name: userData.role_id === 1 ? 'super_admin' :
                        userData.role_id === 2 ? 'admin' : 'member'
                };
            }

            event.locals.user = userData;
        } catch (error) {
            // Token is invalid, remove it and redirect to login
            event.cookies.delete('token', { path: '/' });
            throw redirect(303, '/login');
        }
    }

    return resolve(event);
};