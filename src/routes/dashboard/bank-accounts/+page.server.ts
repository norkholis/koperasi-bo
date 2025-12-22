import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import axios from '$lib/api';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;

    if (!user) {
        throw redirect(302, '/login');
    }

    const isAdmin = user.role?.name === 'admin' || user.role?.name === 'super_admin';

    if (!isAdmin) {
        throw redirect(302, '/dashboard');
    }

    try {
        const response = await axios.get('/bank-accounts');
        const bankAccounts = response.data.data || [];

        return {
            bankAccounts,
            user
        };
    } catch (error: any) {
        console.error('Error loading bank accounts:', error);
        return {
            bankAccounts: [],
            user,
            error: error.response?.data?.message || 'Failed to load bank accounts'
        };
    }
};

export const actions: Actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const bankName = data.get('bank_name') as string;
        const accountNumber = data.get('account_number') as string;
        const accountName = data.get('account_name') as string;
        const description = data.get('description') as string;
        const isActive = data.get('is_active') === 'true';

        try {
            await axios.post('/bank-accounts', {
                bank_name: bankName,
                account_number: accountNumber,
                account_name: accountName,
                description: description || undefined,
                is_active: isActive
            });

            return { success: true, message: 'Bank account created successfully' };
        } catch (error: any) {
            console.error('Error creating bank account:', error);
            return fail(400, {
                error: error.response?.data?.message || 'Failed to create bank account'
            });
        }
    },

    update: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;
        const bankName = data.get('bank_name') as string;
        const accountNumber = data.get('account_number') as string;
        const accountName = data.get('account_name') as string;
        const description = data.get('description') as string;
        const isActive = data.get('is_active') === 'true';

        try {
            await axios.put(`/bank-accounts/${id}`, {
                bank_name: bankName,
                account_number: accountNumber,
                account_name: accountName,
                description: description || undefined,
                is_active: isActive
            });

            return { success: true, message: 'Bank account updated successfully' };
        } catch (error: any) {
            console.error('Error updating bank account:', error);
            return fail(400, {
                error: error.response?.data?.message || 'Failed to update bank account'
            });
        }
    },

    delete: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;

        try {
            await axios.delete(`/bank-accounts/${id}`);

            return { success: true, message: 'Bank account deleted successfully' };
        } catch (error: any) {
            console.error('Error deleting bank account:', error);
            return fail(400, {
                error: error.response?.data?.message || 'Failed to delete bank account'
            });
        }
    }
};
