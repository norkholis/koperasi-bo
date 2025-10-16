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
        const { data } = await axios.get('/me');
        console.log(data);
        return { user: data as User };
    } catch {
        throw redirect(303, '/login');
    }
};