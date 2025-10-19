import axios from '$lib/api';
import type { User } from '$lib/types';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }) => {
    const { user } = await parent();

    // Check if user has permission to access user management
    const canManageUsers = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';

    if (!canManageUsers) {
        throw error(403, 'Access denied. Only admin and super admin can manage users.');
    }

    try {
        const { data } = await axios.get<User[]>('/users');
        return {
            users: data,
            user
        };
    } catch (err: any) {
        console.error('Error loading users:', err.response?.data || err.message);
        if (err.response?.status === 403) {
            throw error(403, 'Access denied. Insufficient permissions.');
        }
        throw error(500, 'Failed to load users data.');
    }
};