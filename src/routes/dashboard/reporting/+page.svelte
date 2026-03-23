<script lang="ts">
    import type { FinancialSummary } from "$lib/types";
    import { formatCurrency, formatDate } from "$lib/utils";

    export let data;

    const currentUser = data.currentUser;
    const financialSummary: FinancialSummary | null = data.financialSummary;
    const error = data.error;

    // Permission checks
    const isAdmin =
        currentUser?.role?.name === "admin" ||
        currentUser?.role?.name === "super_admin";
    const isSuper = currentUser?.role?.name === "super_admin";
</script>

<svelte:head>
    <title>Laporan Keuangan - Koperasi Backoffice</title>
</svelte:head>

<div class="min-h-screen bg-pattern p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-8 animate-fade-in">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
            Laporan Keuangan
        </h1>
        <p class="text-slate-500 mt-1">
            Riwayat transaksi dan pelaporan keuangan komprehensif
        </p>
    </div>

    {#if error}
        <div class="alert alert-danger mb-8 animate-slide-up">
            <svg class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
                <p class="font-semibold">Error</p>
                <p class="mt-0.5 text-sm">{error}</p>
            </div>
        </div>
    {:else if !isAdmin}
        <div class="alert alert-warning mb-8 animate-slide-up">
            <svg class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
                <p class="font-semibold">Akses Terbatas</p>
                <p class="mt-0.5 text-sm">
                    Anda memerlukan role Admin atau Super Admin untuk mengakses laporan keuangan.
                </p>
            </div>
        </div>
    {:else}
        <!-- Financial Summary Cards -->
        {#if financialSummary}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <div class="card p-5 stagger-item" style="border-left: 3px solid var(--color-success);">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Simpanan</p>
                            <p class="text-lg font-bold text-slate-900 font-tabular mt-0.5">
                                {formatCurrency(financialSummary.total_simpanan)}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="card p-5 stagger-item" style="border-left: 3px solid var(--color-primary-500);">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Pinjaman</p>
                            <p class="text-lg font-bold text-slate-900 font-tabular mt-0.5">
                                {formatCurrency(financialSummary.total_pinjaman)}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="card p-5 stagger-item" style="border-left: 3px solid #8b5cf6;">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Angsuran</p>
                            <p class="text-lg font-bold text-slate-900 font-tabular mt-0.5">
                                {formatCurrency(financialSummary.total_angsuran)}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="card p-5 stagger-item" style="border-left: 3px solid var(--color-warning);">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total SHU</p>
                            <p class="text-lg font-bold text-slate-900 font-tabular mt-0.5">
                                {formatCurrency(financialSummary.total_shu)}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="card p-5 stagger-item" style="border-left: 3px solid #64748b;">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Transaksi</p>
                            <p class="text-lg font-bold text-slate-900 font-tabular mt-0.5">
                                {financialSummary.total_transactions.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="card p-5 stagger-item" style="border-left: 3px solid var(--color-info);">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Periode</p>
                            <p class="text-sm font-semibold text-slate-900 mt-0.5">
                                {formatDate(financialSummary.period_start)} - {formatDate(financialSummary.period_end)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Fallback when no financial summary data -->
            <div class="alert alert-info mb-8 animate-slide-up">
                <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p class="font-semibold">Data Keuangan Tidak Tersedia</p>
                    <p class="mt-0.5 text-sm">
                        Sistem belum memiliki data transaksi atau sedang dalam pengembangan. Anda masih dapat menggunakan menu laporan di bawah ini.
                    </p>
                </div>
            </div>
        {/if}

        <!-- Report Menu Cards -->
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Menu Laporan</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- Transaction History -->
            <a href="/dashboard/reporting/transactions" class="card card-interactive p-6 block group stagger-item">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                        <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h3 class="text-base font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                            Riwayat Transaksi
                        </h3>
                        <p class="text-sm text-slate-500 mt-1">
                            Lihat dan filter riwayat transaksi lengkap
                        </p>
                    </div>
                </div>
                <div class="mt-5 pt-4 border-t border-slate-100 flex items-center text-sm font-medium text-teal-600 group-hover:text-teal-700 transition-colors">
                    <span>Buka riwayat transaksi</span>
                    <svg class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </a>

            <!-- Financial Reports -->
            <a href="/dashboard/reporting/financial" class="card card-interactive p-6 block group stagger-item">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
                        </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h3 class="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            Laporan Keuangan
                        </h3>
                        <p class="text-sm text-slate-500 mt-1">
                            Generate dan unduh laporan keuangan
                        </p>
                    </div>
                </div>
                <div class="mt-5 pt-4 border-t border-slate-100 flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors">
                    <span>Buat laporan keuangan</span>
                    <svg class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </a>

            <!-- User Transaction Report (Super Admin Only) -->
            {#if isSuper}
                <a href="/dashboard/reporting/user-transactions" class="card card-interactive p-6 block group stagger-item">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                            <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div class="min-w-0 flex-1">
                            <h3 class="text-base font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">
                                Transaksi per User
                            </h3>
                            <p class="text-sm text-slate-500 mt-1">
                                Analisis transaksi berdasarkan user
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 pt-4 border-t border-slate-100 flex items-center text-sm font-medium text-violet-600 group-hover:text-violet-700 transition-colors">
                        <span>Lihat transaksi user</span>
                        <svg class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </a>
            {/if}
        </div>
    {/if}
</div>
