import axios from '$lib/api';
import type { User } from '$lib/types';
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies }) => {
    // token dari cookie (SSR) atau fallback header
    const token = cookies.get('token') ?? axios.defaults.headers.Authorization;
    if (!token) throw redirect(303, '/login');
    try {
        axios.defaults.headers.Authorization = token;
        const response = await axios.get('/me');
        console.log('ME endpoint response:', response.data);

        let userData = response.data;

        // If the response has a 'data' wrapper, unwrap it
        if (userData.data) {
            userData = userData.data;
        }

        // Ensure role object exists for compatibility
        if (userData.role_id && !userData.role) {
            userData.role = {
                id: userData.role_id,
                name: userData.role_id === 1 ? 'super_admin' : userData.role_id === 2 ? 'admin' : 'member'
            };
        }

        console.log('Processed user data:', userData);
        return { user: userData as User };
    } catch {
        throw redirect(303, '/login');
    }
};