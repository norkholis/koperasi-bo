import axios from '$lib/api';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request }) => {
        const fd = await request.formData();
        const payload = {
            email: fd.get('email'),
            password: fd.get('password'),
            role_id: Number(fd.get('role_id'))
        };
        await axios.post('/register', payload);
        throw redirect(303, '/dashboard/users');
    }
};