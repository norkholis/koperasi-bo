import axios from '$lib/api';
import type { User } from '$lib/types';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, parent }) => {
    const { user: currentUser } = await parent();

    // Check if current user can manage users
    const canManageUsers = currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'super_admin';

    if (!canManageUsers) {
        throw error(403, 'Access denied');
    }

    try {
        const { data } = await axios.get<User>(`/users/${params.id}`);
        return {
            user: data,
            currentUser
        };
    } catch (err: any) {
        if (err.response?.status === 404) {
            throw error(404, 'User not found');
        }
        throw error(500, 'Failed to load user data');
    }
};