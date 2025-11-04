import type { Actions } from './$types';
import axios from '$lib/api';
import { extractErrorMessage } from '$lib/errorUtils';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        try {
            const res = await axios.post('/login', { email, password });
            const { token } = res.data;
            cookies.set('token', token, {
                path: '/',
                httpOnly: false,   // agar JS bisa baca (kalau ingin)
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 // 1 hari
            });
            return { token }; // akan dibaca di +page.svelte
        } catch (e: any) {
            // Use the new error extraction utility
            const errorMessage = extractErrorMessage(e);
            return { error: errorMessage };
        }
    }
};