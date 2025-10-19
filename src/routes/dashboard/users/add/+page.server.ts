import axios from '$lib/api';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const fd = await request.formData();

        // Get form data
        const email = fd.get('email') as string;
        const password = fd.get('password') as string;
        const roleId = Number(fd.get('role_id'));
        const fullName = fd.get('full_name') as string;
        const phone = fd.get('phone') as string;
        const address = fd.get('address') as string;

        // Basic validation
        if (!email || !password || !roleId) {
            return fail(400, {
                error: 'Email, password, dan role harus diisi'
            });
        }

        if (password.length < 6) {
            return fail(400, {
                error: 'Password minimal 6 karakter'
            });
        }

        const payload: any = {
            email,
            password,
            role_id: roleId
        };

        // Add optional fields
        if (fullName) payload.full_name = fullName;
        if (phone) payload.phone = phone;
        if (address) payload.address = address;

        try {
            await axios.post('/users', payload);
            throw redirect(303, '/dashboard/users');
        } catch (error: any) {
            console.error('Create user error:', error.response?.data);
            return fail(400, {
                error: error.response?.data?.message || 'Gagal membuat user baru'
            });
        }
    }
};