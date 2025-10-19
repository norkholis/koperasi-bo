import axios from '$lib/api';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
    update: async ({ request, params }) => {
        const fd = await request.formData();
        const payload: any = {};

        // Only include fields that have values
        const email = fd.get('email') as string;
        const password = fd.get('password') as string;
        const roleId = fd.get('role_id') as string;
        const fullName = fd.get('full_name') as string;
        const phone = fd.get('phone') as string;
        const address = fd.get('address') as string;
        const isActive = fd.get('is_active') === 'on';

        if (email) payload.email = email;
        if (password) payload.password = password;
        if (roleId) payload.role_id = Number(roleId);
        if (fullName) payload.full_name = fullName;
        if (phone) payload.phone = phone;
        if (address) payload.address = address;
        payload.is_active = isActive;

        try {
            await axios.put(`/users/${params.id}`, payload);
            throw redirect(303, '/dashboard/users');
        } catch (error: any) {
            console.error('Update user error:', error.response?.data);
            return fail(400, {
                error: error.response?.data?.message || 'Gagal mengupdate user'
            });
        }
    }
};