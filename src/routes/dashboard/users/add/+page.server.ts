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

        // Build payload according to API documentation
        const payload: any = {
            email,
            password,
            name,
            address,
            phone_number: phoneNumber,
            role_id: roleId
        };

        // Only include NIK if it's provided and valid
        if (cleanNik) {
            payload.nik = cleanNik;
        }

        try {
            console.log('🚀 Making API request to create user...');
            const response = await axios.post('/users', payload);
            console.log('✅ API Response Status:', response.status);
            console.log('✅ API Response Data:', response.data);

            // Check for successful response (2xx status codes)
            if (response.status >= 200 && response.status < 300) {
                if (response.data?.data) {
                    const newUser = response.data.data;
                    console.log('👤 New user created with ID:', newUser.id, 'Email:', newUser.email);
                } else {
                    console.log('✅ User created successfully (no data field in response)');
                }

                // Successful creation - redirect with success message
                throw redirect(303, '/dashboard/users?success=User berhasil ditambahkan');
            } else {
                // This shouldn't happen since axios would throw for non-2xx
                console.warn('⚠️ Unexpected response status:', response.status);
                throw redirect(303, '/dashboard/users?success=User berhasil ditambahkan');
            }
        } catch (error: any) {
            // Check if this is a redirect (success case)
            if (error.status === 303) {
                throw error; // Re-throw the redirect
            }

            console.error('❌ Add user error:', error.response?.data);
            console.error('🔍 Full error object:', error);
            console.log('📊 Error status:', error.response?.status);

            // Handle specific API errors based on new response format
            let errorMessage = 'Gagal menambahkan user';

            // Check for specific status codes
            if (error.response?.status === 409) {
                const apiError = error.response?.data?.error || '';
                // Check if it's a NIK or email duplicate
                if (apiError.includes('nik') || apiError.includes('NIK') || apiError.includes('uni_users_nik')) {
                    errorMessage = 'NIK sudah terdaftar dalam sistem. Silakan gunakan NIK yang berbeda.';
                } else {
                    errorMessage = 'Email sudah terdaftar dalam sistem. Silakan gunakan email yang berbeda.';
                }
            }
            else if (error.response?.data?.error) {
                const apiError = error.response.data.error;
                console.log('🔍 API Error received:', apiError);

                // Handle specific error messages from the new API format
                if (apiError === 'NIK already exists') {
                    errorMessage = 'NIK sudah terdaftar dalam sistem. Silakan gunakan NIK yang berbeda.';
                }
                else if (apiError === 'Email already exists' || apiError.includes('email already') || apiError.includes('Email already')) {
                    errorMessage = 'Email sudah terdaftar dalam sistem. Silakan gunakan email yang berbeda.';
                }
                else if (apiError === 'Invalid role' || apiError.includes('role')) {
                    errorMessage = 'Role yang dipilih tidak valid.';
                }
                else if (apiError.includes('password')) {
                    errorMessage = 'Password tidak memenuhi kriteria. Minimal 6 karakter.';
                }
                else if (apiError.includes('validation')) {
                    errorMessage = 'Data yang dikirim tidak valid. Silakan periksa kembali form.';
                }
                else {
                    // Use the error message as-is for other cases, but make it user-friendly
                    errorMessage = `Gagal membuat user: ${apiError}`;
                }
            }
            // Fallback for other error formats
            else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            // Handle network or other errors
            else if (error.message) {
                errorMessage = `Terjadi kesalahan koneksi: ${error.message}`;
            }

            console.log('💬 About to return error message:', errorMessage);
            console.log('🔍 Error response status:', error.response?.status);

            // Return a simple fail response
            return fail(400, {
                error: errorMessage
            });
        }
    }
};
