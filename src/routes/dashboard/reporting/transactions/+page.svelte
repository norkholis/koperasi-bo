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

    function getTransactionTypeBadge(type: string): string {
        switch (type) {
            case "SIMPANAN": return "badge-success";
            case "PINJAMAN": return "badge-info";
            case "ANGSURAN": return "badge-primary";
            case "SHU": return "badge-warning";
            default: return "badge-neutral";
        }
    }

    function getStatusBadge(status: string): string {
        switch (status) {
            case "COMPLETED": return "badge-success";
            case "VERIFIED": return "badge-info";
            case "PENDING": return "badge-warning";
            case "CANCELLED": return "badge-danger";
            default: return "badge-neutral";
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

<div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Riwayat Transaksi</h1>
            <p class="text-slate-500 mt-1">Lihat dan filter riwayat transaksi lengkap sistem</p>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-2">
            <button
                on:click={() => (showFilters = !showFilters)}
                class="btn {showFilters ? 'btn-primary' : 'btn-secondary'}"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                {showFilters ? "Sembunyikan" : "Filter"}
            </button>
            <button on:click={exportTransactions} class="btn btn-success btn-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export
            </button>
        </div>
    </div>

    {#if error}
        <div class="alert alert-danger animate-slide-up">
            <svg class="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <p class="font-semibold">Error</p>
                <p class="text-sm mt-0.5">{error}</p>
            </div>
        </div>
    {:else}
        <!-- Filters Panel -->
        {#if showFilters}
            <div class="card p-6 animate-slide-up">
                <h3 class="text-base font-semibold text-slate-900 mb-4">Filter Transaksi</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label class="input-label">Jenis Transaksi</label>
                        <select bind:value={filters.transaction_type} class="input">
                            <option value="">Semua Jenis</option>
                            <option value="SIMPANAN">Simpanan</option>
                            <option value="PINJAMAN">Pinjaman</option>
                            <option value="ANGSURAN">Angsuran</option>
                            <option value="SHU">SHU</option>
                        </select>
                    </div>
                    <div>
                        <label class="input-label">Status</label>
                        <select bind:value={filters.status} class="input">
                            <option value="">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label class="input-label">User ID</label>
                        <input type="number" bind:value={filters.user_id} placeholder="Filter berdasarkan User ID" class="input font-tabular" />
                    </div>
                    <div>
                        <label class="input-label">Tanggal Mulai</label>
                        <input type="date" bind:value={filters.start_date} class="input font-tabular" />
                    </div>
                    <div>
                        <label class="input-label">Tanggal Akhir</label>
                        <input type="date" bind:value={filters.end_date} class="input font-tabular" />
                    </div>
                    <div>
                        <label class="input-label">Jumlah Minimum</label>
                        <input type="number" bind:value={filters.min_amount} placeholder="Min" class="input font-tabular" />
                    </div>
                    <div>
                        <label class="input-label">Jumlah Maksimum</label>
                        <input type="number" bind:value={filters.max_amount} placeholder="Max" class="input font-tabular" />
                    </div>
                    <div>
                        <label class="input-label">Limit per Halaman</label>
                        <select bind:value={filters.limit} class="input">
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
                <div class="flex gap-3 mt-5">
                    <button on:click={applyFilters} class="btn btn-primary">Terapkan Filter</button>
                    <button on:click={clearFilters} class="btn btn-secondary">Reset</button>
                </div>
            </div>
        {/if}

        <!-- Loading -->
        {#if loading}
            <div class="card p-12 text-center">
                <svg class="w-10 h-10 animate-spin text-teal-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p class="text-slate-500">Memuat riwayat transaksi...</p>
            </div>
        {:else}
            <!-- Desktop Table -->
            <div class="hidden md:block">
                <div class="table-container">
                    <div class="px-4 py-3 border-b border-slate-200">
                        <h3 class="text-sm font-semibold text-slate-900">
                            Riwayat Transaksi
                            <span class="text-slate-400 font-tabular">({totalTransactions.toLocaleString("id-ID")} transaksi)</span>
                        </h3>
                    </div>

                    {#if transactions.length === 0}
                        <div class="empty-state py-12">
                            <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <p class="font-medium text-slate-500 mt-2">Tidak ada transaksi ditemukan</p>
                        </div>
                    {:else}
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Jenis</th>
                                    <th>Jumlah</th>
                                    <th>Status</th>
                                    <th>Tanggal</th>
                                    <th>Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each transactions as transaction}
                                    <tr>
                                        <td class="font-tabular font-medium">
                                            {transaction.id}
                                        </td>
                                        <td>
                                            <div class="text-sm font-medium text-slate-900">
                                                {transaction.user?.name || transaction.user?.email || `User #${transaction.user_id}`}
                                            </div>
                                            <div class="text-xs text-slate-400 font-tabular">ID: {transaction.user_id}</div>
                                        </td>
                                        <td>
                                            <span class="badge {getTransactionTypeBadge(transaction.transaction_type)}">
                                                {transaction.transaction_type}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="font-tabular font-medium text-slate-900">{formatCurrency(transaction.amount)}</div>
                                            <div class="text-xs text-slate-400 font-tabular">Sebelum: {formatCurrency(transaction.balance_before)}</div>
                                        </td>
                                        <td>
                                            <span class="badge {getStatusBadge(transaction.status)}">
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td class="font-tabular text-slate-500 text-xs">{formatDate(transaction.transaction_date)}</td>
                                        <td class="max-w-[200px] truncate text-slate-500">{transaction.description}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>

                        <!-- Pagination -->
                        {#if totalPages > 1}
                            <div class="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                                <p class="text-sm text-slate-500">
                                    Showing <span class="font-medium font-tabular">{(filters.offset || 0) + 1}</span>
                                    to <span class="font-medium font-tabular">{Math.min((filters.offset || 0) + (filters.limit || 50), totalTransactions)}</span>
                                    of <span class="font-medium font-tabular">{totalTransactions}</span> results
                                </p>
                                <div class="flex gap-1">
                                    <button
                                        on:click={() => changePage(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        class="btn btn-secondary btn-sm btn-icon"
                                    >
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                        </svg>
                                    </button>
                                    {#each Array(Math.min(totalPages, 7)).fill(0) as _, i}
                                        {@const pageNum = i + 1}
                                        <button
                                            on:click={() => changePage(pageNum)}
                                            class="btn btn-sm {pageNum === currentPage ? 'btn-primary' : 'btn-secondary'} font-tabular"
                                            style="min-width: 2.25rem;"
                                        >
                                            {pageNum}
                                        </button>
                                    {/each}
                                    <button
                                        on:click={() => changePage(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        class="btn btn-secondary btn-sm btn-icon"
                                    >
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        {/if}
                    {/if}
                </div>
            </div>

            <!-- Mobile Card View -->
            <div class="md:hidden space-y-3">
                {#if transactions.length === 0}
                    <div class="card p-8">
                        <div class="empty-state">
                            <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <p class="font-medium text-slate-500 mt-2">Tidak ada transaksi</p>
                        </div>
                    </div>
                {:else}
                    {#each transactions as transaction}
                        <div class="card p-4 stagger-item">
                            <div class="flex items-start justify-between mb-2">
                                <div>
                                    <span class="font-tabular text-xs text-slate-400">#{transaction.id}</span>
                                    <p class="font-medium text-slate-900 text-sm">
                                        {transaction.user?.name || `User #${transaction.user_id}`}
                                    </p>
                                </div>
                                <span class="badge {getStatusBadge(transaction.status)}">{transaction.status}</span>
                            </div>
                            <div class="flex items-center justify-between mb-2">
                                <span class="badge {getTransactionTypeBadge(transaction.transaction_type)}">{transaction.transaction_type}</span>
                                <span class="font-tabular font-semibold text-slate-900">{formatCurrency(transaction.amount)}</span>
                            </div>
                            <p class="text-xs text-slate-400 font-tabular">{formatDate(transaction.transaction_date)}</p>
                        </div>
                    {/each}

                    <!-- Mobile Pagination -->
                    {#if totalPages > 1}
                        <div class="flex justify-between pt-2">
                            <button
                                on:click={() => changePage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                class="btn btn-secondary btn-sm"
                            >Previous</button>
                            <span class="text-sm text-slate-500 self-center font-tabular">{currentPage} / {totalPages}</span>
                            <button
                                on:click={() => changePage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                class="btn btn-secondary btn-sm"
                            >Next</button>
                        </div>
                    {/if}
                {/if}
            </div>
        {/if}
    {/if}
</div>
