import { error } from '@sveltejs/kit';

export const load = async ({ parent }: { parent: any }) => {
    const { user } = await parent();

    // Check if user has permission to create users (admin or super_admin)
    const canManageUsers = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';

    if (!canManageUsers) {
        throw error(403, 'Access denied. Only admin and super admin can create users.');
    }

    return { user };
};