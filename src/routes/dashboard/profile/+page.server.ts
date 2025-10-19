import axios from '$lib/api';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
    updateProfile: async ({ request, cookies }) => {
        const fd = await request.formData();
        const payload: any = {};

        const fullName = fd.get('full_name') as string;
        const phone = fd.get('phone') as string;
        const address = fd.get('address') as string;
        const email = fd.get('email') as string;

        if (fullName) payload.full_name = fullName;
        if (phone) payload.phone = phone;
        if (address) payload.address = address;
        if (email) payload.email = email;

        try {
            await axios.put('/me/profile', payload);
            return { success: 'Profile berhasil diupdate' };
        } catch (error: any) {
            console.error('Update profile error:', error.response?.data);
            return fail(400, {
                error: error.response?.data?.message || 'Gagal mengupdate profile'
            });
        }
    },

    changePassword: async ({ request }) => {
        const fd = await request.formData();
        const currentPassword = fd.get('current_password') as string;
        const newPassword = fd.get('new_password') as string;
        const confirmPassword = fd.get('confirm_password') as string;

        if (newPassword !== confirmPassword) {
            return fail(400, {
                passwordError: 'Konfirmasi password tidak cocok'
            });
        }

        try {
            await axios.put('/me/password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            return { passwordSuccess: 'Password berhasil diubah' };
        } catch (error: any) {
            console.error('Change password error:', error.response?.data);
            return fail(400, {
                passwordError: error.response?.data?.message || 'Gagal mengubah password'
            });
        }
    }
};