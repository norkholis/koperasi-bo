import axios from '$lib/api';
import type { User, ApiResponse } from '$lib/types';
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
        console.log('Current user:', user.email, 'Role:', user.role.name, 'ID:', user.id);

        // server-side call -> no CORS preflight
        const response = await axios.get<ApiResponse<User[]>>('/users');
        console.log('✅ Users API response received');
        console.log('Response data:', response.data);

        let users = response.data.data || [];
        console.log('Number of users before filtering:', users.length);

        // Role-based filtering
        if (user.role.name === 'admin') {
            // Admin can only see users under their admin_id
            users = users.filter(u => u.admin_id === user.id || u.id === user.id);
            console.log('🔒 Admin filtering applied. Users after filtering:', users.length);
        } else if (user.role.name === 'super_admin') {
            // Super admin can see all users
            console.log('👑 Super admin - showing all users');
        }

        // Add role information to users for display
        const usersWithRoles = users.map(u => ({
            ...u,
            role: {
                id: u.role_id,
                name: u.role_id === 1 ? 'super_admin' : u.role_id === 2 ? 'admin' : 'member'
            },
            // Add created_at fallback if missing
            created_at: u.created_at || new Date().toISOString(),
            // Ensure is_active has a default
            is_active: u.is_active !== false
        }));

        console.log('Final users to display:', usersWithRoles.length);
        console.log('Sample user after mapping:', usersWithRoles[0]);

        const returnData = {
            users: usersWithRoles,
            user
        };

        console.log('📤 RETURNING TO FRONTEND:', JSON.stringify(returnData, null, 2));
        return returnData;
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
}; import type { Actions } from '@sveltejs/kit';

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
