import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ cookies }) => {
        // Remove the token cookie
        cookies.delete('token', { path: '/' });

        // Redirect to login page
        throw redirect(303, '/login');
    }
};