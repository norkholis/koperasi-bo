import axios from '$lib/api';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request }) => {
        const fd = await request.formData();

        const email = fd.get('email') as string;
        const password = fd.get('password') as string;
        const roleId = Number(fd.get('role_id'));
        const name = fd.get('name') as string;
        const phoneNumber = fd.get('phone_number') as string;
        const address = fd.get('address') as string;
        const nik = fd.get('nik') as string;

        // Basic validation
        if (!email || !password || !roleId || !name || !phoneNumber) {
            return fail(400, {
                error: 'Email, password, nama, telepon, dan role harus diisi'
            });
        }

        if (password.length < 6) {
            return fail(400, {
                error: 'Password minimal 6 karakter'
            });
        }

        // NIK validation (16 digits) - only validate if provided
        let cleanNik = '';
        if (nik && nik.trim()) {
            cleanNik = nik.trim().replace(/\s+/g, '');
            if (!/^\d{16}$/.test(cleanNik)) {
                return fail(400, {
                    error: `NIK harus 16 digit angka. Anda memasukkan ${cleanNik.length} karakter: "${cleanNik}"`
                });
            }
        }

        const payload: any = {
            email,
            password,
            role_id: roleId,
            name,
            phone_number: phoneNumber,
            address
        };

        // Only include NIK if it's provided
        if (cleanNik) {
            payload.nik = cleanNik;
        }

        try {
            await axios.post('/users', payload);
            throw redirect(303, '/dashboard/users');
        } catch (error: any) {
            console.error('Add user error:', error.response?.data);
            return fail(400, {
                error: error.response?.data?.message || 'Gagal menambahkan user'
            });
        }
    }
};
