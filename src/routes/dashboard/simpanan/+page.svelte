<script lang="ts">
    import type {
        Wallet,
        WalletTransaction,
        TopupRequest,
        BalanceAdjustment,
    } from "$lib/types";
    import { page } from "$app/stores";
    import { invalidateAll, goto } from "$app/navigation";
    import axios from "$lib/api";
    import { onMount } from "svelte";
    import WalletDebugger from "$lib/components/WalletDebugger.svelte";
    import {
        showSuccess,
        showError,
        showWarning,
    } from "$lib/stores/notifications";

    export let data;

    let wallets: Wallet[] = data.wallets || [];
    let pendingTransactions: WalletTransaction[] =
        data.pendingTransactions || [];
    const currentUser = data.currentUser;
    const selectedUserId = data.selectedUserId;

    // Debug logging (only if needed)
    console.log("🚀 Simpanan page loaded");
    console.log(
        "👤 Current user:",
        currentUser?.email,
        currentUser?.role?.name,
    );
    console.log("🎯 Selected User ID:", selectedUserId);
    console.log("💼 Wallets count:", wallets.length);

    if (wallets.length > 0) {
        console.log("✅ Wallets loaded successfully:", wallets.length);
        console.log("🔍 First wallet:", wallets[0]);
    } else {
        console.log("⚠️ No wallets found");
    }

    // Check for errors
    if (data.error) {
        console.error("❌ Page data error:", data.error);
    }

    // Permission checks
    const isAdmin =
        currentUser?.role?.name === "admin" ||
        currentUser?.role?.name === "super_admin";
    const isMember = currentUser?.role?.name === "member";

    // Success message handling
    let successMessage = "";
    let showSuccessMessage = false;

    // Loading states
    let isNavigating = false;

    // Modal states
    let showTopupModal = false;
    let showBalanceAdjustModal = false;
    let showTransactionModal = false;
    let showTransactionHistoryModal = false;
    let selectedWallet: Wallet | null = null;
    let selectedTransaction: WalletTransaction | null = null;
    let transactionHistory: WalletTransaction[] = [];

    // Form data
    let topupForm: TopupRequest = {
        type: "wajib",
        amount: 0,
        description: "",
    };

    let balanceAdjustForm: BalanceAdjustment = {
        amount: 0,
        description: "",
    };

    onMount(() => {
        // Check for success message in URL params
        const success = $page.url.searchParams.get("success");
        if (success) {
            successMessage = success;
            showSuccessMessage = true;

            // Remove success param from URL
            const url = new URL($page.url);
            url.searchParams.delete("success");
            window.history.replaceState({}, "", url);

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                showSuccessMessage = false;
            }, 5000);
        }
    });

    // Format currency
    function formatCurrency(amount: number | null | undefined): string {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return "Rp 0";
        }
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    }

    // Format date
    function formatDate(dateString: string | null | undefined): string {
        if (!dateString) {
            return "Tanggal tidak tersedia";
        }
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Tanggal tidak valid";
            }
            return date.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Tanggal error";
        }
    }

    // Get wallet by type
    function getWalletByType(type: string): Wallet | undefined {
        return wallets.find((w) => w.type === type);
    }

    // Get wallet type display name
    function getWalletDisplayName(type: string): string {
        const names = {
            pokok: "Simpanan Pokok",
            wajib: "Simpanan Wajib",
            sukarela: "Simpanan Sukarela",
        };
        return names[type as keyof typeof names] || type;
    }

    // Get wallet color scheme
    function getWalletColor(type: string): string {
        const colors = {
            pokok: "bg-purple-100 text-purple-800 border-purple-200",
            wajib: "bg-blue-100 text-blue-800 border-blue-200",
            sukarela: "bg-green-100 text-green-800 border-green-200",
        };
        return (
            colors[type as keyof typeof colors] ||
            "bg-gray-100 text-gray-800 border-gray-200"
        );
    }

    // Modal functions
    function openTopupModal(walletType: "pokok" | "wajib" | "sukarela") {
        topupForm = {
            type: walletType,
            amount: 0,
            description: "",
        };
        showTopupModal = true;
    }

    function openBalanceAdjustModal(wallet: Wallet) {
        console.log("🔧 Opening balance adjust modal for wallet:", wallet);
        console.log("🔍 Wallet ID:", wallet?.id);
        console.log("🔍 Wallet type:", wallet?.type);
        console.log("🔍 Wallet structure:", JSON.stringify(wallet, null, 2));

        selectedWallet = wallet;
        balanceAdjustForm = {
            amount: 0,
            description: `Balance adjustment for ${getWalletDisplayName(wallet.type)}`,
        };
        showBalanceAdjustModal = true;
    }

    function openTransactionModal(transaction: WalletTransaction) {
        selectedTransaction = transaction;
        showTransactionModal = true;
    }

    async function openTransactionHistoryModal(wallet: Wallet) {
        selectedWallet = wallet;
        try {
            console.log(
                "🔍 Loading transaction history for wallet ID:",
                wallet.id,
            );
            const response = await axios.get(
                `/simpanan/${wallet.id}/transactions`,
            );
            console.log("📊 Raw transaction history response:", response.data);

            // Check if we have any data at all
            if (!response.data || !response.data.data) {
                console.log("⚠️ No transaction data in response");
                transactionHistory = [];
                showTransactionHistoryModal = true;
                return;
            }

            const rawTransactions = response.data.data;
            console.log("📋 Raw transactions array:", rawTransactions);
            console.log("📋 Number of transactions:", rawTransactions.length);

            if (rawTransactions.length > 0) {
                console.log("🔍 First raw transaction:", rawTransactions[0]);
                console.log(
                    "🔍 Transaction fields:",
                    Object.keys(rawTransactions[0]),
                );
            }

            // Transform the transaction data from PascalCase to snake_case
            transactionHistory = rawTransactions.map((tx: any) => {
                const transformed = {
                    id: tx.ID,
                    simpanan_id: tx.SimpananID || tx.simpanan_id,
                    amount: tx.Amount,
                    type: tx.Type,
                    description: tx.Description,
                    status: tx.Status,
                    verified_at: tx.VerifiedAt || tx.verified_at,
                    verified_by_id: tx.VerifiedByID || tx.verified_by_id,
                    created_at: tx.CreatedAt,
                    simpanan: tx.Simpanan
                        ? {
                              id: tx.Simpanan.ID,
                              user_id: tx.Simpanan.UserID,
                              type: tx.Simpanan.Type,
                          }
                        : undefined,
                };
                console.log("🔄 Transformed transaction:", transformed);
                return transformed;
            });

            console.log("✅ Final transaction history:", transactionHistory);
            showTransactionHistoryModal = true;
        } catch (error) {
            console.error("❌ Error loading transaction history:", error);
            showError("Gagal memuat riwayat transaksi");
        }
    }

    function closeModals() {
        showTopupModal = false;
        showBalanceAdjustModal = false;
        showTransactionModal = false;
        showTransactionHistoryModal = false;
        selectedWallet = null;
        selectedTransaction = null;
        transactionHistory = [];
    }

    // Navigate to user-specific wallet view
    async function viewUserWallets(wallet: Wallet) {
        console.log("🔍 Viewing wallets for user:", wallet.user_id);
        console.log("📊 Wallet details:", wallet);

        isNavigating = true;

        try {
            // Use SvelteKit's goto for proper navigation
            const url = `/dashboard/simpanan?user_id=${wallet.user_id}`;
            console.log("🚀 Navigating to:", url);
            await goto(url);
            console.log("✅ Navigation successful");
        } catch (error) {
            console.error("❌ Navigation error:", error);
        } finally {
            isNavigating = false;
        }
    }

    // Top-up operations (Members)
    async function requestTopup() {
        try {
            await axios.post("/simpanan/topup", topupForm);

            closeModals();
            showSuccessNotification("Permintaan top-up berhasil dikirim!");

            // Refresh data
            setTimeout(async () => {
                await invalidateAll();
            }, 1000);
        } catch (error: any) {
            console.error("Error requesting topup:", error);
            showError(
                `Gagal mengajukan top-up: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    // Balance adjustment (Admin only)
    async function adjustWalletBalance() {
        if (!selectedWallet) {
            console.error("No wallet selected for adjustment");
            showError("Tidak ada wallet yang dipilih");
            return;
        }

        // Try to find the wallet ID from different possible field names
        const walletId = selectedWallet.id;

        if (!walletId) {
            console.error("Selected wallet has no ID:", selectedWallet);
            console.error("Available fields:", Object.keys(selectedWallet));
            showError("Wallet ID tidak ditemukan. Check console for details.");
            return;
        }

        console.log("🔧 Adjusting wallet balance:", {
            walletId: walletId,
            selectedWallet: selectedWallet,
            currentBalance: selectedWallet.balance,
            adjustment: balanceAdjustForm.amount,
            description: balanceAdjustForm.description,
        });

        try {
            const response = await axios.put(
                `/simpanan/${walletId}/adjust`,
                balanceAdjustForm,
            );
            console.log("✅ Adjustment response:", response.data);

            // Update local wallet data
            wallets = wallets.map((w) =>
                w.id === walletId
                    ? {
                          ...w,
                          balance:
                              (w.balance || 0) +
                              (balanceAdjustForm.amount || 0),
                      }
                    : w,
            );

            closeModals();
            showSuccessNotification("Saldo wallet berhasil disesuaikan!");
        } catch (error: any) {
            console.error("Error adjusting wallet balance:", error);
            console.error("Error details:", error.response?.data);
            showError(
                `Gagal menyesuaikan saldo: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    // Transaction verification (Admin only)
    async function verifyTransaction(transactionId: number, approve: boolean) {
        try {
            await axios.put(`/simpanan/transactions/${transactionId}/verify`, {
                approve: approve,
            });

            // Remove from pending list
            pendingTransactions = pendingTransactions.filter(
                (t) => t.id !== transactionId,
            );

            closeModals();
            showSuccessNotification(
                `Transaksi berhasil ${approve ? "disetujui" : "ditolak"}!`,
            );

            // Refresh wallets if approved
            if (approve) {
                setTimeout(async () => {
                    await invalidateAll();
                }, 1000);
            }
        } catch (error: any) {
            console.error("Error verifying transaction:", error);
            showError(
                `Gagal memverifikasi transaksi: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    function showSuccessNotification(message: string) {
        successMessage = message;
        showSuccessMessage = true;
        setTimeout(() => {
            showSuccessMessage = false;
        }, 5000);
    }
</script>

<div class="p-6">
    <!-- Debug Panel (temporary) -->
    <div class="mb-6">
        <WalletDebugger />
    </div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold">
                {isMember
                    ? "Wallet Simpanan Saya"
                    : "Manajemen Wallet Simpanan"}
            </h1>
            {#if selectedUserId && isAdmin}
                <a
                    href="/dashboard/simpanan"
                    class="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    ← Kembali ke Semua Wallet
                </a>
            {/if}
        </div>
        {#if selectedUserId && isAdmin}
            <div class="text-sm text-gray-600">
                Menampilkan wallet untuk User ID: #{selectedUserId}
            </div>
        {/if}
    </div>

    <!-- Success Message -->
    {#if showSuccessMessage}
        <div class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex items-center">
                <svg
                    class="h-5 w-5 text-green-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                    />
                </svg>
                <p class="text-green-800 font-medium">{successMessage}</p>
                <button
                    on:click={() => (showSuccessMessage = false)}
                    class="ml-auto text-green-400 hover:text-green-600"
                    aria-label="Close success message"
                >
                    <svg
                        class="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </div>
    {/if}

    <!-- Wallet Cards (for Members or Specific User View) -->
    {#if isMember || selectedUserId}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {#each ["pokok", "wajib", "sukarela"] as walletType}
                {@const wallet = getWalletByType(walletType)}
                <div
                    class="bg-white rounded-lg shadow-md border-2 {getWalletColor(
                        walletType,
                    )} p-6"
                >
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">
                            {getWalletDisplayName(walletType)}
                        </h3>
                        <div
                            class="text-sm px-2 py-1 rounded-full {getWalletColor(
                                walletType,
                            )}"
                        >
                            {walletType.toUpperCase()}
                        </div>
                    </div>

                    <div class="mb-4">
                        <p class="text-sm text-gray-600 mb-1">Saldo Saat Ini</p>
                        <p class="text-2xl font-bold text-gray-900">
                            {wallet
                                ? formatCurrency(wallet.balance)
                                : formatCurrency(0)}
                        </p>
                    </div>

                    {#if wallet}
                        <div class="text-xs text-gray-500 mb-4">
                            Diperbarui: {formatDate(wallet.updated_at)}
                        </div>

                        <div class="flex gap-2 flex-wrap">
                            {#if isMember}
                                <button
                                    on:click={() =>
                                        openTopupModal(
                                            walletType as
                                                | "pokok"
                                                | "wajib"
                                                | "sukarela",
                                        )}
                                    class="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Top Up
                                </button>
                            {:else if isAdmin}
                                <button
                                    on:click={() =>
                                        openBalanceAdjustModal(wallet)}
                                    class="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                >
                                    Sesuaikan Saldo
                                </button>
                            {/if}
                            {#if wallet}
                                <button
                                    on:click={() =>
                                        openTransactionHistoryModal(wallet)}
                                    class="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                    Riwayat
                                </button>
                            {/if}
                        </div>
                    {:else}
                        <div class="text-center py-4">
                            <p class="text-gray-500 text-sm mb-3">
                                Wallet belum tersedia
                            </p>
                            <p class="text-xs text-gray-400">
                                Wallet akan dibuat otomatis saat registrasi
                            </p>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    <!-- Pending Transactions for Admin -->
    {#if isAdmin && pendingTransactions.length > 0}
        <div class="bg-white rounded-lg shadow-md mb-6">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">
                    Permintaan Top-Up Menunggu Persetujuan
                    <span
                        class="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full"
                    >
                        {pendingTransactions.length}
                    </span>
                </h2>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Tanggal</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >User</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Wallet</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Jumlah</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Keterangan</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Aksi</th
                            >
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each pendingTransactions as transaction}
                            <tr class="hover:bg-gray-50">
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    {formatDate(transaction.created_at)}
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    #{transaction.simpanan?.user_id ||
                                        "Unknown"}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        class="px-2 py-1 text-xs rounded-full {getWalletColor(
                                            transaction.simpanan?.type || '',
                                        )}"
                                    >
                                        {getWalletDisplayName(
                                            transaction.simpanan?.type || "",
                                        )}
                                    </span>
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900"
                                >
                                    {formatCurrency(transaction.amount)}
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-600">
                                    {transaction.description}
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                                >
                                    <div class="flex gap-2">
                                        <button
                                            on:click={() =>
                                                verifyTransaction(
                                                    transaction.id,
                                                    true,
                                                )}
                                            class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                        >
                                            Setujui
                                        </button>
                                        <button
                                            on:click={() =>
                                                verifyTransaction(
                                                    transaction.id,
                                                    false,
                                                )}
                                            class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        >
                                            Tolak
                                        </button>
                                        <button
                                            on:click={() =>
                                                openTransactionModal(
                                                    transaction,
                                                )}
                                            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            Detail
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}

    <!-- All Wallets Table for Admin (when not viewing specific user) -->
    {#if isAdmin && !selectedUserId && wallets.length > 0}
        <div class="bg-white rounded-lg shadow-md">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">
                    Semua Wallet Pengguna
                </h2>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >User ID</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Jenis Wallet</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Saldo</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Terakhir Update</th
                            >
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >Aksi</th
                            >
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each wallets as wallet}
                            <tr class="hover:bg-gray-50">
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    #{wallet.user_id}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        class="px-2 py-1 text-xs rounded-full {getWalletColor(
                                            wallet.type,
                                        )}"
                                    >
                                        {getWalletDisplayName(wallet.type)}
                                    </span>
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900"
                                >
                                    {formatCurrency(wallet.balance)}
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                                >
                                    {formatDate(wallet.updated_at)}
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                                >
                                    <div class="flex gap-2">
                                        <button
                                            on:click={() =>
                                                openBalanceAdjustModal(wallet)}
                                            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            Sesuaikan
                                        </button>
                                        <button
                                            on:click={() =>
                                                openTransactionHistoryModal(
                                                    wallet,
                                                )}
                                            class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                        >
                                            Riwayat
                                        </button>
                                        <button
                                            on:click={() =>
                                                viewUserWallets(wallet)}
                                            disabled={isNavigating}
                                            class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {#if isNavigating}
                                                Loading...
                                            {:else}
                                                Lihat Detail
                                            {/if}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}

    <!-- Empty State -->
    {#if wallets.length === 0}
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
            <div class="text-gray-400 mb-4">
                <svg
                    class="w-16 h-16 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fill-rule="evenodd"
                        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
                        clip-rule="evenodd"
                    />
                    <path d="M9 8a1 1 0 011-1h2a1 1 0 110 2h-2A1 1 0 019 8z" />
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Wallet
            </h3>
            <p class="text-gray-600">
                {isMember
                    ? "Wallet Anda akan dibuat otomatis. Silahkan hubungi admin jika ada pertanyaan."
                    : "Belum ada data wallet untuk ditampilkan."}
            </p>
        </div>
    {/if}
</div>

<!-- Top-up Modal (Members) -->
{#if showTopupModal}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            on:click|stopPropagation
        >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Top-Up {getWalletDisplayName(topupForm.type)}
            </h3>

            <form on:submit|preventDefault={requestTopup} class="space-y-4">
                <!-- Wallet Type -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Simpanan
                    </label>
                    <select
                        bind:value={topupForm.type}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pokok">Simpanan Pokok</option>
                        <option value="wajib">Simpanan Wajib</option>
                        <option value="sukarela">Simpanan Sukarela</option>
                    </select>
                </div>

                <!-- Amount -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Top-Up (Rp)
                    </label>
                    <input
                        type="number"
                        bind:value={topupForm.amount}
                        required
                        min="1000"
                        step="1000"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Minimal Rp 1.000"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        Minimum top-up adalah Rp 1.000
                    </p>
                </div>

                <!-- Description -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Keterangan
                    </label>
                    <textarea
                        bind:value={topupForm.description}
                        required
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Alasan atau keterangan top-up..."
                    ></textarea>
                </div>

                <div
                    class="bg-yellow-50 border border-yellow-200 rounded-md p-3"
                >
                    <p class="text-sm text-yellow-800">
                        ⚠️ Permintaan top-up akan diproses oleh admin. Harap
                        tunggu konfirmasi.
                    </p>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Ajukan Top-Up
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Balance Adjustment Modal (Admin) -->
{#if showBalanceAdjustModal && selectedWallet}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            on:click|stopPropagation
        >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Sesuaikan Saldo {getWalletDisplayName(selectedWallet.type)}
            </h3>

            <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">Saldo Saat Ini:</p>
                <p class="text-xl font-bold text-gray-900">
                    {formatCurrency(selectedWallet.balance)}
                </p>
                <p class="text-xs text-gray-500">
                    User ID: #{selectedWallet.user_id}
                </p>
            </div>

            <form
                on:submit|preventDefault={adjustWalletBalance}
                class="space-y-4"
            >
                <!-- Amount (can be positive or negative) -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Penyesuaian (Rp)
                    </label>
                    <input
                        type="number"
                        bind:value={balanceAdjustForm.amount}
                        required
                        step="1000"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Positif untuk menambah, negatif untuk mengurangi"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        Gunakan angka positif untuk menambah saldo, negatif
                        untuk mengurangi
                    </p>
                </div>

                <!-- Description -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Keterangan Penyesuaian
                    </label>
                    <textarea
                        bind:value={balanceAdjustForm.description}
                        required
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    ></textarea>
                </div>

                <!-- Preview -->
                <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p class="text-sm text-blue-800">
                        <strong>Saldo Baru:</strong>
                        {formatCurrency(
                            selectedWallet.balance + balanceAdjustForm.amount,
                        )}
                    </p>
                </div>

                <div class="bg-red-50 border border-red-200 rounded-md p-3">
                    <p class="text-sm text-red-800">
                        ⚠️ Penyesuaian saldo akan langsung diterapkan dan
                        tercatat dalam riwayat transaksi.
                    </p>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        Sesuaikan Saldo
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Transaction Detail Modal -->
{#if showTransactionModal && selectedTransaction}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            on:click|stopPropagation
        >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Detail Transaksi
            </h3>

            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">ID Transaksi</p>
                        <p class="font-medium">#{selectedTransaction.id}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">User ID</p>
                        <p class="font-medium">
                            #{selectedTransaction.simpanan?.user_id}
                        </p>
                    </div>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Jenis Wallet</p>
                    <span
                        class="inline-block px-2 py-1 text-xs rounded-full {getWalletColor(
                            selectedTransaction.simpanan?.type || '',
                        )}"
                    >
                        {getWalletDisplayName(
                            selectedTransaction.simpanan?.type || "",
                        )}
                    </span>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Jenis Transaksi</p>
                    <p class="text-gray-900 capitalize">
                        {selectedTransaction.type}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Jumlah</p>
                    <p class="text-xl font-bold text-gray-900">
                        {formatCurrency(selectedTransaction.amount)}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Keterangan</p>
                    <p class="text-gray-900">
                        {selectedTransaction.description}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Tanggal Permintaan</p>
                    <p class="text-gray-900">
                        {formatDate(selectedTransaction.created_at)}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Status</p>
                    <span
                        class="inline-block px-2 py-1 text-xs rounded-full
                        {selectedTransaction.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : selectedTransaction.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'}"
                    >
                        {selectedTransaction.status === "pending"
                            ? "Menunggu Persetujuan"
                            : selectedTransaction.status === "verified"
                              ? "Disetujui"
                              : "Ditolak"}
                    </span>
                </div>
            </div>

            <div class="flex justify-between gap-3 pt-6">
                <button
                    on:click={closeModals}
                    class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                    Tutup
                </button>
                {#if isAdmin && selectedTransaction.status === "pending"}
                    <div class="flex gap-2">
                        <button
                            on:click={() =>
                                selectedTransaction &&
                                verifyTransaction(selectedTransaction.id, true)}
                            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            Setujui
                        </button>
                        <button
                            on:click={() =>
                                selectedTransaction &&
                                verifyTransaction(
                                    selectedTransaction.id,
                                    false,
                                )}
                            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Tolak
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Transaction History Modal -->
{#if showTransactionHistoryModal && selectedWallet}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            on:click|stopPropagation
        >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Riwayat Transaksi - {getWalletDisplayName(selectedWallet.type)}
            </h3>

            {#if transactionHistory.length > 0}
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                    >Tanggal</th
                                >
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                    >Jenis</th
                                >
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                    >Jumlah</th
                                >
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                    >Status</th
                                >
                                <th
                                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                    >Keterangan</th
                                >
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each transactionHistory as transaction}
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-2 text-sm text-gray-900">
                                        {formatDate(transaction.created_at)}
                                    </td>
                                    <td
                                        class="px-4 py-2 text-sm text-gray-900 capitalize"
                                    >
                                        {transaction.type}
                                    </td>
                                    <td
                                        class="px-4 py-2 text-sm font-semibold
                                        {transaction.amount > 0
                                            ? 'text-green-600'
                                            : 'text-red-600'}"
                                    >
                                        {transaction.amount > 0
                                            ? "+"
                                            : ""}{formatCurrency(
                                            transaction.amount,
                                        )}
                                    </td>
                                    <td class="px-4 py-2">
                                        <span
                                            class="px-2 py-1 text-xs rounded-full
                                            {transaction.status === 'pending'
                                                ? 'bg-orange-100 text-orange-800'
                                                : transaction.status ===
                                                    'verified'
                                                  ? 'bg-green-100 text-green-800'
                                                  : 'bg-red-100 text-red-800'}"
                                        >
                                            {transaction.status === "pending"
                                                ? "Pending"
                                                : transaction.status ===
                                                    "verified"
                                                  ? "Verified"
                                                  : "Rejected"}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2 text-sm text-gray-600">
                                        {transaction.description}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <div class="text-center py-8">
                    <p class="text-gray-500">
                        Belum ada riwayat transaksi untuk wallet ini.
                    </p>
                </div>
            {/if}

            <div class="flex justify-end pt-4">
                <button
                    on:click={closeModals}
                    class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
{/if}
