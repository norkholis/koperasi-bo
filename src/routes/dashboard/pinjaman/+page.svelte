<script lang="ts">
    import type {
        Loan,
        Installment,
        LoanRequest,
        InstallmentRequest,
        BungaOption,
    } from "$lib/types";
    import { page } from "$app/stores";
    import { invalidateAll, goto } from "$app/navigation";
    import axios from "$lib/api";
    import { onMount } from "svelte";
    import {
        showSuccess,
        showError,
        showWarning,
    } from "$lib/stores/notifications";

    export let data;

    let loans: Loan[] = data.loans || [];
    let pendingInstallments: Installment[] = data.pendingInstallments || [];
    let activeBungaOptions: BungaOption[] = data.activeBungaOptions || [];
    const currentUser = data.currentUser;
    const selectedUserId = data.selectedUserId;

    // Debug logging
    console.log("🚀 Pinjaman page loaded");
    console.log(
        "👤 Current user:",
        currentUser?.email,
        currentUser?.role?.name,
    );
    console.log("🎯 Selected User ID:", selectedUserId);
    console.log("💼 Loans count:", loans.length);

    if (loans.length > 0) {
        console.log("✅ Loans loaded successfully:", loans.length);
        console.log("🔍 First loan:", loans[0]);
        console.log("🔍 First loan fields:");
        console.log(
            "  - jumlah_pinjaman:",
            loans[0].jumlah_pinjaman,
            typeof loans[0].jumlah_pinjaman,
        );
        console.log(
            "  - lama_bulan:",
            loans[0].lama_bulan,
            typeof loans[0].lama_bulan,
        );
        console.log(
            "  - kode_pinjaman:",
            loans[0].kode_pinjaman,
            typeof loans[0].kode_pinjaman,
        );
        console.log("📋 All loans status summary:");
        loans.forEach((loan, index) => {
            console.log(
                `  Loan ${index + 1}: status="${loan.status}" sisa_angsuran=${loan.sisa_angsuran}`,
            );
        });
    } else {
        console.log("⚠️ No loans found");
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
    let showLoanRequestModal = false;
    let showLoanDetailModal = false;
    let showInstallmentModal = false;
    let showInstallmentDetailModal = false;
    let selectedLoan: Loan | null = null;
    let selectedInstallment: Installment | null = null;
    let loanInstallments: Installment[] = [];

    // Form data
    let loanRequestForm: LoanRequest = {
        jumlah_pinjaman: 0,
        bunga_option_id: 0,
        lama_bulan: 12,
        jumlah_angsuran: 0,
        no_rekening_pencairan: "",
        bank_name: "",
    };

    let selectedBungaOption: BungaOption | null = null;

    let installmentForm: InstallmentRequest = {
        pinjaman_id: 0,
        angsuran_ke: 1,
        pokok: 0,
        bunga: 0,
        denda: 0,
    };

    onMount(() => {
        // Check for success message in URL params
        const success = $page.url.searchParams.get("success");
        if (success) {
            successMessage = success;
            showSuccessMessage = true;
            setTimeout(() => {
                showSuccessMessage = false;
            }, 5000);
        }

        // Calculate installment when form values change
        calculateInstallment();
    });

    // Format currency
    function formatCurrency(amount: number | null | undefined): string {
        console.log("💰 formatCurrency called with:", amount, typeof amount);
        if (amount === null || amount === undefined || isNaN(amount)) {
            console.log(
                "⚠️ formatCurrency returning 'Rp 0' for invalid amount:",
                amount,
            );
            return "Rp 0";
        }
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
        console.log("✅ formatCurrency formatted", amount, "to", formatted);
        return formatted;
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

    // Get status color classes
    function getStatusColor(status: string): string {
        const colors = {
            proses: "bg-yellow-100 text-yellow-800 border-yellow-200",
            disetujui: "bg-green-100 text-green-800 border-green-200",
            lunas: "bg-blue-100 text-blue-800 border-blue-200",
            macet: "bg-red-100 text-red-800 border-red-200",
            verified: "bg-green-100 text-green-800 border-green-200",
            kurang: "bg-orange-100 text-orange-800 border-orange-200",
            lebih: "bg-purple-100 text-purple-800 border-purple-200",
        };
        return (
            colors[status as keyof typeof colors] ||
            "bg-gray-100 text-gray-800 border-gray-200"
        );
    }

    // Get status display text
    function getStatusText(status: string): string {
        const statusMap = {
            proses: "Proses",
            disetujui: "Disetujui",
            lunas: "Lunas",
            macet: "Macet",
            verified: "Terverifikasi",
            kurang: "Kurang",
            lebih: "Lebih",
        };
        return statusMap[status as keyof typeof statusMap] || status;
    }

    // Calculate monthly installment
    function calculateInstallment() {
        if (
            loanRequestForm.jumlah_pinjaman > 0 &&
            loanRequestForm.lama_bulan > 0 &&
            selectedBungaOption
        ) {
            const principal =
                loanRequestForm.jumlah_pinjaman / loanRequestForm.lama_bulan;
            const interest =
                (loanRequestForm.jumlah_pinjaman * selectedBungaOption.persen) /
                100 /
                loanRequestForm.lama_bulan;
            loanRequestForm.jumlah_angsuran = Math.ceil(principal + interest);
        }
    }

    // Handle bunga option selection
    function onBungaOptionChange() {
        if (loanRequestForm.bunga_option_id > 0) {
            selectedBungaOption =
                activeBungaOptions.find(
                    (bunga) => bunga.id === loanRequestForm.bunga_option_id,
                ) || null;
            calculateInstallment();
        } else {
            selectedBungaOption = null;
            loanRequestForm.jumlah_angsuran = 0;
        }
    }

    // Modal functions
    function openLoanRequestModal() {
        loanRequestForm = {
            jumlah_pinjaman: 0,
            bunga_option_id: 0,
            lama_bulan: 12,
            jumlah_angsuran: 0,
            no_rekening_pencairan: "",
            bank_name: "",
        };
        selectedBungaOption = null;
        showLoanRequestModal = true;
    }

    async function openLoanDetailModal(loan: Loan) {
        selectedLoan = loan;
        try {
            console.log("🔍 Loading installments for loan:", loan.id);
            console.log("🌐 API Call: GET /angsuran?pinjaman_id=" + loan.id);

            const response = await axios.get(
                `/angsuran?pinjaman_id=${loan.id}`,
            );
            console.log("📊 Raw installments response:", response.data);

            // Transform the installment data
            const rawInstallments = response.data.data || [];
            console.log(
                "🔍 Raw installments array length:",
                rawInstallments.length,
            );

            if (rawInstallments.length === 0) {
                console.log("⚠️ No installments found for loan", loan.id);
                console.log(
                    "💡 This means no payments have been made yet. User needs to make payments first.",
                );
            }

            loanInstallments = rawInstallments.map((installment: any) => ({
                id: installment.ID,
                pinjaman_id: installment.pinjaman_id, // snake_case in API response
                angsuran_ke: installment.angsuran_ke, // snake_case in API response
                tanggal_bayar: installment.tanggal_bayar, // snake_case in API response
                pokok: installment.pokok, // snake_case in API response
                bunga: installment.bunga, // snake_case in API response
                denda: installment.denda, // snake_case in API response
                total_bayar: installment.total_bayar, // snake_case in API response
                user_id: installment.user_id, // snake_case in API response
                status: installment.status, // snake_case in API response
            }));

            console.log("✅ Transformed loan installments:", loanInstallments);
            showLoanDetailModal = true;
        } catch (error) {
            console.error("❌ Error loading loan installments:", error);
            showError("Gagal memuat detail pinjaman");
        }
    }

    function openInstallmentModal(loan: Loan) {
        selectedLoan = loan;
        const nextInstallmentNumber = loanInstallments.length + 1;
        const effectiveRate = getEffectiveInterestRate(loan);
        installmentForm = {
            pinjaman_id: loan.id,
            angsuran_ke: nextInstallmentNumber,
            pokok: Math.ceil(loan.jumlah_pinjaman / loan.lama_bulan),
            bunga: Math.ceil(
                (loan.jumlah_pinjaman * effectiveRate) / 100 / loan.lama_bulan,
            ),
            denda: 0,
        };
        showInstallmentModal = true;
    }

    function openInstallmentDetailModal(installment: Installment) {
        selectedInstallment = installment;
        showInstallmentDetailModal = true;
    }

    function closeModals() {
        showLoanRequestModal = false;
        showLoanDetailModal = false;
        showInstallmentModal = false;
        showInstallmentDetailModal = false;
        selectedLoan = null;
        selectedInstallment = null;
        loanInstallments = [];
    }

    // Navigate to user-specific loan view
    async function viewUserLoans(loan: Loan) {
        console.log("🔍 Viewing loans for user:", loan.user_id);
        console.log("📊 Loan details:", loan);

        isNavigating = true;

        try {
            const url = `/dashboard/pinjaman?user_id=${loan.user_id}`;
            console.log("🚀 Navigating to:", url);
            await goto(url);
            console.log("✅ Navigation successful");
        } catch (error) {
            console.error("❌ Navigation error:", error);
            //alert("Gagal membuka detail pinjaman: " + error.message);
        } finally {
            isNavigating = false;
        }
    }

    function showSuccessNotification(message: string) {
        successMessage = message;
        showSuccessMessage = true;
        setTimeout(() => {
            showSuccessMessage = false;
        }, 5000);
    }

    // Loan request operations (Members)
    async function requestLoan() {
        try {
            console.log("📝 Requesting loan:", loanRequestForm);

            // Transform to API format using new bunga option structure
            const apiPayload = {
                jumlah_pinjaman: loanRequestForm.jumlah_pinjaman,
                bunga_option_id: loanRequestForm.bunga_option_id,
                lama_bulan: loanRequestForm.lama_bulan,
                jumlah_angsuran: loanRequestForm.jumlah_angsuran,
                no_rekening_pencairan: loanRequestForm.no_rekening_pencairan,
                bank_name: loanRequestForm.bank_name,
            };

            console.log("🔄 API Payload:", apiPayload);
            const response = await axios.post("/pinjaman", apiPayload);
            console.log("✅ Loan creation response:", response.data);

            // Update local loan data
            await invalidateAll();

            closeModals();
            showSuccessNotification("Pengajuan pinjaman berhasil dikirim!");
        } catch (error: any) {
            console.error("Error requesting loan:", error);
            showError(
                `Gagal mengajukan pinjaman: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    // Installment operations (Members)
    async function submitInstallment() {
        if (!selectedLoan) {
            showError("Pinjaman tidak ditemukan");
            return;
        }

        try {
            console.log(
                "💰 Submitting installment for loan ID:",
                selectedLoan.id,
            );
            console.log("📋 Installment form data:", installmentForm);

            // Transform to the format that works with the API (mixed case based on testing)
            const apiPayload = {
                pinjaman_id: installmentForm.pinjaman_id,
                angsuran_ke: installmentForm.angsuran_ke,
                tanggal_bayar: new Date().toISOString(),
                pokok: installmentForm.pokok,
                bunga: installmentForm.bunga, // API has validation issue with this field
                denda: installmentForm.denda || 0,
                total_bayar:
                    installmentForm.pokok +
                    installmentForm.bunga +
                    (installmentForm.denda || 0),
                user_id: currentUser?.id,
                status: "proses",
            };

            console.log("🌐 API Call: POST /angsuran");
            console.log("📤 API Payload:", apiPayload);

            const response = await axios.post("/angsuran", apiPayload);
            console.log("✅ Installment submission response:", response.data);

            // Update local data
            await invalidateAll();

            closeModals();
            showSuccessNotification("Angsuran berhasil dikirim!");
        } catch (error: any) {
            console.error("❌ Error submitting installment:", error);
            console.error("❌ Error response:", error.response?.data);
            showError(
                `Gagal mengirim angsuran: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    // Loan approval operations (Admin only)
    async function updateLoanStatus(
        loanId: number,
        status: "disetujui" | "macet",
    ) {
        try {
            console.log("🔍 Updating loan status:", loanId, status);

            // Find the loan to preserve its data
            const loan = loans.find((l) => l.id === loanId);
            if (!loan) {
                throw new Error("Loan not found");
            }

            // Send complete loan data to preserve interest rate
            const updatePayload = {
                status,
                bunga_persen: loan.bunga_persen, // Preserve interest rate
                BungaPersen: loan.bunga_persen, // Also send PascalCase version
            };

            console.log("🔄 Update payload:", updatePayload);
            await axios.put(`/pinjaman/${loanId}`, updatePayload);

            // Update local loan data
            loans = loans.map((loan) =>
                loan.id === loanId ? { ...loan, status } : loan,
            );

            closeModals();
            showSuccessNotification(
                `Pinjaman berhasil diubah ke status ${getStatusText(status)}!`,
            );
        } catch (error: any) {
            console.error("Error updating loan status:", error);
            showError(
                `Gagal memproses pinjaman: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    // Installment verification operations (Admin only)
    async function verifyInstallment(
        installmentId: number,
        status: "verified" | "kurang" | "lebih",
    ) {
        try {
            console.log("🔍 Verifying installment:", installmentId, status);
            await axios.put(`/angsuran/${installmentId}/verify`, { status });

            // Remove from pending list if in admin view
            pendingInstallments = pendingInstallments.filter(
                (p) => p.id !== installmentId,
            );

            // Update installment in loan installments list
            loanInstallments = loanInstallments.map((installment) =>
                installment.id === installmentId
                    ? { ...installment, status }
                    : installment,
            );

            closeModals();
            showSuccessNotification(
                `Angsuran berhasil ${getStatusText(status)}!`,
            );
        } catch (error: any) {
            console.error("Error verifying installment:", error);
            showError(
                `Gagal memverifikasi angsuran: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    // Helper function to calculate effective interest rate
    function getEffectiveInterestRate(loan: Loan): number {
        if (loan.bunga_persen && loan.bunga_persen > 0) {
            return loan.bunga_persen;
        }

        // Calculate based on installment amount vs principal
        const principal = loan.jumlah_pinjaman / loan.lama_bulan;
        const totalPayment = loan.jumlah_angsuran;

        if (totalPayment > principal) {
            const interestAmount = totalPayment - principal;
            const monthlyInterestRate = (interestAmount / principal) * 100;
            return Math.round(monthlyInterestRate * 100) / 100; // Round to 2 decimal places
        }

        return 0;
    }

    // Reactive statement to recalculate installment when form changes
    $: if (loanRequestForm.jumlah_pinjaman && loanRequestForm.lama_bulan) {
        calculateInstallment();
    }
</script>

<svelte:head>
    <title>Pinjaman - Koperasi Backoffice</title>
</svelte:head>

<div class="p-4 sm:p-6">
    <!-- Header -->
    <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
    >
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 class="text-xl sm:text-2xl font-bold">
                {isMember ? "Pinjaman Saya" : "Manajemen Pinjaman"}
            </h1>
            {#if selectedUserId && isAdmin}
                <a
                    href="/dashboard/pinjaman"
                    class="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    ← Kembali ke Semua Pinjaman
                </a>
            {/if}
        </div>

        {#if selectedUserId && isAdmin}
            <div class="text-sm text-gray-600">
                Menampilkan pinjaman untuk User ID: #{selectedUserId}
            </div>
        {/if}
    </div>

    <!-- Success Message -->
    {#if showSuccessMessage}
        <div
            class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded"
        >
            {successMessage}
        </div>
    {/if}

    <!-- Member Dashboard -->
    {#if isMember || selectedUserId}
        <div class="mb-8">
            <div
                class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3"
            >
                <h2 class="text-lg sm:text-xl font-semibold">Pinjaman Aktif</h2>
                {#if isMember}
                    <button
                        on:click={openLoanRequestModal}
                        class="w-full sm:w-auto bg-blue-500 text-white px-4 py-3 sm:py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Ajukan Pinjaman
                    </button>
                {/if}
            </div>

            <div class="grid gap-4">
                {#each loans.filter((loan) => loan.status === "disetujui") as loan}
                    <div class="bg-white p-6 rounded-lg shadow border">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <h3 class="text-lg font-semibold">
                                        Pinjaman #{loan.kode_pinjaman}
                                    </h3>
                                    <span
                                        class="px-2 py-1 text-xs rounded-full border {getStatusColor(
                                            loan.status,
                                        )}"
                                    >
                                        {getStatusText(loan.status)}
                                    </span>
                                </div>
                                <div
                                    class="grid grid-cols-2 gap-4 text-sm text-gray-600"
                                >
                                    <div>
                                        <p>
                                            <span class="font-medium"
                                                >Jumlah:</span
                                            >
                                            {formatCurrency(
                                                loan.jumlah_pinjaman,
                                            )}
                                        </p>
                                        <p>
                                            <span class="font-medium"
                                                >Tenor:</span
                                            >
                                            {loan.lama_bulan} bulan
                                        </p>
                                        <p>
                                            <span class="font-medium"
                                                >Bunga:</span
                                            >
                                            {getEffectiveInterestRate(loan)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p>
                                            <span class="font-medium"
                                                >Angsuran/bulan:</span
                                            >
                                            {formatCurrency(
                                                loan.jumlah_angsuran,
                                            )}
                                        </p>
                                        <p>
                                            <span class="font-medium"
                                                >Sisa angsuran:</span
                                            >
                                            {loan.sisa_angsuran} kali
                                        </p>
                                        <p>
                                            <span class="font-medium"
                                                >Diajukan:</span
                                            >
                                            {formatDate(loan.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-2 ml-4">
                                {#if loan.status === "disetujui" && isMember}
                                    <button
                                        on:click={() =>
                                            openInstallmentModal(loan)}
                                        class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    >
                                        Bayar Angsuran
                                    </button>
                                {/if}
                                <button
                                    on:click={() => openLoanDetailModal(loan)}
                                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Detail
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}

                {#if loans.filter((loan) => loan.status === "disetujui" && loan.sisa_angsuran > 0).length === 0}
                    <div class="text-center py-8 text-gray-500">
                        {#if isMember}
                            Belum ada pinjaman aktif. <button
                                on:click={openLoanRequestModal}
                                class="text-blue-600 hover:text-blue-800 underline"
                                >Ajukan pinjaman pertama</button
                            >
                        {:else}
                            Tidak ada pinjaman aktif untuk user ini.
                        {/if}
                    </div>
                {/if}
            </div>
        </div>

        <!-- All Loans History -->
        <div class="mb-8">
            <h2 class="text-lg sm:text-xl font-semibold mb-4">
                Riwayat Pinjaman
            </h2>

            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >Kode</th
                                >
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >Jumlah</th
                                >
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >Tenor</th
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
                                    >Aksi</th
                                >
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each loans as loan}
                                <tr class="hover:bg-gray-50">
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                    >
                                        {loan.kode_pinjaman}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {formatCurrency(loan.jumlah_pinjaman)}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {loan.lama_bulan} bulan
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="px-2 py-1 text-xs rounded-full border {getStatusColor(
                                                loan.status,
                                            )}"
                                        >
                                            {getStatusText(loan.status)}
                                        </span>
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {formatDate(loan.created_at)}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                                    >
                                        <button
                                            on:click={() =>
                                                openLoanDetailModal(loan)}
                                            class="text-blue-600 hover:text-blue-900 mr-2"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    {/if}

    <!-- Admin Dashboard -->
    {#if isAdmin && !selectedUserId}
        <!-- Pending Approvals -->
        {#if pendingInstallments.length > 0}
            <div class="mb-8">
                <h2 class="text-lg sm:text-xl font-semibold mb-4">
                    Angsuran Menunggu Verifikasi
                </h2>

                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >User</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Pinjaman</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Angsuran Ke</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Total</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Tanggal</th
                                    >
                                    <th
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >Aksi</th
                                    >
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each pendingInstallments as installment}
                                    <tr class="hover:bg-gray-50">
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {installment.user?.name ||
                                                installment.user?.email ||
                                                `User #${installment.user_id}`}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {installment.pinjaman
                                                ?.kode_pinjaman ||
                                                `#${installment.pinjaman_id}`}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {installment.angsuran_ke}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {formatCurrency(
                                                installment.total_bayar,
                                            )}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {formatDate(
                                                installment.tanggal_bayar,
                                            )}
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                                        >
                                            <div class="flex gap-2">
                                                <button
                                                    on:click={() =>
                                                        openInstallmentDetailModal(
                                                            installment,
                                                        )}
                                                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                >
                                                    Detail
                                                </button>
                                                <button
                                                    on:click={() =>
                                                        verifyInstallment(
                                                            installment.id,
                                                            "verified",
                                                        )}
                                                    class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                >
                                                    Verifikasi
                                                </button>
                                                <button
                                                    on:click={() =>
                                                        verifyInstallment(
                                                            installment.id,
                                                            "kurang",
                                                        )}
                                                    class="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                                                >
                                                    Kurang
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        {/if}

        <!-- All Loans Management -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Semua Pinjaman</h2>

            <div class="bg-white rounded-lg shadow overflow-hidden">
                <!-- Desktop Table -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >Kode</th
                                >
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >User</th
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
                                    >Sisa</th
                                >
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >Tanggal</th
                                >
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >Aksi</th
                                >
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each loans as loan}
                                <tr class="hover:bg-gray-50">
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                    >
                                        {loan.kode_pinjaman}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {loan.user?.name ||
                                            loan.user?.email ||
                                            `User #${loan.user_id}`}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {formatCurrency(loan.jumlah_pinjaman)}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="px-2 py-1 text-xs rounded-full border {getStatusColor(
                                                loan.status,
                                            )}"
                                        >
                                            {getStatusText(loan.status)}
                                        </span>
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {loan.sisa_angsuran}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {formatDate(loan.created_at)}
                                    </td>
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                                    >
                                        <div class="flex gap-2">
                                            {#if loan.status === "proses"}
                                                <button
                                                    on:click={() =>
                                                        updateLoanStatus(
                                                            loan.id,
                                                            "disetujui",
                                                        )}
                                                    class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    on:click={() =>
                                                        updateLoanStatus(
                                                            loan.id,
                                                            "macet",
                                                        )}
                                                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                >
                                                    Tolak
                                                </button>
                                            {/if}
                                            <button
                                                on:click={() =>
                                                    openLoanDetailModal(loan)}
                                                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                            >
                                                Detail
                                            </button>
                                            <button
                                                on:click={() =>
                                                    viewUserLoans(loan)}
                                                disabled={isNavigating}
                                                class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                <!-- Mobile Card View -->
                <div class="md:hidden divide-y divide-gray-200">
                    {#each loans as loan}
                        <div class="p-4 bg-white hover:bg-gray-50">
                            <div class="flex items-start justify-between mb-3">
                                <div>
                                    <h3
                                        class="text-sm font-medium text-gray-900"
                                    >
                                        {loan.kode_pinjaman}
                                    </h3>
                                    <p class="text-xs text-gray-500 mt-1">
                                        {loan.user?.name ||
                                            loan.user?.email ||
                                            `User #${loan.user_id}`}
                                    </p>
                                    <p
                                        class="text-lg font-semibold text-blue-600 mt-1"
                                    >
                                        {formatCurrency(loan.jumlah_pinjaman)}
                                    </p>
                                </div>
                                <span
                                    class="px-2 py-1 text-xs rounded-full border {getStatusColor(
                                        loan.status,
                                    )}"
                                >
                                    {getStatusText(loan.status)}
                                </span>
                            </div>

                            <div
                                class="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4"
                            >
                                <div>
                                    <span class="font-medium"
                                        >Sisa angsuran:</span
                                    >
                                    {loan.sisa_angsuran} kali
                                </div>
                                <div>
                                    <span class="font-medium">Tanggal:</span>
                                    {formatDate(loan.created_at)}
                                </div>
                            </div>

                            <div class="flex flex-col gap-2">
                                {#if loan.status === "proses"}
                                    <div class="flex gap-2">
                                        <button
                                            on:click={() =>
                                                updateLoanStatus(
                                                    loan.id,
                                                    "disetujui",
                                                )}
                                            class="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                                        >
                                            ✓ Setujui
                                        </button>
                                        <button
                                            on:click={() =>
                                                updateLoanStatus(
                                                    loan.id,
                                                    "macet",
                                                )}
                                            class="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                                        >
                                            ✗ Tolak
                                        </button>
                                    </div>
                                {/if}
                                <div class="flex gap-2">
                                    <button
                                        on:click={() =>
                                            openLoanDetailModal(loan)}
                                        class="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        Detail
                                    </button>
                                    <button
                                        on:click={() => viewUserLoans(loan)}
                                        disabled={isNavigating}
                                        class="flex-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {#if isNavigating}
                                            Loading...
                                        {:else}
                                            Lihat Detail
                                        {/if}
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

<!-- Loan Request Modal -->
{#if showLoanRequestModal}
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
                Ajukan Pinjaman
            </h3>

            <form on:submit|preventDefault={requestLoan} class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Pinjaman
                    </label>
                    <input
                        type="number"
                        bind:value={loanRequestForm.jumlah_pinjaman}
                        min="1"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Masukkan jumlah pinjaman"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Tenor (bulan)
                    </label>
                    <select
                        bind:value={loanRequestForm.lama_bulan}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={6}>6 bulan</option>
                        <option value={12}>12 bulan</option>
                        <option value={18}>18 bulan</option>
                        <option value={24}>24 bulan</option>
                        <option value={36}>36 bulan</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Bunga
                    </label>
                    <select
                        bind:value={loanRequestForm.bunga_option_id}
                        on:change={onBungaOptionChange}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={0}>Pilih opsi bunga...</option>
                        {#each activeBungaOptions as bunga (bunga.id)}
                            <option value={bunga.id}>
                                {bunga.nama} - {bunga.persen}%
                                {#if bunga.deskripsi}
                                    ({bunga.deskripsi})
                                {/if}
                            </option>
                        {/each}
                    </select>
                    {#if selectedBungaOption}
                        <p class="text-xs text-gray-500 mt-1">
                            {selectedBungaOption.deskripsi || ""}
                        </p>
                    {/if}
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        No. Rekening Pencairan
                    </label>
                    <input
                        type="text"
                        bind:value={loanRequestForm.no_rekening_pencairan}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nomor rekening untuk pencairan dana"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nama Bank
                    </label>
                    <input
                        type="text"
                        bind:value={loanRequestForm.bank_name}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nama bank (contoh: Bank BCA)"
                    />
                </div>

                {#if loanRequestForm.jumlah_pinjaman > 0 && loanRequestForm.lama_bulan > 0 && selectedBungaOption}
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-sm text-gray-600 mb-2">
                            <span class="font-medium">Bunga yang dipilih:</span>
                            {selectedBungaOption.nama} ({selectedBungaOption.persen}%)
                        </p>
                        <p class="text-sm text-gray-600">
                            <span class="font-medium"
                                >Estimasi angsuran per bulan:</span
                            >
                            {formatCurrency(loanRequestForm.jumlah_angsuran)}
                        </p>
                    </div>
                {/if}

                <div class="flex gap-3 pt-4">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Ajukan
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Installment Modal -->
{#if showInstallmentModal && selectedLoan}
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
                Bayar Angsuran - {selectedLoan.kode_pinjaman}
            </h3>

            <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">
                    <span class="font-medium">Angsuran ke:</span>
                    {installmentForm.angsuran_ke}
                </p>
                <p class="text-sm text-gray-600">
                    <span class="font-medium">Sisa angsuran:</span>
                    {selectedLoan.sisa_angsuran} kali
                </p>
            </div>

            <form
                on:submit|preventDefault={submitInstallment}
                class="space-y-4"
            >
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Pokok
                    </label>
                    <input
                        type="number"
                        bind:value={installmentForm.pokok}
                        min="1"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Bunga
                    </label>
                    <input
                        type="number"
                        bind:value={installmentForm.bunga}
                        min="0"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Denda (opsional)
                    </label>
                    <input
                        type="number"
                        bind:value={installmentForm.denda}
                        min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-600">
                        <span class="font-medium">Total pembayaran:</span>
                        {formatCurrency(
                            installmentForm.pokok +
                                installmentForm.bunga +
                                (installmentForm.denda || 0),
                        )}
                    </p>
                </div>

                <div class="flex gap-3 pt-4">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        Bayar Angsuran
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Loan Detail Modal -->
{#if showLoanDetailModal && selectedLoan}
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
                Detail Pinjaman {selectedLoan.kode_pinjaman}
            </h3>

            <!-- Loan Information -->
            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Jumlah Pinjaman</p>
                        <p class="font-semibold text-lg">
                            {formatCurrency(selectedLoan.jumlah_pinjaman)}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Status</p>
                        <span
                            class="px-2 py-1 text-xs rounded-full border {getStatusColor(
                                selectedLoan.status,
                            )}"
                        >
                            {getStatusText(selectedLoan.status)}
                        </span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Tenor</p>
                        <p class="font-semibold">
                            {selectedLoan.lama_bulan} bulan
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Angsuran per bulan</p>
                        <p class="font-semibold">
                            {formatCurrency(selectedLoan.jumlah_angsuran)}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Bunga</p>
                        <p class="font-semibold">
                            {getEffectiveInterestRate(selectedLoan)}%
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Sisa Angsuran</p>
                        <p class="font-semibold">
                            {selectedLoan.sisa_angsuran} kali
                        </p>
                    </div>
                </div>
            </div>

            <!-- Installment History -->
            <div>
                <h4 class="font-semibold text-gray-900 mb-3">
                    Riwayat Angsuran
                </h4>

                {#if loanInstallments.length > 0}
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                        >Ke-</th
                                    >
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                        >Tanggal</th
                                    >
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                        >Pokok</th
                                    >
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                        >Bunga</th
                                    >
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                        >Denda</th
                                    >
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                        >Total</th
                                    >
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                        >Status</th
                                    >
                                    <th
                                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                                        >Aksi</th
                                    >
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each loanInstallments as installment}
                                    <tr class="hover:bg-gray-50">
                                        <td
                                            class="px-4 py-2 text-sm text-gray-900"
                                        >
                                            {installment.angsuran_ke}
                                        </td>
                                        <td
                                            class="px-4 py-2 text-sm text-gray-900"
                                        >
                                            {formatDate(
                                                installment.tanggal_bayar,
                                            )}
                                        </td>
                                        <td
                                            class="px-4 py-2 text-sm text-gray-900"
                                        >
                                            {formatCurrency(installment.pokok)}
                                        </td>
                                        <td
                                            class="px-4 py-2 text-sm text-gray-900"
                                        >
                                            {formatCurrency(installment.bunga)}
                                        </td>
                                        <td
                                            class="px-4 py-2 text-sm text-gray-900"
                                        >
                                            {formatCurrency(installment.denda)}
                                        </td>
                                        <td
                                            class="px-4 py-2 text-sm text-gray-900"
                                        >
                                            {formatCurrency(
                                                installment.total_bayar,
                                            )}
                                        </td>
                                        <td class="px-4 py-2">
                                            <span
                                                class="px-2 py-1 text-xs rounded-full border {getStatusColor(
                                                    installment.status,
                                                )}"
                                            >
                                                {getStatusText(
                                                    installment.status,
                                                )}
                                            </span>
                                        </td>
                                        <td class="px-4 py-2 text-sm">
                                            <div class="flex gap-2">
                                                <button
                                                    on:click={() =>
                                                        openInstallmentDetailModal(
                                                            installment,
                                                        )}
                                                    class="text-blue-600 hover:text-blue-900"
                                                >
                                                    Detail
                                                </button>
                                                {#if installment.status === "proses" && isAdmin}
                                                    <button
                                                        on:click={() =>
                                                            verifyInstallment(
                                                                installment.id,
                                                                "verified",
                                                            )}
                                                        class="text-green-600 hover:text-green-900"
                                                    >
                                                        Verifikasi
                                                    </button>
                                                    <button
                                                        on:click={() =>
                                                            verifyInstallment(
                                                                installment.id,
                                                                "kurang",
                                                            )}
                                                        class="text-orange-600 hover:text-orange-900"
                                                    >
                                                        Kurang
                                                    </button>
                                                {/if}
                                            </div>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                    <div class="text-center py-8">
                        <p class="text-gray-500">
                            Belum ada angsuran untuk pinjaman ini.
                        </p>
                    </div>
                {/if}
            </div>

            <div class="flex justify-end pt-4">
                <button
                    on:click={closeModals}
                    class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Installment Detail Modal -->
{#if showInstallmentDetailModal && selectedInstallment}
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
                Detail Angsuran #{selectedInstallment.angsuran_ke}
            </h3>

            <div class="space-y-3">
                <div>
                    <p class="text-sm text-gray-600">Pinjaman</p>
                    <p class="font-semibold">
                        {selectedInstallment.pinjaman?.kode_pinjaman ||
                            `#${selectedInstallment.pinjaman_id}`}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Pokok</p>
                    <p class="font-semibold">
                        {formatCurrency(selectedInstallment.pokok)}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Bunga</p>
                    <p class="font-semibold">
                        {formatCurrency(selectedInstallment.bunga)}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Denda</p>
                    <p class="font-semibold">
                        {formatCurrency(selectedInstallment.denda)}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Total Pembayaran</p>
                    <p class="font-semibold text-xl">
                        {formatCurrency(selectedInstallment.total_bayar)}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Status</p>
                    <span
                        class="px-2 py-1 text-xs rounded-full border {getStatusColor(
                            selectedInstallment.status,
                        )}"
                    >
                        {getStatusText(selectedInstallment.status)}
                    </span>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Tanggal Bayar</p>
                    <p class="text-gray-900">
                        {formatDate(selectedInstallment.tanggal_bayar)}
                    </p>
                </div>
            </div>

            <div class="flex gap-3 pt-6">
                {#if selectedInstallment.status === "proses" && isAdmin}
                    <button
                        on:click={() =>
                            verifyInstallment(
                                selectedInstallment?.id || 0,
                                "verified",
                            )}
                        class="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        Verifikasi
                    </button>
                    <button
                        on:click={() =>
                            verifyInstallment(
                                selectedInstallment?.id || 0,
                                "kurang",
                            )}
                        class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Kurang
                    </button>
                {:else}
                    <button
                        on:click={closeModals}
                        class="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Tutup
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}
