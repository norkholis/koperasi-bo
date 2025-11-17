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
    const error = data.error;

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
            console.log("📊 Generating financial report:", reportForm);

            const response = await axios.post("/reports/financial", reportForm);
            const result: FinancialReportResponse = response.data;

            currentReport = result.data;
            showSuccess("Laporan keuangan berhasil digenerate!");

            console.log("✅ Financial report generated:", currentReport);
        } catch (err: any) {
            console.error("❌ Error generating report:", err);
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

<div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <!-- Header -->
    <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
    >
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
                Generate Laporan Keuangan
            </h1>
            <p class="text-gray-600 mt-2">
                Buat laporan keuangan berdasarkan periode dan jenis yang dipilih
            </p>
        </div>
        {#if currentReport}
            <div class="mt-4 sm:mt-0 flex gap-2">
                <button
                    on:click={exportReport}
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Export JSON
                </button>
                <button
                    on:click={printReport}
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Print
                </button>
            </div>
        {/if}
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
        <!-- Report Generation Form -->
        <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
            <h3 class="text-lg font-medium text-gray-900 mb-4">
                Parameter Laporan
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Laporan
                    </label>
                    <select
                        bind:value={reportForm.report_type}
                        on:change={updateDateRange}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="DAILY">Harian</option>
                        <option value="WEEKLY">Mingguan</option>
                        <option value="MONTHLY">Bulanan</option>
                        <option value="YEARLY">Tahunan</option>
                        <option value="CUSTOM">Custom Range</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Mulai
                    </label>
                    <input
                        type="date"
                        bind:value={reportForm.start_date}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Akhir
                    </label>
                    <input
                        type="date"
                        bind:value={reportForm.end_date}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div class="mt-6">
                <button
                    on:click={generateReport}
                    disabled={generatingReport}
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if generatingReport}
                        <div class="flex items-center">
                            <div
                                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                            ></div>
                            Generating...
                        </div>
                    {:else}
                        Generate Laporan
                    {/if}
                </button>
            </div>
        </div>

        <!-- Report Display -->
        {#if currentReport}
            <div
                class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                id="report-content"
            >
                <!-- Report Header -->
                <div class="border-b border-gray-200 pb-6 mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">
                        Laporan Keuangan {currentReport.report_type}
                    </h2>
                    <p class="text-gray-600 mt-1">
                        Periode: {formatDate(currentReport.period_start)} - {formatDate(
                            currentReport.period_end,
                        )}
                    </p>
                    <p class="text-sm text-gray-500 mt-1">
                        Generated pada {formatDate(currentReport.generated_at)} oleh
                        User ID: {currentReport.generated_by}
                    </p>
                </div>

                <!-- Summary Cards -->
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <div class="bg-green-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg
                                    class="h-8 w-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-green-600">
                                    Total Simpanan
                                </p>
                                <p class="text-lg font-semibold text-green-900">
                                    {formatCurrency(
                                        currentReport.summary.total_simpanan,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg
                                    class="h-8 w-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-blue-600">
                                    Total Pinjaman
                                </p>
                                <p class="text-lg font-semibold text-blue-900">
                                    {formatCurrency(
                                        currentReport.summary.total_pinjaman,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-purple-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg
                                    class="h-8 w-8 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-purple-600">
                                    Total Angsuran
                                </p>
                                <p
                                    class="text-lg font-semibold text-purple-900"
                                >
                                    {formatCurrency(
                                        currentReport.summary.total_angsuran,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-yellow-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <svg
                                    class="h-8 w-8 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-yellow-600">
                                    Total SHU
                                </p>
                                <p
                                    class="text-lg font-semibold text-yellow-900"
                                >
                                    {formatCurrency(
                                        currentReport.summary.total_shu,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Transaction Count -->
                <div class="bg-gray-50 rounded-lg p-4 mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">
                                Total Transaksi
                            </p>
                            <p class="text-2xl font-bold text-gray-900">
                                {currentReport.transaction_count.toLocaleString(
                                    "id-ID",
                                )}
                            </p>
                        </div>
                        <div class="text-gray-400">
                            <svg
                                class="h-12 w-12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Breakdown Tables -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Type Breakdown -->
                    <div>
                        <h4 class="text-lg font-medium text-gray-900 mb-4">
                            Breakdown per Jenis
                        </h4>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="space-y-3">
                                {#each Object.entries(currentReport.type_breakdown) as [type, amount]}
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <span
                                            class="text-sm font-medium text-gray-700"
                                            >{type}</span
                                        >
                                        <span
                                            class="text-sm font-semibold text-gray-900"
                                            >{formatCurrency(amount)}</span
                                        >
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>

                    <!-- Status Breakdown -->
                    <div>
                        <h4 class="text-lg font-medium text-gray-900 mb-4">
                            Breakdown per Status
                        </h4>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="space-y-3">
                                {#each Object.entries(currentReport.status_breakdown) as [status, count]}
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <span
                                            class="text-sm font-medium text-gray-700"
                                            >{status}</span
                                        >
                                        <span
                                            class="text-sm font-semibold text-gray-900"
                                            >{count.toLocaleString(
                                                "id-ID",
                                            )}</span
                                        >
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Monthly Breakdown -->
                {#if Object.keys(currentReport.monthly_breakdown).length > 0}
                    <div class="mt-8">
                        <h4 class="text-lg font-medium text-gray-900 mb-4">
                            Breakdown Bulanan
                        </h4>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div
                                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {#each Object.entries(currentReport.monthly_breakdown) as [month, amount]}
                                    <div class="bg-white rounded-lg p-3">
                                        <p
                                            class="text-sm font-medium text-gray-600"
                                        >
                                            {month}
                                        </p>
                                        <p
                                            class="text-lg font-semibold text-gray-900"
                                        >
                                            {formatCurrency(amount)}
                                        </p>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    {/if}
</div>

<style>
    @media print {
        .no-print {
            display: none;
        }

        body {
            background: white !important;
        }

        #report-content {
            box-shadow: none !important;
            border: none !important;
        }
    }
</style>
