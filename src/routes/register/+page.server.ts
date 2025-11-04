import type { Actions } from './$types';
import axios from '$lib/api';
import { redirect } from '@sveltejs/kit';
import { extractErrorMessage } from '$lib/errorUtils';

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
            // Use the new error extraction utility
            const errorMessage = extractErrorMessage(e);
            return {
                error: errorMessage,
                values: { email: payload.email, role_id: payload.role_id }
            };
        }
    }
};