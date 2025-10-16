import type { Actions } from './$types';
import axios from '$lib/api';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request }) => {
        const fd = await request.formData();
        const payload = {
            email: fd.get('email'),
            password: fd.get('password'),
            role_id: Number(fd.get('role_id'))
        };

        try {
            await axios.post('/register', payload);
            throw redirect(303, '/login?registered=true');
        } catch (e: any) {
            return {
                error: e.response?.data?.error || 'Registrasi gagal',
                values: { email: payload.email, role_id: payload.role_id }
            };
        }
    }
};