<script lang="ts">
    import type {
        Wallet,
        WalletTransaction,
        TopupRequest,
        BalanceAdjustment,
        BankAccount,
    } from "$lib/types";
    import { page } from "$app/stores";
    import { invalidateAll, goto } from "$app/navigation";
    import axios from "$lib/api";
    import { onMount } from "svelte";
    import { uploadImageToCloudinary } from "$lib/cloudinary";
    // import WalletDebugger from "$lib/components/WalletDebugger.svelte";
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
    let activeBankAccounts: BankAccount[] = [];

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
    const isMember =
        currentUser?.role?.name === "member" ||
        currentUser?.role?.name === "user";

    console.log("🔐 Permission checks:", {
        roleName: currentUser?.role?.name,
        isAdmin,
        isMember,
        selectedUserId,
    });

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
        image_bukti_transfer: "",
        bank_account_id: "",
    };

    let balanceAdjustForm: BalanceAdjustment = {
        amount: 0,
        description: "",
    };

    // Image upload state
    let useFileUpload = false; // Toggle between file upload and manual URL
    let isUploading = false;
    let selectedFile: File | null = null;

    onMount(async () => {
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

        // Fetch active bank accounts for top-up
        try {
            const response = await axios.get("/bank-accounts/active");
            activeBankAccounts = response.data.data || [];
        } catch (error) {
            console.error("Failed to fetch active bank accounts:", error);
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
            image_bukti_transfer: "",
            bank_account_id: "",
        };
        // Reset upload state
        useFileUpload = false;
        selectedFile = null;
        isUploading = false;
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

    // Handle file selection and upload
    async function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            showError("File harus berupa gambar");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError("Ukuran file maksimal 5MB");
            return;
        }

        selectedFile = file;
        isUploading = true;

        try {
            const url = await uploadImageToCloudinary(file);
            topupForm.image_bukti_transfer = url;
            showSuccess("Gambar berhasil diupload!");
        } catch (error) {
            showError("Gagal mengupload gambar. Silakan coba lagi.");
            console.error("Upload error:", error);
        } finally {
            isUploading = false;
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
            const payload = {
                approve: approve === true,
            };
            console.log(
                "🔍 Verify transaction payload:",
                JSON.stringify(payload),
            );

            await axios.put(
                `/simpanan/transactions/${transactionId}/verify`,
                payload,
            );

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

<div class="p-6 animate-fade-in">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">
                    {isMember ? "Wallet Wadiah Saya" : "Manajemen Wallet Wadiah"}
                </h1>
                <p class="mt-1 text-sm text-slate-500">
                    {isMember
                        ? "Kelola simpanan pokok, wajib, dan sukarela Anda"
                        : "Lihat dan kelola wallet wadiah seluruh anggota"}
                </p>
            </div>
            {#if selectedUserId && isAdmin}
                <div class="flex items-center gap-4">
                    <span class="badge badge-info font-tabular">
                        User ID: #{selectedUserId}
                    </span>
                    <a
                        href="/dashboard/simpanan"
                        class="btn btn-secondary btn-sm"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Semua Wallet
                    </a>
                </div>
            {/if}
        </div>
    </div>

    <!-- Success Message -->
    {#if showSuccessMessage}
        <div class="alert alert-success mb-6 animate-slide-up">
            <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                />
            </svg>
            <p class="font-medium flex-1">{successMessage}</p>
            <button
                on:click={() => (showSuccessMessage = false)}
                class="btn btn-ghost btn-icon btn-sm"
                aria-label="Close success message"
            >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>
        </div>
    {/if}

    <!-- Wallet Cards (for Members or Specific User View) -->
    {#if isMember || selectedUserId}
        <!-- Debug: Show wallet cards section -->
        {console.log(
            "✅ Showing wallet cards - isMember:",
            isMember,
            "selectedUserId:",
            selectedUserId,
        )}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {#each ["pokok", "wajib", "sukarela"] as walletType, i}
                {@const wallet = getWalletByType(walletType)}
                <div
                    class="card card-interactive p-6 stagger-item {walletType === 'pokok'
                        ? 'border-l-4 border-l-teal-500'
                        : walletType === 'wajib'
                          ? 'border-l-4 border-l-amber-500'
                          : 'border-l-4 border-l-emerald-500'}"
                >
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-base font-semibold text-slate-800">
                            {getWalletDisplayName(walletType)}
                        </h3>
                        <span class="badge {walletType === 'pokok'
                            ? 'badge-primary'
                            : walletType === 'wajib'
                              ? 'badge-warning'
                              : 'badge-success'}">
                            {walletType.toUpperCase()}
                        </span>
                    </div>

                    <div class="mb-4">
                        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Saldo Saat Ini</p>
                        <p class="text-2xl font-bold text-slate-900 font-tabular">
                            {wallet
                                ? formatCurrency(wallet.balance)
                                : formatCurrency(0)}
                        </p>
                    </div>

                    {#if wallet}
                        <div class="text-xs text-slate-400 mb-5">
                            Diperbarui: {formatDate(wallet.updated_at)}
                        </div>
                    {:else}
                        <div class="text-center py-3 mb-5 rounded-lg bg-slate-50">
                            <p class="text-slate-500 text-sm mb-0.5">
                                Wallet belum tersedia
                            </p>
                            <p class="text-xs text-slate-400">
                                Wallet akan dibuat saat Top-Up pertama
                            </p>
                        </div>
                    {/if}

                    <div class="flex gap-2">
                        {#if isMember}
                            <!-- Debug: Top-Up button should be visible -->
                            {console.log(
                                `🔵 Rendering Top-Up button for ${walletType} - isMember:`,
                                isMember,
                            )}
                            <button
                                on:click={() =>
                                    openTopupModal(
                                        walletType as
                                            | "pokok"
                                            | "wajib"
                                            | "sukarela",
                                    )}
                                class="btn btn-primary btn-sm flex-1"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Top Up
                            </button>
                        {:else if isAdmin && wallet}
                            <button
                                on:click={() => openBalanceAdjustModal(wallet)}
                                class="btn btn-success btn-sm flex-1"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                Sesuaikan Saldo
                            </button>
                        {/if}
                        {#if wallet}
                            <button
                                on:click={() =>
                                    openTransactionHistoryModal(wallet)}
                                class="btn btn-ghost btn-sm flex-1"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Riwayat
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Pending Transactions for Admin -->
    {#if isAdmin && pendingTransactions.length > 0}
        <div class="card mb-6 animate-slide-up">
            <div class="px-6 py-4 border-b border-slate-200">
                <div class="flex items-center gap-3">
                    <h2 class="text-lg font-semibold text-slate-900">
                        Permintaan Top-Up Menunggu Persetujuan
                    </h2>
                    <span class="badge badge-warning">
                        {pendingTransactions.length}
                    </span>
                </div>
            </div>

            <div class="table-container" style="border: none; box-shadow: none; border-radius: 0;">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>User</th>
                            <th>Wallet</th>
                            <th>Jumlah</th>
                            <th>Keterangan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each pendingTransactions as transaction}
                            <tr>
                                <td class="whitespace-nowrap">
                                    {formatDate(transaction.created_at)}
                                </td>
                                <td class="whitespace-nowrap">
                                    <div>
                                        <p class="font-medium text-slate-900">
                                            {transaction.simpanan?.user?.name ||
                                                "Unknown"}
                                        </p>
                                        <p class="text-xs text-slate-400 font-tabular">
                                            #{transaction.simpanan?.user_id ||
                                                "-"}
                                        </p>
                                    </div>
                                </td>
                                <td class="whitespace-nowrap">
                                    <span class="badge {transaction.simpanan?.type === 'pokok'
                                        ? 'badge-primary'
                                        : transaction.simpanan?.type === 'wajib'
                                          ? 'badge-warning'
                                          : 'badge-success'}">
                                        {getWalletDisplayName(
                                            transaction.simpanan?.type || "",
                                        )}
                                    </span>
                                </td>
                                <td class="whitespace-nowrap font-tabular font-semibold text-slate-900">
                                    {formatCurrency(transaction.amount)}
                                </td>
                                <td class="text-slate-500">
                                    {transaction.description}
                                </td>
                                <td class="whitespace-nowrap">
                                    <div class="flex gap-2">
                                        <button
                                            on:click={() =>
                                                verifyTransaction(
                                                    transaction.id,
                                                    true,
                                                )}
                                            class="btn btn-success btn-sm"
                                        >
                                            Setujui
                                        </button>
                                        <button
                                            on:click={() =>
                                                verifyTransaction(
                                                    transaction.id,
                                                    false,
                                                )}
                                            class="btn btn-danger btn-sm"
                                        >
                                            Tolak
                                        </button>
                                        <button
                                            on:click={() =>
                                                openTransactionModal(
                                                    transaction,
                                                )}
                                            class="btn btn-ghost btn-sm"
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
        <div class="card animate-slide-up">
            <div class="px-6 py-4 border-b border-slate-200">
                <h2 class="text-lg font-semibold text-slate-900">
                    Semua Wallet Pengguna
                </h2>
            </div>

            <div class="table-container" style="border: none; box-shadow: none; border-radius: 0;">
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Nama User</th>
                            <th>Jenis Wallet</th>
                            <th>Saldo</th>
                            <th>Terakhir Update</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each wallets as wallet}
                            <tr>
                                <td class="whitespace-nowrap font-tabular text-slate-500">
                                    #{wallet.user_id}
                                </td>
                                <td class="whitespace-nowrap font-medium text-slate-900">
                                    {wallet.user?.name || "-"}
                                </td>
                                <td class="whitespace-nowrap">
                                    <span class="badge {wallet.type === 'pokok'
                                        ? 'badge-primary'
                                        : wallet.type === 'wajib'
                                          ? 'badge-warning'
                                          : 'badge-success'}">
                                        {getWalletDisplayName(wallet.type)}
                                    </span>
                                </td>
                                <td class="whitespace-nowrap font-tabular font-semibold text-slate-900">
                                    {formatCurrency(wallet.balance)}
                                </td>
                                <td class="whitespace-nowrap text-slate-500">
                                    {formatDate(wallet.updated_at)}
                                </td>
                                <td class="whitespace-nowrap">
                                    <div class="flex gap-2">
                                        <button
                                            on:click={() =>
                                                openBalanceAdjustModal(wallet)}
                                            class="btn btn-primary btn-sm"
                                        >
                                            Sesuaikan
                                        </button>
                                        <button
                                            on:click={() =>
                                                openTransactionHistoryModal(
                                                    wallet,
                                                )}
                                            class="btn btn-ghost btn-sm"
                                        >
                                            Riwayat
                                        </button>
                                        <button
                                            on:click={() =>
                                                viewUserWallets(wallet)}
                                            disabled={isNavigating}
                                            class="btn btn-secondary btn-sm"
                                        >
                                            {#if isNavigating}
                                                <svg class="animate-spin h-4 w-4 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
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
        <div class="card animate-slide-up">
            <div class="empty-state">
                <svg
                    class="w-16 h-16 mx-auto text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                    />
                </svg>
                <h3 class="text-lg font-semibold text-slate-700 mb-1">
                    Belum Ada Wallet
                </h3>
                <p class="text-sm text-slate-400 max-w-sm mx-auto">
                    {isMember
                        ? "Wallet Anda akan dibuat otomatis. Silahkan hubungi admin jika ada pertanyaan."
                        : "Belum ada data wallet untuk ditampilkan."}
                </p>
            </div>
        </div>
    {/if}
</div>

<!-- Top-up Drawer (Members) -->
{#if showTopupModal}
    <div
        class="drawer-overlay"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="drawer-panel"
            on:click|stopPropagation
        >
            <div class="drawer-header">
                <h3 class="text-lg font-semibold text-slate-900">
                    Top-Up {getWalletDisplayName(topupForm.type)}
                </h3>
                <button on:click={closeModals} class="btn btn-ghost btn-icon btn-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form on:submit|preventDefault={requestTopup}>
                <div class="drawer-body space-y-5">
                    <!-- Wallet Type -->
                    <div>
                        <label class="input-label">Jenis Simpanan</label>
                        <select
                            bind:value={topupForm.type}
                            required
                            class="input"
                        >
                            <option value="pokok">Wadiah Pokok</option>
                            <option value="wajib">Wadiah Wajib</option>
                            <option value="sukarela">Wadiah Sukarela</option>
                        </select>
                    </div>

                    <!-- Amount -->
                    <div>
                        <label class="input-label">Jumlah Top-Up (Rp)</label>
                        <input
                            type="number"
                            bind:value={topupForm.amount}
                            required
                            min="1000"
                            step="1000"
                            class="input font-tabular"
                            placeholder="Minimal Rp 1.000"
                        />
                        <p class="text-xs text-slate-400 mt-1.5">
                            Minimum top-up adalah Rp 1.000
                        </p>
                    </div>

                    <!-- Bank Account Selection -->
                    {#if activeBankAccounts.length > 0}
                        <div>
                            <label class="input-label">Transfer ke Rekening</label>
                            <select
                                bind:value={topupForm.bank_account_id}
                                class="input"
                            >
                                <option value="">Pilih rekening tujuan (opsional)</option>
                                {#each activeBankAccounts as bankAccount}
                                    <option
                                        value={bankAccount.id || bankAccount.ID}
                                    >
                                        {bankAccount.bank_name} - {bankAccount.account_number}
                                        ({bankAccount.account_holder_name ||
                                            bankAccount.account_name ||
                                            "-"})
                                    </option>
                                {/each}
                            </select>
                            <p class="text-xs text-slate-400 mt-1.5">
                                Pilih rekening bank tujuan transfer Anda
                            </p>
                        </div>
                    {/if}

                    <!-- Image Bukti Transfer -->
                    <div>
                        <label class="input-label">Bukti Transfer *</label>

                        <!-- Toggle between upload and manual URL -->
                        <div class="flex items-center gap-2 mb-3">
                            <button
                                type="button"
                                on:click={() => {
                                    useFileUpload = true;
                                }}
                                class="btn btn-sm {useFileUpload
                                    ? 'btn-primary'
                                    : 'btn-ghost'}"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload File
                            </button>
                            <button
                                type="button"
                                on:click={() => {
                                    useFileUpload = false;
                                    selectedFile = null;
                                }}
                                class="btn btn-sm {!useFileUpload
                                    ? 'btn-primary'
                                    : 'btn-ghost'}"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Input URL Manual
                            </button>
                        </div>

                        {#if useFileUpload}
                            <!-- File Upload Mode -->
                            <div class="space-y-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    on:change={handleFileSelect}
                                    disabled={isUploading}
                                    class="input file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                                />
                                {#if isUploading}
                                    <div class="flex items-center gap-2 text-sm text-teal-600">
                                        <svg
                                            class="animate-spin h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                class="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                stroke-width="4"
                                            ></circle>
                                            <path
                                                class="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <span>Mengupload gambar...</span>
                                    </div>
                                {/if}
                                {#if topupForm.image_bukti_transfer && !isUploading}
                                    <div class="flex items-center gap-2 text-sm text-emerald-600">
                                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fill-rule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clip-rule="evenodd"
                                            />
                                        </svg>
                                        <span>Gambar berhasil diupload</span>
                                    </div>
                                    <a
                                        href={topupForm.image_bukti_transfer}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-xs text-teal-600 hover:underline break-all"
                                    >
                                        {topupForm.image_bukti_transfer}
                                    </a>
                                {/if}
                                <p class="text-xs text-slate-400">
                                    Upload gambar bukti transfer (max 5MB, format:
                                    JPG, PNG, GIF)
                                </p>
                            </div>
                        {:else}
                            <!-- Manual URL Input Mode -->
                            <div class="space-y-2">
                                <input
                                    type="url"
                                    bind:value={topupForm.image_bukti_transfer}
                                    required
                                    class="input"
                                    placeholder="https://example.com/bukti-transfer.jpg"
                                />
                                <p class="text-xs text-slate-400">
                                    Masukkan URL gambar bukti transfer Anda
                                </p>
                            </div>
                        {/if}
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="input-label">Keterangan</label>
                        <textarea
                            bind:value={topupForm.description}
                            rows="3"
                            class="input"
                            placeholder="Alasan atau keterangan top-up (opsional)..."
                        ></textarea>
                    </div>

                    <div class="alert alert-warning">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p class="text-sm">
                            Permintaan top-up akan diproses oleh admin. Harap tunggu konfirmasi.
                        </p>
                    </div>
                </div>

                <div class="drawer-footer">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="btn btn-secondary"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        Ajukan Top-Up
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Balance Adjustment Drawer (Admin) -->
{#if showBalanceAdjustModal && selectedWallet}
    <div
        class="drawer-overlay"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="drawer-panel"
            on:click|stopPropagation
        >
            <div class="drawer-header">
                <h3 class="text-lg font-semibold text-slate-900">
                    Sesuaikan Saldo {getWalletDisplayName(selectedWallet.type)}
                </h3>
                <button on:click={closeModals} class="btn btn-ghost btn-icon btn-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form on:submit|preventDefault={adjustWalletBalance}>
                <div class="drawer-body space-y-5">
                    <!-- Current Balance Info -->
                    <div class="card p-4 bg-slate-50">
                        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Saldo Saat Ini</p>
                        <p class="text-2xl font-bold text-slate-900 font-tabular">
                            {formatCurrency(selectedWallet.balance)}
                        </p>
                        <p class="text-xs text-slate-400 font-tabular mt-1">
                            User ID: #{selectedWallet.user_id}
                        </p>
                    </div>

                    <!-- Amount (can be positive or negative) -->
                    <div>
                        <label class="input-label">Jumlah Penyesuaian (Rp)</label>
                        <input
                            type="number"
                            bind:value={balanceAdjustForm.amount}
                            required
                            step="1000"
                            class="input font-tabular"
                            placeholder="Positif untuk menambah, negatif untuk mengurangi"
                        />
                        <p class="text-xs text-slate-400 mt-1.5">
                            Gunakan angka positif untuk menambah saldo, negatif
                            untuk mengurangi
                        </p>
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="input-label">Keterangan Penyesuaian</label>
                        <textarea
                            bind:value={balanceAdjustForm.description}
                            required
                            rows="3"
                            class="input"
                        ></textarea>
                    </div>

                    <!-- Preview -->
                    <div class="alert alert-info">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-sm">
                            <strong>Saldo Baru:</strong>
                            <span class="font-tabular font-bold">
                                {formatCurrency(
                                    selectedWallet.balance + balanceAdjustForm.amount,
                                )}
                            </span>
                        </p>
                    </div>

                    <div class="alert alert-danger">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p class="text-sm">
                            Penyesuaian saldo akan langsung diterapkan dan
                            tercatat dalam riwayat transaksi.
                        </p>
                    </div>
                </div>

                <div class="drawer-footer">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="btn btn-secondary"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="btn btn-success"
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
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
            on:click|stopPropagation
        >
            <div class="modal-header">
                <h3 class="text-lg font-semibold text-slate-900">
                    Detail Transaksi
                </h3>
            </div>

            <div class="modal-body space-y-5">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">ID Transaksi</p>
                        <p class="font-semibold font-tabular text-slate-900">#{selectedTransaction.id}</p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">User ID</p>
                        <p class="font-semibold font-tabular text-slate-900">
                            #{selectedTransaction.simpanan?.user_id}
                        </p>
                    </div>
                </div>

                {#if selectedTransaction.simpanan?.user}
                    <div>
                        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Nama Anggota</p>
                        <p class="font-semibold text-slate-900">
                            {selectedTransaction.simpanan.user.name}
                        </p>
                        <p class="text-xs text-slate-400">
                            {selectedTransaction.simpanan.user.email}
                        </p>
                    </div>
                {/if}

                <div>
                    <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Jenis Wallet</p>
                    <span class="badge {selectedTransaction.simpanan?.type === 'pokok'
                        ? 'badge-primary'
                        : selectedTransaction.simpanan?.type === 'wajib'
                          ? 'badge-warning'
                          : 'badge-success'}">
                        {getWalletDisplayName(
                            selectedTransaction.simpanan?.type || "",
                        )}
                    </span>
                </div>

                <div>
                    <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Jenis Transaksi</p>
                    <p class="text-slate-900 capitalize font-medium">
                        {selectedTransaction.type}
                    </p>
                </div>

                <div>
                    <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Jumlah</p>
                    <p class="text-2xl font-bold text-slate-900 font-tabular">
                        {formatCurrency(selectedTransaction.amount)}
                    </p>
                </div>

                <div>
                    <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Keterangan</p>
                    <p class="text-slate-700">
                        {selectedTransaction.description}
                    </p>
                </div>

                {#if selectedTransaction.image_bukti_transfer}
                    <div>
                        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Bukti Transfer</p>
                        <div class="card overflow-hidden">
                            <a
                                href={selectedTransaction.image_bukti_transfer}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="block hover:opacity-90 transition-opacity"
                            >
                                <img
                                    src={selectedTransaction.image_bukti_transfer}
                                    alt="Bukti Transfer"
                                    class="w-full h-auto max-h-96 object-contain bg-slate-50"
                                    on:error={(e) => {
                                        const target =
                                            e.currentTarget as HTMLImageElement;
                                        target.src =
                                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            </a>
                        </div>
                        <p class="text-xs text-slate-400 mt-1.5">
                            Klik gambar untuk melihat ukuran penuh
                        </p>
                    </div>
                {/if}

                {#if selectedTransaction.bank_account}
                    <div>
                        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            Rekening Tujuan Transfer
                        </p>
                        <div class="card p-4 bg-teal-50 border-teal-200">
                            <p class="text-sm font-semibold text-teal-900">
                                {selectedTransaction.bank_account.bank_name}
                            </p>
                            <p class="text-sm text-teal-700 font-tabular">
                                {selectedTransaction.bank_account.account_number}
                            </p>
                            <p class="text-xs text-teal-600">
                                a.n. {selectedTransaction.bank_account.account_name}
                            </p>
                        </div>
                    </div>
                {/if}

                <div>
                    <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Tanggal Permintaan</p>
                    <p class="text-slate-700">
                        {formatDate(selectedTransaction.created_at)}
                    </p>
                </div>

                <div>
                    <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Status</p>
                    <span
                        class="badge
                        {selectedTransaction.status === 'pending'
                            ? 'badge-warning'
                            : selectedTransaction.status === 'verified'
                              ? 'badge-success'
                              : 'badge-danger'}"
                    >
                        {selectedTransaction.status === "pending"
                            ? "Menunggu Persetujuan"
                            : selectedTransaction.status === "verified"
                              ? "Disetujui"
                              : "Ditolak"}
                    </span>
                </div>
            </div>

            <div class="modal-footer">
                <button
                    on:click={closeModals}
                    class="btn btn-secondary"
                >
                    Tutup
                </button>
                {#if isAdmin && selectedTransaction.status === "pending"}
                    <div class="flex gap-2">
                        <button
                            on:click={() =>
                                selectedTransaction &&
                                verifyTransaction(selectedTransaction.id, true)}
                            class="btn btn-success"
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
                            class="btn btn-danger"
                        >
                            Tolak
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Transaction History Drawer -->
{#if showTransactionHistoryModal && selectedWallet}
    <div
        class="drawer-overlay"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="drawer-panel"
            style="max-width: 48rem;"
            on:click|stopPropagation
        >
            <div class="drawer-header">
                <h3 class="text-lg font-semibold text-slate-900">
                    Riwayat Transaksi - {getWalletDisplayName(selectedWallet.type)}
                </h3>
                <button on:click={closeModals} class="btn btn-ghost btn-icon btn-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="drawer-body p-0">
                {#if transactionHistory.length > 0}
                    <div class="table-container" style="border: none; box-shadow: none; border-radius: 0;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Jenis</th>
                                    <th>Jumlah</th>
                                    <th>Status</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each transactionHistory as transaction}
                                    <tr>
                                        <td class="whitespace-nowrap">
                                            {formatDate(transaction.created_at)}
                                        </td>
                                        <td class="whitespace-nowrap capitalize">
                                            {transaction.type}
                                        </td>
                                        <td class="whitespace-nowrap font-tabular font-semibold
                                            {transaction.amount > 0
                                                ? 'text-emerald-600'
                                                : 'text-rose-600'}">
                                            {transaction.amount > 0
                                                ? "+"
                                                : ""}{formatCurrency(
                                                transaction.amount,
                                            )}
                                        </td>
                                        <td class="whitespace-nowrap">
                                            <span
                                                class="badge
                                                {transaction.status === 'pending'
                                                    ? 'badge-warning'
                                                    : transaction.status ===
                                                        'verified'
                                                      ? 'badge-success'
                                                      : 'badge-danger'}"
                                            >
                                                {transaction.status === "pending"
                                                    ? "Pending"
                                                    : transaction.status ===
                                                        "verified"
                                                      ? "Verified"
                                                      : "Rejected"}
                                            </span>
                                        </td>
                                        <td class="text-slate-500">
                                            {transaction.description}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                    <div class="empty-state">
                        <svg class="w-12 h-12 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p class="text-slate-500">
                            Belum ada riwayat transaksi untuk wallet ini.
                        </p>
                    </div>
                {/if}
            </div>

            <div class="drawer-footer">
                <button
                    on:click={closeModals}
                    class="btn btn-secondary"
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
{/if}
