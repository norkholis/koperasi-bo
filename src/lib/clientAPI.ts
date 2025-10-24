import axios from '$lib/api';
import { browser } from '$app/environment';

/**
 * Client-side API calls that will appear in browser DevTools
 * Use these functions when you want to see requests in Network tab
 */

// Transform API response to match our frontend types
function transformWallet(apiWallet: any) {
    return {
        id: apiWallet.ID,
        user_id: apiWallet.UserID,
        type: apiWallet.Type,
        balance: apiWallet.Balance,
        description: apiWallet.Description,
        created_at: apiWallet.CreatedAt,
        updated_at: apiWallet.UpdatedAt
    };
}

function transformTransaction(apiTransaction: any) {
    return {
        id: apiTransaction.ID,
        simpanan_id: apiTransaction.SimpananID || apiTransaction.simpanan_id,
        amount: apiTransaction.Amount,
        type: apiTransaction.Type,
        description: apiTransaction.Description,
        status: apiTransaction.Status,
        verified_at: apiTransaction.VerifiedAt || apiTransaction.verified_at,
        verified_by_id: apiTransaction.VerifiedByID || apiTransaction.verified_by_id,
        created_at: apiTransaction.CreatedAt,
        simpanan: apiTransaction.Simpanan ? transformWallet(apiTransaction.Simpanan) : undefined
    };
}

export const clientAPI = {
    // Users
    async getUsers() {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Fetching users...');
        return await axios.get('/users');
    },

    async createUser(userData: any) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Creating user...', userData);
        return await axios.post('/users', userData);
    },

    async updateUser(id: number, userData: any) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Updating user...', id, userData);
        return await axios.put(`/users/${id}`, userData);
    },

    async deleteUser(id: number) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Deleting user...', id);
        return await axios.delete(`/users/${id}`);
    },

    // Simpanan/Wallets
    async getWallets(userId?: string) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Fetching wallets...', userId ? `for user ${userId}` : 'own wallets');
        const url = userId ? `/simpanan/wallets?user_id=${userId}` : '/simpanan/wallets';
        const response = await axios.get(url);

        // Transform the response
        if (response.data?.data) {
            response.data.data = response.data.data.map(transformWallet);
        }
        return response;
    },

    async getAllWallets() {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Fetching all wallets...');
        const response = await axios.get('/simpanan/wallets/all');

        // Transform the response
        if (response.data?.data) {
            response.data.data = response.data.data.map(transformWallet);
        }
        return response;
    },

    async requestTopup(data: any) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Requesting topup...', data);
        return await axios.post('/simpanan/topup', data);
    },

    async verifyTransaction(transactionId: number, approve: boolean) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Verifying transaction...', transactionId, approve);
        return await axios.put(`/simpanan/transactions/${transactionId}/verify`, { approve });
    },

    async adjustWalletBalance(walletId: number, data: any) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Adjusting wallet balance...', walletId, data);
        return await axios.put(`/simpanan/${walletId}/adjust`, data);
    },

    async getTransactionHistory(walletId: number) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Fetching transaction history...', walletId);
        const response = await axios.get(`/simpanan/${walletId}/transactions`);

        // Transform the response
        if (response.data?.data) {
            response.data.data = response.data.data.map(transformTransaction);
        }
        return response;
    },

    async getPendingTransactions() {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Fetching pending transactions...');
        const response = await axios.get('/simpanan/transactions/pending');

        // Transform the response
        if (response.data?.data) {
            response.data.data = response.data.data.map(transformTransaction);
        }
        return response;
    },

    // Profile
    async getProfile() {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Fetching profile...');
        return await axios.get('/me');
    },

    async updateProfile(data: any) {
        if (!browser) throw new Error('This function can only be called on the client side');
        console.log('🖥️ CLIENT: Updating profile...', data);
        return await axios.put('/me', data);
    }
};

// Utility to refresh data client-side (will appear in DevTools)
export async function refreshPageData(endpoint: string) {
    if (!browser) return;

    console.log('🔄 CLIENT: Refreshing data from', endpoint);
    try {
        const response = await axios.get(endpoint);
        console.log('✅ CLIENT: Data refreshed successfully');
        return response.data;
    } catch (error) {
        console.error('❌ CLIENT: Failed to refresh data', error);
        throw error;
    }
}