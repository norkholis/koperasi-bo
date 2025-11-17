<script lang="ts">
    import type {
        Transaction,
        TransactionFilters,
        TransactionHistoryResponse,
    } from "$lib/types";
    import axios from "$lib/api";
    import { onMount } from "svelte";
    import { showError, showSuccess } from "$lib/stores/notifications";

    export let data;

    const currentUser = data.currentUser;
    const initialFilters = data.initialFilters;
    const error = data.error;

    // State
    let transactions: Transaction[] = [];
    let loading = false;
    let filters: TransactionFilters = {
        ...initialFilters,
        limit: initialFilters?.limit || 50,
        offset: initialFilters?.offset || 0,
    };
    let totalTransactions = 0;
    let showFilters = false;

    // Pagination
    $: totalPages = Math.ceil(totalTransactions / (filters.limit || 50));
    $: currentPage =
        Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;

    onMount(() => {
        if (currentUser && !error) {
            loadTransactions();
        }
    });

    async function loadTransactions() {
        loading = true;
        try {
            console.log("📊 Loading transactions with filters:", filters);

            // Build query parameters
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, value.toString());
                }
            });

            const response = await axios.get(
                `/transactions?${params.toString()}`,
            );
            const result: TransactionHistoryResponse = response.data;

            transactions = result.data;
            totalTransactions = result.total;

            console.log(
                "✅ Transactions loaded:",
                transactions.length,
                "of",
                totalTransactions,
            );
        } catch (err: any) {
            console.error("❌ Error loading transactions:", err);
            showError(
                `Gagal memuat riwayat transaksi: ${err.response?.data?.message || err.message}`,
            );
        } finally {
            loading = false;
        }
    }

    function applyFilters() {
        filters.offset = 0; // Reset to first page
        loadTransactions();
    }

    function clearFilters() {
        filters = {
            limit: 50,
            offset: 0,
        };
        loadTransactions();
    }

    function changePage(page: number) {
        filters.offset = (page - 1) * (filters.limit || 50);
        loadTransactions();
    }

    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getTransactionTypeColor(type: string): string {
        switch (type) {
            case "SIMPANAN":
                return "bg-green-100 text-green-800";
            case "PINJAMAN":
                return "bg-blue-100 text-blue-800";
            case "ANGSURAN":
                return "bg-purple-100 text-purple-800";
            case "SHU":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "VERIFIED":
                return "bg-blue-100 text-blue-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    function exportTransactions() {
        // Export functionality can be implemented here
        showSuccess("Export functionality will be implemented soon");
    }
</script>

<svelte:head>
    <title>Riwayat Transaksi - Koperasi Backoffice</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Header -->
    <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
    >
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
                Riwayat Transaksi
            </h1>
            <p class="text-gray-600 mt-2">
                Lihat dan filter riwayat transaksi lengkap sistem
            </p>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-2">
            <button
                on:click={() => (showFilters = !showFilters)}
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                {showFilters ? "Sembunyikan" : "Tampilkan"} Filter
            </button>
            <button
                on:click={exportTransactions}
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                Export
            </button>
        </div>
    </div>

    {#if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg
                        class="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Error</h3>
                    <p class="text-sm text-red-700 mt-1">{error}</p>
                </div>
            </div>
        </div>
    {:else}
        <!-- Filters Panel -->
        {#if showFilters}
            <div
                class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
            >
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Filter Transaksi
                </h3>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Jenis Transaksi
                        </label>
                        <select
                            bind:value={filters.transaction_type}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Semua Jenis</option>
                            <option value="SIMPANAN">Simpanan</option>
                            <option value="PINJAMAN">Pinjaman</option>
                            <option value="ANGSURAN">Angsuran</option>
                            <option value="SHU">SHU</option>
                        </select>
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Status
                        </label>
                        <select
                            bind:value={filters.status}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            User ID
                        </label>
                        <input
                            type="number"
                            bind:value={filters.user_id}
                            placeholder="Filter berdasarkan User ID"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Tanggal Mulai
                        </label>
                        <input
                            type="date"
                            bind:value={filters.start_date}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Tanggal Akhir
                        </label>
                        <input
                            type="date"
                            bind:value={filters.end_date}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Jumlah Minimum
                        </label>
                        <input
                            type="number"
                            bind:value={filters.min_amount}
                            placeholder="Jumlah minimum"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Jumlah Maksimum
                        </label>
                        <input
                            type="number"
                            bind:value={filters.max_amount}
                            placeholder="Jumlah maksimum"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Limit per Halaman
                        </label>
                        <select
                            bind:value={filters.limit}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div class="flex gap-4 mt-6">
                    <button
                        on:click={applyFilters}
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Terapkan Filter
                    </button>
                    <button
                        on:click={clearFilters}
                        class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>
        {/if}

        <!-- Loading State -->
        {#if loading}
            <div
                class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
            >
                <div
                    class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"
                ></div>
                <p class="text-gray-500">Memuat riwayat transaksi...</p>
            </div>
        {:else}
            <!-- Transactions Table -->
            <div
                class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
                <div class="px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-medium text-gray-900">
                        Riwayat Transaksi ({totalTransactions.toLocaleString(
                            "id-ID",
                        )} transaksi)
                    </h3>
                </div>

                {#if transactions.length === 0}
                    <div class="p-8 text-center">
                        <svg
                            class="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p class="text-gray-500 mt-2">
                            Tidak ada transaksi ditemukan
                        </p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >ID</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >User</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Jenis</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Jumlah</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Status</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Tanggal</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Deskripsi</th
                                    >
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each transactions as transaction}
                                    <tr class="hover:bg-gray-50">
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                        >
                                            {transaction.id}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">
                                                {transaction.user?.name ||
                                                    transaction.user?.email ||
                                                    `User #${transaction.user_id}`}
                                            </div>
                                            <div class="text-sm text-gray-500">
                                                ID: {transaction.user_id}
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getTransactionTypeColor(
                                                    transaction.transaction_type,
                                                )}"
                                            >
                                                {transaction.transaction_type}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div
                                                class="text-sm text-gray-900 font-medium"
                                            >
                                                {formatCurrency(
                                                    transaction.amount,
                                                )}
                                            </div>
                                            <div class="text-xs text-gray-500">
                                                Sebelum: {formatCurrency(
                                                    transaction.balance_before,
                                                )}
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(
                                                    transaction.status,
                                                )}"
                                            >
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {formatDate(
                                                transaction.transaction_date,
                                            )}
                                        </td>
                                        <td
                                            class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                                        >
                                            {transaction.description}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    {#if totalPages > 1}
                        <div
                            class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6"
                        >
                            <div class="flex items-center justify-between">
                                <div
                                    class="flex-1 flex justify-between sm:hidden"
                                >
                                    <button
                                        on:click={() =>
                                            changePage(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        on:click={() =>
                                            changePage(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div
                                    class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p class="text-sm text-gray-700">
                                            Showing
                                            <span class="font-medium"
                                                >{(filters.offset || 0) +
                                                    1}</span
                                            >
                                            to
                                            <span class="font-medium"
                                                >{Math.min(
                                                    (filters.offset || 0) +
                                                        (filters.limit || 50),
                                                    totalTransactions,
                                                )}</span
                                            >
                                            of
                                            <span class="font-medium"
                                                >{totalTransactions}</span
                                            >
                                            results
                                        </p>
                                    </div>
                                    <div>
                                        <nav
                                            class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                            aria-label="Pagination"
                                        >
                                            <button
                                                on:click={() =>
                                                    changePage(currentPage - 1)}
                                                disabled={currentPage <= 1}
                                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span class="sr-only"
                                                    >Previous</span
                                                >
                                                <svg
                                                    class="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                            </button>

                                            {#each Array(Math.min(totalPages, 7)).fill(0) as _, i}
                                                {@const page = i + 1}
                                                <button
                                                    on:click={() =>
                                                        changePage(page)}
                                                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium {page ===
                                                    currentPage
                                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}"
                                                >
                                                    {page}
                                                </button>
                                            {/each}

                                            <button
                                                on:click={() =>
                                                    changePage(currentPage + 1)}
                                                disabled={currentPage >=
                                                    totalPages}
                                                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span class="sr-only">Next</span
                                                >
                                                <svg
                                                    class="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                {/if}
            </div>
        {/if}
    {/if}
</div>
