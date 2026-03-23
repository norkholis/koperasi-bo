<script lang="ts">
    import type {
        FinancialReportRequest,
        FinancialReport,
        FinancialReportResponse,
    } from "$lib/types";
    import axios from "$lib/api";
    import { showError, showSuccess } from "$lib/stores/notifications";

    export let data;

    const currentUser = data.currentUser;
    const error = data?.error || null;

    // State
    let generatingReport = false;
    let currentReport: FinancialReport | null = null;
    let reportForm: FinancialReportRequest = {
        report_type: "MONTHLY",
        start_date: new Date(
            new Date().getFullYear(),
            new Date().getMonth() - 1,
            1,
        )
            .toISOString()
            .split("T")[0],
        end_date: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
            .toISOString()
            .split("T")[0],
    };

    // Update date range when report type changes
    function updateDateRange() {
        const today = new Date();
        switch (reportForm.report_type) {
            case "DAILY":
                reportForm.start_date = today.toISOString().split("T")[0];
                reportForm.end_date = today.toISOString().split("T")[0];
                break;
            case "WEEKLY":
                const weekAgo = new Date(
                    today.getTime() - 7 * 24 * 60 * 60 * 1000,
                );
                reportForm.start_date = weekAgo.toISOString().split("T")[0];
                reportForm.end_date = today.toISOString().split("T")[0];
                break;
            case "MONTHLY":
                reportForm.start_date = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    1,
                )
                    .toISOString()
                    .split("T")[0];
                reportForm.end_date = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    0,
                )
                    .toISOString()
                    .split("T")[0];
                break;
            case "YEARLY":
                reportForm.start_date = new Date(today.getFullYear() - 1, 0, 1)
                    .toISOString()
                    .split("T")[0];
                reportForm.end_date = new Date(today.getFullYear() - 1, 11, 31)
                    .toISOString()
                    .split("T")[0];
                break;
        }
    }

    async function generateReport() {
        generatingReport = true;
        try {
            const response = await axios.post("/reports/financial", reportForm);
            const result: FinancialReportResponse = response.data;

            currentReport = result.data;
            showSuccess("Laporan keuangan berhasil digenerate!");
        } catch (err: any) {
            console.error("Error generating report:", err);
            showError(
                `Gagal generate laporan: ${err.response?.data?.message || err.message}`,
            );
        } finally {
            generatingReport = false;
        }
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
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function exportReport() {
        if (!currentReport) return;

        // Create downloadable JSON file
        const dataStr = JSON.stringify(currentReport, null, 2);
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);

        const exportFileDefaultName = `laporan-keuangan-${currentReport.report_type.toLowerCase()}-${currentReport.period_start.split("T")[0]}-to-${currentReport.period_end.split("T")[0]}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();

        showSuccess("Laporan berhasil didownload!");
    }

    function printReport() {
        if (!currentReport) return;
        window.print();
    }
</script>

<svelte:head>
    <title>Laporan Keuangan - Koperasi Backoffice</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Generate Laporan Keuangan</h1>
            <p class="text-slate-500 mt-1">Buat laporan keuangan berdasarkan periode dan jenis yang dipilih</p>
        </div>
        {#if currentReport}
            <div class="mt-4 sm:mt-0 flex gap-2">
                <button on:click={exportReport} class="btn btn-success btn-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export
                </button>
                <button on:click={printReport} class="btn btn-secondary btn-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                    </svg>
                    Print
                </button>
            </div>
        {/if}
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
        <!-- Report Form -->
        <div class="card p-6 animate-slide-up">
            <h3 class="text-base font-semibold text-slate-900 mb-4">Parameter Laporan</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="input-label">Jenis Laporan</label>
                    <select bind:value={reportForm.report_type} on:change={updateDateRange} class="input">
                        <option value="DAILY">Harian</option>
                        <option value="WEEKLY">Mingguan</option>
                        <option value="MONTHLY">Bulanan</option>
                        <option value="YEARLY">Tahunan</option>
                        <option value="CUSTOM">Custom Range</option>
                    </select>
                </div>
                <div>
                    <label class="input-label">Tanggal Mulai</label>
                    <input type="date" bind:value={reportForm.start_date} class="input font-tabular" />
                </div>
                <div>
                    <label class="input-label">Tanggal Akhir</label>
                    <input type="date" bind:value={reportForm.end_date} class="input font-tabular" />
                </div>
            </div>
            <div class="mt-5">
                <button on:click={generateReport} disabled={generatingReport} class="btn btn-primary">
                    {#if generatingReport}
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                    {:else}
                        Generate Laporan
                    {/if}
                </button>
            </div>
        </div>

        <!-- Report Display -->
        {#if currentReport}
            <div class="card p-6 animate-slide-up" id="report-content">
                <!-- Report Header -->
                <div class="border-b border-slate-200 pb-5 mb-6">
                    <h2 class="text-xl font-semibold text-slate-900">
                        Laporan Keuangan {currentReport.report_type}
                    </h2>
                    <p class="text-slate-500 mt-1 font-tabular">
                        Periode: {formatDate(currentReport.period_start)} - {formatDate(currentReport.period_end)}
                    </p>
                    <p class="text-sm text-slate-400 mt-0.5 font-tabular">
                        Generated pada {formatDate(currentReport.generated_at)} oleh User ID: {currentReport.generated_by}
                    </p>
                </div>

                <!-- Summary Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <div class="card p-4 border-t-2 border-emerald-500 stagger-item">
                        <p class="text-sm font-medium text-slate-500 mb-1">Total Simpanan</p>
                        <p class="text-lg font-bold text-slate-900 font-tabular">{formatCurrency(currentReport.summary.total_simpanan)}</p>
                    </div>
                    <div class="card p-4 border-t-2 border-teal-500 stagger-item">
                        <p class="text-sm font-medium text-slate-500 mb-1">Total Pinjaman</p>
                        <p class="text-lg font-bold text-slate-900 font-tabular">{formatCurrency(currentReport.summary.total_pinjaman)}</p>
                    </div>
                    <div class="card p-4 border-t-2 border-amber-500 stagger-item">
                        <p class="text-sm font-medium text-slate-500 mb-1">Total Angsuran</p>
                        <p class="text-lg font-bold text-slate-900 font-tabular">{formatCurrency(currentReport.summary.total_angsuran)}</p>
                    </div>
                    <div class="card p-4 border-t-2 border-sky-500 stagger-item">
                        <p class="text-sm font-medium text-slate-500 mb-1">Total SHU</p>
                        <p class="text-lg font-bold text-slate-900 font-tabular">{formatCurrency(currentReport.summary.total_shu)}</p>
                    </div>
                </div>

                <!-- Transaction Count -->
                <div class="card p-4 bg-slate-50 border-slate-200 mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-500">Total Transaksi</p>
                            <p class="text-2xl font-bold text-slate-900 font-tabular">{currentReport.transaction_count.toLocaleString("id-ID")}</p>
                        </div>
                        <svg class="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                    </div>
                </div>

                <!-- Breakdown -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="card p-5">
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Breakdown per Jenis</h4>
                        <div class="space-y-3">
                            {#each Object.entries(currentReport.type_breakdown) as [type, amount]}
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium text-slate-700">{type}</span>
                                    <span class="text-sm font-semibold text-slate-900 font-tabular">{formatCurrency(amount)}</span>
                                </div>
                            {/each}
                        </div>
                    </div>

                    <div class="card p-5">
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Breakdown per Status</h4>
                        <div class="space-y-3">
                            {#each Object.entries(currentReport.status_breakdown) as [status, count]}
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium text-slate-700">{status}</span>
                                    <span class="text-sm font-semibold text-slate-900 font-tabular">{count.toLocaleString("id-ID")}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Monthly Breakdown -->
                {#if Object.keys(currentReport.monthly_breakdown).length > 0}
                    <div class="mt-6">
                        <h4 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Breakdown Bulanan</h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {#each Object.entries(currentReport.monthly_breakdown) as [month, amount]}
                                <div class="card p-3.5 stagger-item">
                                    <p class="text-xs font-medium text-slate-500 mb-0.5">{month}</p>
                                    <p class="text-base font-semibold text-slate-900 font-tabular">{formatCurrency(amount)}</p>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>

<style>
    @media print {
        .no-print { display: none; }
        body { background: white !important; }
        #report-content { box-shadow: none !important; border: none !important; }
    }
</style>
