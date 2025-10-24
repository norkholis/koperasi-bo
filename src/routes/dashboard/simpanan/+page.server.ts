import axios from "$lib/api";
import type { Wallet, WalletTransaction } from "$lib/types";

// Transform API response to match our frontend types
function transformWallet(apiWallet: any): Wallet {
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

function transformTransaction(apiTransaction: any): WalletTransaction {
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

export const load = async ({ parent, url }: { parent: any, url: any }) => {
    const { user } = await parent();

    if (!user) {
        throw new Error("Not authenticated");
    }

    console.log("🔄 Loading simpanan data for:", url.pathname, url.search);

    try {
        const isAdmin = user.role?.name === "admin" || user.role?.name === "super_admin";

        let walletsData: Wallet[] = [];
        let pendingTransactions: WalletTransaction[] = [];

        if (isAdmin) {
            // Admin can view specific user's wallets or all wallets
            const userId = url.searchParams.get('user_id');

            if (userId && userId.trim() !== '') {
                // View specific user's wallets
                console.log("🔍 Loading wallets for user ID:", userId);
                const response = await axios.get(`/simpanan/wallets?user_id=${userId}`);
                const rawWallets = response.data.data || [];
                walletsData = rawWallets.map(transformWallet);
            } else {
                // View all wallets
                console.log("📋 Loading all wallets");
                const response = await axios.get("/simpanan/wallets/all");
                const rawWallets = response.data.data || [];
                walletsData = rawWallets.map(transformWallet);
            }

            // Get pending transactions for admin
            try {
                const pendingResponse = await axios.get("/simpanan/transactions/pending");
                const rawTransactions = pendingResponse.data.data || [];
                pendingTransactions = rawTransactions.map(transformTransaction);
            } catch (error) {
                console.log("No pending transactions or error fetching:", error);
                pendingTransactions = [];
            }
        } else {
            // Member can only view their own wallets
            console.log("👤 Loading member's own wallets");
            const response = await axios.get("/simpanan/wallets");
            const rawWallets = response.data.data || [];
            walletsData = rawWallets.map(transformWallet);
        }

        console.log("📊 Loaded wallet data:", walletsData.length, "wallets");
        console.log("👤 Current user role:", user.role?.name);
        console.log("⏳ Pending transactions:", pendingTransactions.length);

        // Debug: Log first wallet structure if exists
        if (walletsData.length > 0) {
            console.log("🔍 First wallet structure:", JSON.stringify(walletsData[0], null, 2));
        }

        return {
            wallets: walletsData,
            pendingTransactions: pendingTransactions,
            currentUser: user,
            selectedUserId: url.searchParams.get('user_id')
        };
    } catch (error) {
        console.error("Error loading wallet data:", error);
        return {
            wallets: [],
            pendingTransactions: [],
            currentUser: user,
            selectedUserId: null,
            error: "Failed to load wallet data"
        };
    }
};