import axios from '$lib/api';
import type { User } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load = async ({ parent }: { parent: any }) => {
    const { user } = await parent();

    // Check permissions
    const canManageUsers = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';
    if (!canManageUsers) {
        throw error(403, 'Access denied. Only admin and super admin can manage users.');
    }

    try {
        console.log('🔍 Attempting to fetch users...');
        console.log('Current user:', user.email, 'Role:', user.role.name);

        // server-side call -> no CORS preflight
        const response = await axios.get<User[]>('/users');
        console.log('✅ Users API response received');
        console.log('Response data:', response.data);
        console.log('Number of users:', Array.isArray(response.data) ? response.data.length : 'Not an array');

        return {
            users: response.data || [],
            user
        };
    } catch (err: any) {
        console.error('❌ Server load users error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        console.error('Error message:', err.message);

        if (err.response?.status === 403) {
            throw error(403, 'Access denied. Insufficient permissions.');
        }
        if (err.response?.status === 404) {
            throw error(404, 'Users endpoint not found. Check API configuration.');
        }
        throw error(500, `Failed to load users data: ${err.message}`);
    }
};

import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
    delete: async ({ request }) => {
        const fd = await request.formData();
        const id = fd.get('id');
        if (!id) return { success: false };
        try {
            await axios.delete(`/users/${id}`);
            return { success: true };
        } catch (err: any) {
            console.error('Server delete user error:', err.response?.data || err.message);
            return { success: false, error: err.response?.data || err.message };
        }
    }
};
