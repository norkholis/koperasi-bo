<script lang="ts">
    import type {
        Loan,
        Installment,
        LoanRequest,
        InstallmentRequest,
        BungaOption,
        BankAccount,
    } from "$lib/types";
    import { page } from "$app/stores";
    import { invalidateAll, goto } from "$app/navigation";
    import axios from "$lib/api";
    import { onMount } from "svelte";
    import { uploadImageToCloudinary } from "$lib/cloudinary";
    import {
        showSuccess,
        showError,
        showWarning,
    } from "$lib/stores/notifications";

    export let data;

    let loans: Loan[] = data.loans || [];
    let pendingInstallments: Installment[] = data.pendingInstallments || [];
    let activeBungaOptions: BungaOption[] = data.activeBungaOptions || [];
    let activeBankAccounts: BankAccount[] = [];
    const currentUser = data.currentUser;
    const selectedUserId = data.selectedUserId;

    // Debug logging
    console.log(
        "🔍 Page loaded with pendingInstallments:",
        pendingInstallments,
    );
    console.log("🔍 First installment:", pendingInstallments[0]);
    if (pendingInstallments[0]) {
        console.log(
            "🔍 First installment image_bukti_transfer:",
            pendingInstallments[0].image_bukti_transfer,
        );
        console.log(
            "🔍 First installment bank_name:",
            pendingInstallments[0].bank_name,
        );
        console.log(
            "🔍 First installment no_rekening:",
            pendingInstallments[0].no_rekening,
        );
    }
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
    const isMember =
        currentUser?.role?.name === "member" ||
        currentUser?.role?.name === "user";

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
        pokok: 0,
        bunga: 0,
        denda: 0,
        image_bukti_transfer: "",
        no_rekening: "",
        bank_name: "",
    };

    // Image upload state for installment
    let useFileUploadInstallment = false;
    let isUploadingInstallment = false;
    let selectedFileInstallment: File | null = null;

    onMount(async () => {
        // Fetch active bank accounts
        await fetchActiveBankAccounts();

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

    async function fetchActiveBankAccounts() {
        try {
            const response = await axios.get("/bank-accounts/active");
            activeBankAccounts = response.data.data || response.data || [];
        } catch (error: any) {
            console.error("Failed to fetch bank accounts:", error);
        }
    }

    // Debug function to test API calls directly
    async function debugApiCalls() {
        console.log("🧪 Starting API debug test...");

        try {
            console.log("🔍 Testing /pinjaman endpoint...");
            const loansResponse = await axios.get("/pinjaman");
            console.log("✅ Loans API response:", loansResponse.data);
            console.log("📊 Loans data:", loansResponse.data.data);
            console.log(
                "📊 Loans count:",
                loansResponse.data.data?.length || 0,
            );

            if (loansResponse.data.data && loansResponse.data.data.length > 0) {
                console.log(
                    "🔍 First loan from direct API call:",
                    loansResponse.data.data[0],
                );
            } else {
                console.log("⚠️ No loans returned from direct API call");
            }
        } catch (error) {
            console.error("❌ Error in direct loans API call:", error);
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as any;
                console.error(
                    "❌ Direct API error status:",
                    axiosError.response?.status,
                );
                console.error(
                    "❌ Direct API error data:",
                    axiosError.response?.data,
                );
            }
        }

        try {
            console.log("🔍 Testing /bunga-options endpoint...");
            const bungaResponse = await axios.get("/bunga-options", {
                params: { active: true },
            });
            console.log("✅ Bunga API response:", bungaResponse.data);
            console.log("📊 Bunga data:", bungaResponse.data.data);
            console.log(
                "📊 Bunga count:",
                bungaResponse.data.data?.length || 0,
            );
        } catch (error) {
            console.error("❌ Error in direct bunga API call:", error);
        }

        console.log("🧪 API debug test completed");

        // Debug current loans and user relationships
        console.log("🔍 Current loans analysis:");
        console.log("👤 Current user:", {
            id: currentUser?.id,
            email: currentUser?.email,
            role: currentUser?.role?.name,
        });

        loans.forEach((loan, index) => {
            console.log(`📋 Loan ${index + 1}:`, {
                id: loan.id,
                kode_pinjaman: loan.kode_pinjaman,
                user_id: loan.user_id,
                status: loan.status,
                user: loan.user,
                canApprove:
                    currentUser?.role?.name === "super_admin" ||
                    (currentUser?.role?.name === "admin" &&
                        loan.user_id === currentUser?.id),
            });
        });
    }

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
        console.log("🧮 Calculating installment...");
        console.log("  - Loan amount:", loanRequestForm.jumlah_pinjaman);
        console.log("  - Duration (months):", loanRequestForm.lama_bulan);
        console.log("  - Selected bunga:", selectedBungaOption);

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

            console.log("  - Principal per month:", principal);
            console.log("  - Interest per month:", interest);
            console.log("  - Bunga percentage:", selectedBungaOption.persen);

            loanRequestForm.jumlah_angsuran = Math.ceil(principal + interest);
            console.log(
                "  - Calculated installment:",
                loanRequestForm.jumlah_angsuran,
            );
        } else {
            console.log("❌ Cannot calculate installment - missing data:");
            console.log(
                "  - Has loan amount?",
                loanRequestForm.jumlah_pinjaman > 0,
            );
            console.log("  - Has duration?", loanRequestForm.lama_bulan > 0);
            console.log("  - Has selected bunga?", !!selectedBungaOption);
            loanRequestForm.jumlah_angsuran = 0;
        }
    }

    // Handle bunga option selection
    function onBungaOptionChange() {
        console.log(
            "🔄 Bunga option changed to ID:",
            loanRequestForm.bunga_option_id,
            typeof loanRequestForm.bunga_option_id,
        );
        console.log("📋 Available bunga options:", activeBungaOptions);

        if (loanRequestForm.bunga_option_id > 0) {
            // Convert to number to ensure proper comparison
            const selectedId = Number(loanRequestForm.bunga_option_id);
            console.log("🔍 Looking for bunga with ID:", selectedId);

            selectedBungaOption =
                activeBungaOptions.find((bunga) => {
                    console.log(
                        `  Comparing ${bunga.id} (${typeof bunga.id}) === ${selectedId} (${typeof selectedId})`,
                    );
                    return Number(bunga.id) === selectedId;
                }) || null;

            console.log("✅ Selected bunga option:", selectedBungaOption);
            calculateInstallment();
        } else {
            selectedBungaOption = null;
            loanRequestForm.jumlah_angsuran = 0;
            console.log("❌ No bunga option selected");
        }
        console.log(
            "💰 Calculated installment:",
            loanRequestForm.jumlah_angsuran,
        );
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
                image_bukti_transfer: installment.image_bukti_transfer, // Payment proof image
                no_rekening: installment.no_rekening, // Account number
                bank_name: installment.bank_name, // Bank name
                pinjaman: installment.pinjaman,
                user: installment.user,
            }));

            console.log("✅ Transformed loan installments:", loanInstallments);
            showLoanDetailModal = true;
        } catch (error) {
            console.error("❌ Error loading loan installments:", error);
            showError("Gagal memuat detail pinjaman");
        }
    }

    async function openInstallmentModal(loan: Loan) {
        selectedLoan = loan;

        // Fetch existing installments to calculate the next installment number
        try {
            const response = await axios.get(
                `/angsuran?pinjaman_id=${loan.id}`,
            );
            const rawInstallments = response.data.data || [];
            loanInstallments = rawInstallments.map((installment: any) => ({
                id: installment.ID,
                pinjaman_id: installment.pinjaman_id,
                angsuran_ke: installment.angsuran_ke,
                tanggal_bayar: installment.tanggal_bayar,
                pokok: installment.pokok,
                bunga: installment.bunga,
                denda: installment.denda || 0,
                total_bayar: installment.total_bayar,
                status: installment.status,
                image_bukti_transfer: installment.image_bukti_transfer,
                no_rekening: installment.no_rekening,
                bank_name: installment.bank_name,
                created_at: installment.created_at,
            }));
        } catch (error: any) {
            console.error("Failed to fetch installments:", error);
            loanInstallments = [];
        }

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
            image_bukti_transfer: "",
            bank_account_id: "",
            no_rekening: "",
            bank_name: "",
        };
        // Reset upload state
        useFileUploadInstallment = false;
        selectedFileInstallment = null;
        isUploadingInstallment = false;
        showInstallmentModal = true;
    }

    // Handle file selection and upload for installment
    async function handleFileSelectInstallment(event: Event) {
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

        selectedFileInstallment = file;
        isUploadingInstallment = true;

        try {
            const url = await uploadImageToCloudinary(file);
            installmentForm.image_bukti_transfer = url;
            showSuccess("Gambar berhasil diupload!");
        } catch (error) {
            showError("Gagal mengupload gambar. Silakan coba lagi.");
            console.error("Upload error:", error);
        } finally {
            isUploadingInstallment = false;
        }
    }

    function openInstallmentDetailModal(installment: Installment) {
        console.log("📋 Opening installment detail modal:", installment);
        console.log(
            "📋 Image bukti transfer:",
            installment.image_bukti_transfer,
        );
        console.log("📋 Bank name:", installment.bank_name);
        console.log("📋 No rekening:", installment.no_rekening);
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
            console.log("📝 === LOAN REQUEST DEBUG ===");
            console.log("Form data:", JSON.stringify(loanRequestForm, null, 2));
            console.log("Selected bunga option:", selectedBungaOption);
            console.log("Active bunga options:", activeBungaOptions);
            console.log(
                "Bunga option ID type:",
                typeof loanRequestForm.bunga_option_id,
            );

            // Let's try a different approach - find the bunga option regardless of selectedBungaOption state
            let bungaToUse = selectedBungaOption;

            if (!bungaToUse && loanRequestForm.bunga_option_id) {
                console.log("🔍 Searching for bunga option...");
                const selectedId = Number(loanRequestForm.bunga_option_id);
                console.log("Looking for ID:", selectedId);

                bungaToUse =
                    activeBungaOptions.find((bunga) => {
                        const bungaId = Number(bunga.id);
                        console.log(
                            `Comparing: ${bungaId} === ${selectedId} ? ${bungaId === selectedId}`,
                        );
                        return bungaId === selectedId;
                    }) || null;
                console.log("Found bunga:", bungaToUse);
            }

            // Basic validation
            if (!bungaToUse) {
                console.log("❌ VALIDATION FAILED - No bunga found");
                console.log(
                    "bunga_option_id:",
                    loanRequestForm.bunga_option_id,
                );
                console.log("selectedBungaOption:", selectedBungaOption);
                console.log(
                    "Available options:",
                    activeBungaOptions.map((b) => ({ id: b.id, nama: b.nama })),
                );
                showError("Silakan pilih bunga terlebih dahulu");
                return;
            }

            if (
                !loanRequestForm.jumlah_pinjaman ||
                loanRequestForm.jumlah_pinjaman <= 0
            ) {
                console.log("❌ Invalid loan amount");
                showError("Jumlah pinjaman harus lebih dari 0");
                return;
            }

            if (
                !loanRequestForm.jumlah_angsuran ||
                loanRequestForm.jumlah_angsuran <= 0
            ) {
                console.log("❌ Invalid installment amount - recalculating...");
                // Try to recalculate the installment
                calculateInstallment();
                if (
                    !loanRequestForm.jumlah_angsuran ||
                    loanRequestForm.jumlah_angsuran <= 0
                ) {
                    showError(
                        "Jumlah angsuran tidak valid. Pastikan jumlah pinjaman dan bunga sudah dipilih",
                    );
                    return;
                }
            }

            // Validate the bunga percentage
            if (!bungaToUse.persen || bungaToUse.persen <= 0) {
                console.log("❌ Invalid bunga percentage:", bungaToUse.persen);
                showError(
                    "Ujrah yang dipilih tidak memiliki persentase yang valid",
                );
                return;
            }

            console.log("✅ All validations passed!");
            console.log("  - Loan amount:", loanRequestForm.jumlah_pinjaman);
            console.log(
                "  - Installment amount:",
                loanRequestForm.jumlah_angsuran,
            );
            console.log("  - Bunga percentage:", bungaToUse.persen);
            console.log("  - Duration:", loanRequestForm.lama_bulan);

            // Transform to API format according to the API documentation
            const apiPayload = {
                jumlah_pinjaman: Number(loanRequestForm.jumlah_pinjaman),
                bunga_option_id: Number(loanRequestForm.bunga_option_id),
                lama_bulan: Number(loanRequestForm.lama_bulan),
                jumlah_angsuran: Number(loanRequestForm.jumlah_angsuran),
                user_id: Number(currentUser?.id || 0), // Add user_id from current user
                no_rekening_pencairan:
                    loanRequestForm.no_rekening_pencairan || "",
                bank_name: loanRequestForm.bank_name || "",
            };

            // Final validation of the payload
            console.log("🔍 FINAL PAYLOAD VALIDATION:");
            console.log(
                "  - jumlah_pinjaman:",
                apiPayload.jumlah_pinjaman,
                typeof apiPayload.jumlah_pinjaman,
            );
            console.log(
                "  - bunga_option_id:",
                apiPayload.bunga_option_id,
                typeof apiPayload.bunga_option_id,
            );
            console.log(
                "  - lama_bulan:",
                apiPayload.lama_bulan,
                typeof apiPayload.lama_bulan,
            );
            console.log(
                "  - jumlah_angsuran:",
                apiPayload.jumlah_angsuran,
                typeof apiPayload.jumlah_angsuran,
            );
            console.log(
                "  - user_id:",
                apiPayload.user_id,
                typeof apiPayload.user_id,
            );
            console.log(
                "  - no_rekening_pencairan:",
                apiPayload.no_rekening_pencairan,
            );
            console.log("  - bank_name:", apiPayload.bank_name);

            if (
                !apiPayload.jumlah_pinjaman ||
                apiPayload.jumlah_pinjaman <= 0
            ) {
                console.log("❌ jumlah_pinjaman is invalid");
                showError("Jumlah pinjaman tidak valid");
                return;
            }

            if (
                !apiPayload.bunga_option_id ||
                apiPayload.bunga_option_id <= 0
            ) {
                console.log("❌ bunga_option_id is invalid");
                showError("ID bunga tidak valid");
                return;
            }

            if (
                !apiPayload.jumlah_angsuran ||
                apiPayload.jumlah_angsuran <= 0
            ) {
                console.log("❌ jumlah_angsuran is invalid");
                showError("Jumlah angsuran tidak valid");
                return;
            }

            if (!apiPayload.user_id || apiPayload.user_id <= 0) {
                console.log("❌ user_id is invalid");
                showError("User ID tidak valid");
                return;
            }

            console.log(
                "✅ VALIDATION PASSED - Sending payload:",
                JSON.stringify(apiPayload, null, 2),
            );
            const response = await axios.post("/pinjaman", apiPayload);
            console.log("✅ Loan creation response:", response.data);

            // Update local loan data
            await invalidateAll();

            closeModals();
            showSuccessNotification("Pengajuan pinjaman berhasil dikirim!");
        } catch (error: any) {
            console.error("❌ Error requesting loan:", error);
            showError(
                `Gagal mengajukan pinjaman: ${error.response?.data?.error || error.response?.data?.message || error.message}`,
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

            // Validate required fields
            if (!installmentForm.pokok || installmentForm.pokok <= 0) {
                showError("Jumlah pokok harus lebih dari 0");
                return;
            }

            if (installmentForm.bunga < 0) {
                showError("Jumlah ujrah tidak boleh negatif");
                return;
            }

            if (!installmentForm.image_bukti_transfer) {
                showError("Bukti transfer harus diupload");
                return;
            }

            // Determine bank details: use manual input if provided, otherwise use dropdown selection
            let finalNoRekening = installmentForm.no_rekening;
            let finalBankName = installmentForm.bank_name;

            if (
                (!finalNoRekening || !finalBankName) &&
                installmentForm.bank_account_id
            ) {
                // Use bank account from dropdown
                const selectedBankAccount = activeBankAccounts.find(
                    (acc) =>
                        (acc.id || acc.ID) == installmentForm.bank_account_id,
                );
                if (selectedBankAccount) {
                    finalNoRekening =
                        finalNoRekening || selectedBankAccount.account_number;
                    finalBankName =
                        finalBankName || selectedBankAccount.bank_name;
                }
            }

            if (!finalNoRekening || !finalBankName) {
                showError(
                    "Silakan pilih rekening bank tujuan atau isi nomor rekening dan nama bank secara manual",
                );
                return;
            }

            // Create API payload according to new specification
            const apiPayload = {
                pinjaman_id: installmentForm.pinjaman_id,
                pokok: Number(installmentForm.pokok),
                bunga: Number(installmentForm.bunga),
                denda: Number(installmentForm.denda || 0),
                image_bukti_transfer: installmentForm.image_bukti_transfer,
                no_rekening: finalNoRekening,
                bank_name: finalBankName,
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
    async function approveLoan(loanId: number, alasan: string = "") {
        try {
            console.log("🔍 Approving loan:", loanId);
            console.log("👤 Current user info:", {
                id: currentUser?.id,
                email: currentUser?.email,
                role: currentUser?.role?.name,
            });

            // Find the loan to check user ownership
            const loan = loans.find((l) => l.id === loanId);
            if (loan) {
                console.log("📋 Loan details:", {
                    id: loan.id,
                    user_id: loan.user_id,
                    status: loan.status,
                    user: loan.user,
                });
                console.log(
                    "🔐 Permission check: Current user ID:",
                    currentUser?.id,
                    "Loan user ID:",
                    loan.user_id,
                );
            }

            const payload = {
                alasan:
                    alasan ||
                    "Pengajuan pinjaman telah diverifikasi dan disetujui sesuai ketentuan",
            };

            console.log("🔄 Approve payload:", payload);
            console.log("🌐 API endpoint:", `/pinjaman/${loanId}/approve`);

            const response = await axios.put(
                `/pinjaman/${loanId}/approve`,
                payload,
            );

            console.log("✅ Approve response:", response.data);

            // Update local loan data
            loans = loans.map((loan) =>
                loan.id === loanId ? { ...loan, status: "disetujui" } : loan,
            );

            closeModals();
            showSuccessNotification("Pinjaman berhasil disetujui!");
        } catch (error: any) {
            console.error("❌ Error approving loan:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);
            console.error("❌ Error headers:", error.response?.headers);

            if (error.response?.status === 403) {
                console.error("🚫 403 Forbidden - Permission details:");
                console.error("   - User role:", currentUser?.role?.name);
                console.error("   - User ID:", currentUser?.id);
                console.error("   - Loan ID:", loanId);
                console.error("   - API response:", error.response.data);
                showError(
                    `Akses ditolak: ${error.response?.data?.message || "Anda tidak memiliki izin untuk menyetujui pinjaman ini"}`,
                );
            } else {
                showError(
                    `Gagal menyetujui pinjaman: ${error.response?.data?.message || error.message}`,
                );
            }
        }
    }

    async function rejectLoan(loanId: number, alasan: string = "") {
        try {
            console.log("🔍 Rejecting loan:", loanId);
            console.log("👤 Current user info:", {
                id: currentUser?.id,
                email: currentUser?.email,
                role: currentUser?.role?.name,
            });

            // Find the loan to check user ownership
            const loan = loans.find((l) => l.id === loanId);
            if (loan) {
                console.log("📋 Loan details:", {
                    id: loan.id,
                    user_id: loan.user_id,
                    status: loan.status,
                    user: loan.user,
                });
                console.log(
                    "🔐 Permission check: Current user ID:",
                    currentUser?.id,
                    "Loan user ID:",
                    loan.user_id,
                );
            }

            const payload = {
                alasan:
                    alasan ||
                    "Dokumen tidak lengkap atau tidak memenuhi syarat",
            };

            console.log("🔄 Reject payload:", payload);
            console.log("🌐 API endpoint:", `/pinjaman/${loanId}/reject`);

            const response = await axios.put(
                `/pinjaman/${loanId}/reject`,
                payload,
            );

            console.log("✅ Reject response:", response.data);

            // Update local loan data
            loans = loans.map((loan) =>
                loan.id === loanId ? { ...loan, status: "ditolak" } : loan,
            );

            closeModals();
            showSuccessNotification("Pinjaman berhasil ditolak!");
        } catch (error: any) {
            console.error("❌ Error rejecting loan:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);
            console.error("❌ Error headers:", error.response?.headers);

            if (error.response?.status === 403) {
                console.error("🚫 403 Forbidden - Permission details:");
                console.error("   - User role:", currentUser?.role?.name);
                console.error("   - User ID:", currentUser?.id);
                console.error("   - Loan ID:", loanId);
                console.error("   - API response:", error.response.data);
                showError(
                    `Akses ditolak: ${error.response?.data?.message || "Anda tidak memiliki izin untuk menolak pinjaman ini"}`,
                );
            } else {
                showError(
                    `Gagal menolak pinjaman: ${error.response?.data?.message || error.message}`,
                );
            }
        }
    }

    // Legacy function for backward compatibility (if still needed for other statuses)
    async function updateLoanStatus(
        loanId: number,
        status: "disetujui" | "macet",
    ) {
        if (status === "disetujui") {
            // Use the new approve function instead
            await approveLoan(loanId);
            return;
        }

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

<div class="p-4 sm:p-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800">
                {isMember ? "Pinjaman Saya" : "Manajemen Pinjaman"}
            </h1>
            {#if selectedUserId && isAdmin}
                <a
                    href="/dashboard/pinjaman"
                    class="text-sm text-teal-600 hover:text-teal-800 underline inline-flex items-center gap-1"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    Kembali ke Semua Pinjaman
                </a>
            {/if}
        </div>

        <div class="flex items-center gap-3">
            {#if selectedUserId && isAdmin}
                <span class="badge badge-info">
                    User ID: #{selectedUserId}
                </span>
            {/if}
            {#if isMember}
                <button
                    on:click={openLoanRequestModal}
                    class="btn btn-primary btn-lg w-full sm:w-auto"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Ajukan Pinjaman
                </button>
            {/if}
        </div>
    </div>

    <!-- Success Message -->
    {#if showSuccessMessage}
        <div class="alert alert-success mb-4 animate-slide-up">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            {successMessage}
        </div>
    {/if}

    <!-- Member Dashboard -->
    {#if isMember || selectedUserId}
        <!-- Active Loans Section -->
        <div class="mb-8 animate-slide-up">
            <h2 class="text-lg sm:text-xl font-semibold text-slate-700 mb-4">Pinjaman Aktif</h2>

            <div class="grid gap-4">
                {#each loans.filter((loan) => loan.status === "disetujui") as loan, i}
                    <div class="card card-interactive p-5 sm:p-6 stagger-item">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-3 mb-3">
                                    <span class="font-tabular bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-sm">
                                        {loan.kode_pinjaman}
                                    </span>
                                    <span class="badge {loan.status === 'proses' ? 'badge-warning' : loan.status === 'disetujui' ? 'badge-success' : loan.status === 'macet' ? 'badge-danger' : loan.status === 'lunas' ? 'badge-neutral' : loan.status === 'ditolak' ? 'badge-danger' : 'badge-neutral'}">
                                        {getStatusText(loan.status)}
                                    </span>
                                </div>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <p class="text-slate-500">Jumlah</p>
                                        <p class="font-semibold font-tabular text-slate-800">
                                            {formatCurrency(loan.jumlah_pinjaman)}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Tenor</p>
                                        <p class="font-semibold text-slate-800">{loan.lama_bulan} bulan</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Ujrah</p>
                                        <p class="font-semibold font-tabular text-slate-800">{getEffectiveInterestRate(loan)}%</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Angsuran/bulan</p>
                                        <p class="font-semibold font-tabular text-slate-800">
                                            {formatCurrency(loan.jumlah_angsuran)}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Sisa angsuran</p>
                                        <p class="font-semibold font-tabular text-slate-800">{loan.sisa_angsuran} kali</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Diajukan</p>
                                        <p class="font-semibold text-slate-800 text-xs">{formatDate(loan.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-2 sm:flex-col sm:items-end">
                                {#if loan.status === "disetujui" && isMember}
                                    <button
                                        on:click={() => openInstallmentModal(loan)}
                                        class="btn btn-success btn-sm"
                                    >
                                        Bayar Angsuran
                                    </button>
                                {/if}
                                <button
                                    on:click={() => openLoanDetailModal(loan)}
                                    class="btn btn-secondary btn-sm"
                                >
                                    Detail
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}

                {#if loans.filter((loan) => loan.status === "disetujui" && loan.sisa_angsuran > 0).length === 0}
                    <div class="card p-8">
                        <div class="empty-state">
                            <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                            {#if isMember}
                                <p class="text-slate-500">Belum ada pinjaman aktif.</p>
                                <button
                                    on:click={openLoanRequestModal}
                                    class="text-teal-600 hover:text-teal-800 font-medium mt-1 underline"
                                >Ajukan pinjaman pertama</button>
                            {:else}
                                <p class="text-slate-500">Tidak ada pinjaman aktif untuk user ini.</p>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- All Loans History -->
        <div class="mb-8 animate-slide-up">
            <h2 class="text-lg sm:text-xl font-semibold text-slate-700 mb-4">
                Riwayat Pinjaman
            </h2>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Kode</th>
                            <th>Jumlah</th>
                            <th>Tenor</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each loans as loan}
                            <tr>
                                <td>
                                    <span class="font-tabular bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                        {loan.kode_pinjaman}
                                    </span>
                                </td>
                                <td>
                                    <span class="font-tabular">{formatCurrency(loan.jumlah_pinjaman)}</span>
                                </td>
                                <td>{loan.lama_bulan} bulan</td>
                                <td>
                                    <span class="badge {loan.status === 'proses' ? 'badge-warning' : loan.status === 'disetujui' ? 'badge-success' : loan.status === 'macet' ? 'badge-danger' : loan.status === 'lunas' ? 'badge-neutral' : loan.status === 'ditolak' ? 'badge-danger' : 'badge-neutral'}">
                                        {getStatusText(loan.status)}
                                    </span>
                                </td>
                                <td class="text-sm">{formatDate(loan.created_at)}</td>
                                <td>
                                    <button
                                        on:click={() => openLoanDetailModal(loan)}
                                        class="btn btn-ghost btn-sm text-teal-600"
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
    {/if}

    <!-- Admin Dashboard -->
    {#if isAdmin && !selectedUserId}
        <!-- Pending Installment Approvals -->
        {#if pendingInstallments.length > 0}
            <div class="mb-8 animate-slide-up">
                <h2 class="text-lg sm:text-xl font-semibold text-slate-700 mb-4">
                    Angsuran Menunggu Verifikasi
                </h2>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Pinjaman</th>
                                <th>Angsuran Ke</th>
                                <th>Total</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each pendingInstallments as installment}
                                <tr>
                                    <td>
                                        {installment.user?.name ||
                                            installment.user?.email ||
                                            `User #${installment.user_id}`}
                                    </td>
                                    <td>
                                        <span class="font-tabular bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                            {installment.pinjaman?.kode_pinjaman || `#${installment.pinjaman_id}`}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="font-tabular">{installment.angsuran_ke}</span>
                                    </td>
                                    <td>
                                        <span class="font-tabular">{formatCurrency(installment.total_bayar)}</span>
                                    </td>
                                    <td class="text-sm">
                                        {formatDate(installment.tanggal_bayar)}
                                    </td>
                                    <td>
                                        <div class="flex gap-2">
                                            <button
                                                on:click={() => openInstallmentDetailModal(installment)}
                                                class="btn btn-secondary btn-sm"
                                            >
                                                Detail
                                            </button>
                                            <button
                                                on:click={() => verifyInstallment(installment.id, "verified")}
                                                class="btn btn-success btn-sm"
                                            >
                                                Verifikasi
                                            </button>
                                            <button
                                                on:click={() => verifyInstallment(installment.id, "kurang")}
                                                class="btn btn-warning btn-sm"
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
        {/if}

        <!-- All Loans Management -->
        <div class="mb-8 animate-slide-up">
            <h2 class="text-xl font-semibold text-slate-700 mb-4">Semua Pinjaman</h2>

            <!-- Desktop Table -->
            <div class="hidden md:block table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Kode</th>
                            <th>User</th>
                            <th>Jumlah</th>
                            <th>Status</th>
                            <th>Sisa</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each loans as loan}
                            <tr>
                                <td>
                                    <span class="font-tabular bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                        {loan.kode_pinjaman}
                                    </span>
                                </td>
                                <td>
                                    {loan.user?.name || loan.user?.email || `User #${loan.user_id}`}
                                </td>
                                <td>
                                    <span class="font-tabular">{formatCurrency(loan.jumlah_pinjaman)}</span>
                                </td>
                                <td>
                                    <span class="badge {loan.status === 'proses' ? 'badge-warning' : loan.status === 'disetujui' ? 'badge-success' : loan.status === 'macet' ? 'badge-danger' : loan.status === 'lunas' ? 'badge-neutral' : loan.status === 'ditolak' ? 'badge-danger' : 'badge-neutral'}">
                                        {getStatusText(loan.status)}
                                    </span>
                                </td>
                                <td>
                                    <span class="font-tabular">{loan.sisa_angsuran}</span>
                                </td>
                                <td class="text-sm">
                                    {formatDate(loan.created_at)}
                                </td>
                                <td>
                                    <div class="flex gap-2">
                                        {#if loan.status === "proses"}
                                            <button
                                                on:click={() => approveLoan(loan.id)}
                                                class="btn btn-success btn-sm"
                                            >
                                                Setujui
                                            </button>
                                            <button
                                                on:click={() => rejectLoan(loan.id)}
                                                class="btn btn-danger btn-sm"
                                            >
                                                Tolak
                                            </button>
                                        {/if}
                                        <button
                                            on:click={() => openLoanDetailModal(loan)}
                                            class="btn btn-secondary btn-sm"
                                        >
                                            Detail
                                        </button>
                                        <button
                                            on:click={() => viewUserLoans(loan)}
                                            disabled={isNavigating}
                                            class="btn btn-ghost btn-sm text-teal-600"
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
            <div class="md:hidden space-y-3">
                {#each loans as loan, i}
                    <div class="card p-4 stagger-item">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <span class="font-tabular bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-sm">
                                    {loan.kode_pinjaman}
                                </span>
                                <p class="text-xs text-slate-500 mt-1.5">
                                    {loan.user?.name || loan.user?.email || `User #${loan.user_id}`}
                                </p>
                                <p class="text-lg font-semibold font-tabular text-teal-700 mt-1">
                                    {formatCurrency(loan.jumlah_pinjaman)}
                                </p>
                            </div>
                            <span class="badge {loan.status === 'proses' ? 'badge-warning' : loan.status === 'disetujui' ? 'badge-success' : loan.status === 'macet' ? 'badge-danger' : loan.status === 'lunas' ? 'badge-neutral' : loan.status === 'ditolak' ? 'badge-danger' : 'badge-neutral'}">
                                {getStatusText(loan.status)}
                            </span>
                        </div>

                        <div class="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-4">
                            <div>
                                <span class="text-slate-500 text-xs">Sisa angsuran</span>
                                <p class="font-tabular font-semibold">{loan.sisa_angsuran} kali</p>
                            </div>
                            <div>
                                <span class="text-slate-500 text-xs">Tanggal</span>
                                <p class="text-xs">{formatDate(loan.created_at)}</p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            {#if loan.status === "proses"}
                                <div class="flex gap-2">
                                    <button
                                        on:click={() => approveLoan(loan.id)}
                                        class="btn btn-success btn-sm flex-1"
                                    >
                                        Setujui
                                    </button>
                                    <button
                                        on:click={() => rejectLoan(loan.id)}
                                        class="btn btn-danger btn-sm flex-1"
                                    >
                                        Tolak
                                    </button>
                                </div>
                            {/if}
                            <div class="flex gap-2">
                                <button
                                    on:click={() => openLoanDetailModal(loan)}
                                    class="btn btn-secondary btn-sm flex-1"
                                >
                                    Detail
                                </button>
                                <button
                                    on:click={() => viewUserLoans(loan)}
                                    disabled={isNavigating}
                                    class="btn btn-ghost btn-sm flex-1 text-teal-600"
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
    {/if}
</div>

<!-- Loan Request Drawer -->
{#if showLoanRequestModal}
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
                <h3 class="text-lg font-semibold text-slate-800">
                    Ajukan Pinjaman
                </h3>
                <button on:click={closeModals} class="btn btn-ghost btn-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <form on:submit|preventDefault={requestLoan}>
                <div class="drawer-body space-y-5">
                    <div>
                        <label class="input-label">Jumlah Pinjaman</label>
                        <input
                            type="number"
                            bind:value={loanRequestForm.jumlah_pinjaman}
                            min="1"
                            required
                            class="input font-tabular"
                            placeholder="Masukkan jumlah pinjaman"
                        />
                    </div>

                    <div>
                        <label class="input-label">Tenor (bulan)</label>
                        <select
                            bind:value={loanRequestForm.lama_bulan}
                            required
                            class="input"
                        >
                            <option value={6}>6 bulan</option>
                            <option value={12}>12 bulan</option>
                            <option value={18}>18 bulan</option>
                            <option value={24}>24 bulan</option>
                            <option value={36}>36 bulan</option>
                        </select>
                    </div>

                    <div>
                        <label class="input-label">Pilih Ujrah</label>
                        <select
                            bind:value={loanRequestForm.bunga_option_id}
                            on:change={onBungaOptionChange}
                            required
                            class="input"
                        >
                            <option value={0}>Pilih opsi ujrah...</option>
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
                            <p class="text-xs text-slate-500 mt-1">
                                {selectedBungaOption.deskripsi || ""}
                            </p>
                        {/if}
                    </div>

                    <div>
                        <label class="input-label">No. Rekening Pencairan</label>
                        <input
                            type="text"
                            bind:value={loanRequestForm.no_rekening_pencairan}
                            required
                            class="input font-tabular"
                            placeholder="Nomor rekening untuk pencairan dana"
                        />
                    </div>

                    <div>
                        <label class="input-label">Nama Bank</label>
                        <input
                            type="text"
                            bind:value={loanRequestForm.bank_name}
                            required
                            class="input"
                            placeholder="Nama bank (contoh: Bank BCA)"
                        />
                    </div>

                    {#if loanRequestForm.jumlah_pinjaman > 0 && loanRequestForm.lama_bulan > 0 && selectedBungaOption}
                        <div class="card p-4 bg-teal-50 border-teal-200">
                            <p class="text-sm text-teal-800 mb-1">
                                <span class="font-medium">Ujrah yang dipilih:</span>
                                {selectedBungaOption.nama} (<span class="font-tabular">{selectedBungaOption.persen}%</span>)
                            </p>
                            <p class="text-sm text-teal-800">
                                <span class="font-medium">Estimasi angsuran per bulan:</span>
                                <span class="font-tabular font-bold text-base">{formatCurrency(loanRequestForm.jumlah_angsuran)}</span>
                            </p>
                        </div>
                    {/if}
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
                        Ajukan Pinjaman
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Pay Installment Drawer -->
{#if showInstallmentModal && selectedLoan}
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
                <div>
                    <h3 class="text-lg font-semibold text-slate-800">
                        Bayar Angsuran
                    </h3>
                    <p class="text-sm text-slate-500 font-tabular">{selectedLoan.kode_pinjaman}</p>
                </div>
                <button on:click={closeModals} class="btn btn-ghost btn-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <form on:submit|preventDefault={submitInstallment}>
                <div class="drawer-body space-y-5">
                    <!-- Loan summary info -->
                    <div class="card p-4 bg-slate-50">
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p class="text-slate-500">Angsuran ke</p>
                                <p class="font-semibold font-tabular text-slate-800">{installmentForm.angsuran_ke}</p>
                            </div>
                            <div>
                                <p class="text-slate-500">Sisa angsuran</p>
                                <p class="font-semibold font-tabular text-slate-800">{selectedLoan.sisa_angsuran} kali</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="input-label">Pokok</label>
                        <input
                            type="number"
                            bind:value={installmentForm.pokok}
                            min="1"
                            required
                            class="input font-tabular"
                        />
                    </div>

                    <div>
                        <label class="input-label">Ujrah</label>
                        <input
                            type="number"
                            bind:value={installmentForm.bunga}
                            min="0"
                            required
                            class="input font-tabular"
                        />
                    </div>

                    <div>
                        <label class="input-label">Denda (opsional)</label>
                        <input
                            type="number"
                            bind:value={installmentForm.denda}
                            min="0"
                            class="input font-tabular"
                        />
                    </div>

                    <!-- Bukti Transfer -->
                    <div>
                        <label class="input-label">Bukti Transfer *</label>

                        <!-- Toggle buttons -->
                        <div class="flex items-center gap-2 mb-3">
                            <button
                                type="button"
                                on:click={() => { useFileUploadInstallment = true; }}
                                class="btn btn-sm {useFileUploadInstallment ? 'btn-primary' : 'btn-secondary'}"
                            >
                                Upload File
                            </button>
                            <button
                                type="button"
                                on:click={() => { useFileUploadInstallment = false; selectedFileInstallment = null; }}
                                class="btn btn-sm {!useFileUploadInstallment ? 'btn-primary' : 'btn-secondary'}"
                            >
                                Input URL Manual
                            </button>
                        </div>

                        {#if useFileUploadInstallment}
                            <!-- File Upload Mode -->
                            <div class="space-y-2">
                                <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-teal-300 rounded-lg cursor-pointer bg-teal-50/50 hover:bg-teal-50 transition-colors">
                                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg class="w-8 h-8 mb-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                        <p class="text-sm text-teal-600 font-medium">Klik untuk upload gambar</p>
                                        <p class="text-xs text-slate-500">Max 5MB (JPG, PNG, GIF)</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        on:change={handleFileSelectInstallment}
                                        disabled={isUploadingInstallment}
                                        class="hidden"
                                    />
                                </label>

                                {#if isUploadingInstallment}
                                    <div class="flex items-center gap-2 text-sm text-teal-600">
                                        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Mengupload gambar...</span>
                                    </div>
                                {/if}
                                {#if installmentForm.image_bukti_transfer && !isUploadingInstallment}
                                    <div class="alert alert-success">
                                        <svg class="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                        </svg>
                                        <span>Gambar berhasil diupload</span>
                                    </div>
                                    <a
                                        href={installmentForm.image_bukti_transfer}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-xs text-teal-600 hover:underline break-all"
                                    >
                                        {installmentForm.image_bukti_transfer}
                                    </a>
                                {/if}
                            </div>
                        {:else}
                            <!-- Manual URL Input Mode -->
                            <div class="space-y-2">
                                <input
                                    type="text"
                                    bind:value={installmentForm.image_bukti_transfer}
                                    placeholder="/uploads/angsuran/bukti_transfer_123.jpg"
                                    required
                                    class="input"
                                />
                                <p class="text-xs text-slate-500">
                                    Path atau URL ke file bukti transfer
                                </p>
                            </div>
                        {/if}
                    </div>

                    <!-- Bank Account Selection -->
                    <div>
                        <label class="input-label">Rekening Bank Tujuan (opsional)</label>
                        <select
                            bind:value={installmentForm.bank_account_id}
                            class="input"
                        >
                            <option value="">Pilih rekening bank</option>
                            {#each activeBankAccounts as bankAccount}
                                <option value={bankAccount.id || bankAccount.ID}>
                                    {bankAccount.bank_name} - {bankAccount.account_number}
                                    ({bankAccount.account_holder_name || bankAccount.account_name})
                                </option>
                            {/each}
                        </select>
                        <p class="text-xs text-slate-500 mt-1">
                            Atau isi rekening bank manual di bawah ini
                        </p>
                    </div>

                    <div>
                        <label class="input-label">Nomor Rekening (opsional)</label>
                        <input
                            type="text"
                            bind:value={installmentForm.no_rekening}
                            placeholder="1234567890"
                            class="input font-tabular"
                        />
                        <p class="text-xs text-slate-500 mt-1">
                            Kosongkan jika menggunakan rekening dari dropdown di atas
                        </p>
                    </div>

                    <div>
                        <label class="input-label">Nama Bank (opsional)</label>
                        <input
                            type="text"
                            bind:value={installmentForm.bank_name}
                            placeholder="Bank Mandiri"
                            class="input"
                        />
                        <p class="text-xs text-slate-500 mt-1">
                            Kosongkan jika menggunakan rekening dari dropdown di atas
                        </p>
                    </div>

                    <!-- Total Summary -->
                    <div class="card p-4 bg-teal-50 border-teal-200">
                        <p class="text-sm text-teal-700">
                            <span class="font-medium">Total pembayaran:</span>
                        </p>
                        <p class="font-tabular font-bold text-xl text-teal-800">
                            {formatCurrency(
                                installmentForm.pokok +
                                    installmentForm.bunga +
                                    (installmentForm.denda || 0),
                            )}
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
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="modal-panel !max-w-3xl max-h-[90vh] overflow-y-auto"
            on:click|stopPropagation
        >
            <div class="modal-header">
                <div class="flex items-center justify-between w-full">
                    <div>
                        <h3 class="text-lg font-semibold text-slate-800">
                            Detail Pinjaman
                        </h3>
                        <span class="font-tabular bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-sm">{selectedLoan.kode_pinjaman}</span>
                    </div>
                    <button on:click={closeModals} class="btn btn-ghost btn-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <div class="modal-body">
                <!-- Loan Information Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div class="card p-3 bg-slate-50">
                        <p class="text-xs text-slate-500 mb-1">Jumlah Pinjaman</p>
                        <p class="font-semibold font-tabular text-lg text-slate-800">
                            {formatCurrency(selectedLoan.jumlah_pinjaman)}
                        </p>
                    </div>
                    <div class="card p-3 bg-slate-50">
                        <p class="text-xs text-slate-500 mb-1">Status</p>
                        <span class="badge {selectedLoan.status === 'proses' ? 'badge-warning' : selectedLoan.status === 'disetujui' ? 'badge-success' : selectedLoan.status === 'macet' ? 'badge-danger' : selectedLoan.status === 'lunas' ? 'badge-neutral' : selectedLoan.status === 'ditolak' ? 'badge-danger' : 'badge-neutral'}">
                            {getStatusText(selectedLoan.status)}
                        </span>
                    </div>
                    <div class="card p-3 bg-slate-50">
                        <p class="text-xs text-slate-500 mb-1">Tenor</p>
                        <p class="font-semibold text-slate-800">{selectedLoan.lama_bulan} bulan</p>
                    </div>
                    <div class="card p-3 bg-slate-50">
                        <p class="text-xs text-slate-500 mb-1">Angsuran per bulan</p>
                        <p class="font-semibold font-tabular text-slate-800">
                            {formatCurrency(selectedLoan.jumlah_angsuran)}
                        </p>
                    </div>
                    <div class="card p-3 bg-slate-50">
                        <p class="text-xs text-slate-500 mb-1">Ujrah</p>
                        <p class="font-semibold font-tabular text-slate-800">{getEffectiveInterestRate(selectedLoan)}%</p>
                    </div>
                    <div class="card p-3 bg-slate-50">
                        <p class="text-xs text-slate-500 mb-1">Sisa Angsuran</p>
                        <p class="font-semibold font-tabular text-slate-800">{selectedLoan.sisa_angsuran} kali</p>
                    </div>
                </div>

                <!-- Installment History -->
                <div>
                    <h4 class="font-semibold text-slate-800 mb-3">
                        Riwayat Angsuran
                    </h4>

                    {#if loanInstallments.length > 0}
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ke-</th>
                                        <th>Tanggal</th>
                                        <th>Pokok</th>
                                        <th>Ujrah</th>
                                        <th>Denda</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each loanInstallments as installment}
                                        <tr>
                                            <td>
                                                <span class="font-tabular">{installment.angsuran_ke}</span>
                                            </td>
                                            <td class="text-xs">
                                                {formatDate(installment.tanggal_bayar)}
                                            </td>
                                            <td>
                                                <span class="font-tabular">{formatCurrency(installment.pokok)}</span>
                                            </td>
                                            <td>
                                                <span class="font-tabular">{formatCurrency(installment.bunga)}</span>
                                            </td>
                                            <td>
                                                <span class="font-tabular">{formatCurrency(installment.denda)}</span>
                                            </td>
                                            <td>
                                                <span class="font-tabular font-semibold">{formatCurrency(installment.total_bayar)}</span>
                                            </td>
                                            <td>
                                                <span class="badge {installment.status === 'proses' ? 'badge-warning' : installment.status === 'verified' ? 'badge-success' : installment.status === 'kurang' ? 'badge-warning' : installment.status === 'lebih' ? 'badge-info' : 'badge-neutral'}">
                                                    {getStatusText(installment.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="flex gap-1">
                                                    <button
                                                        on:click={() => openInstallmentDetailModal(installment)}
                                                        class="btn btn-ghost btn-sm text-teal-600"
                                                    >
                                                        Detail
                                                    </button>
                                                    {#if installment.status === "proses" && isAdmin}
                                                        <button
                                                            on:click={() => verifyInstallment(installment.id, "verified")}
                                                            class="btn btn-ghost btn-sm text-green-600"
                                                        >
                                                            Verifikasi
                                                        </button>
                                                        <button
                                                            on:click={() => verifyInstallment(installment.id, "kurang")}
                                                            class="btn btn-ghost btn-sm text-amber-600"
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
                        <div class="card p-8">
                            <div class="empty-state">
                                <svg class="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                <p class="text-slate-500">Belum ada angsuran untuk pinjaman ini.</p>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="modal-footer">
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

<!-- Installment Detail Modal -->
{#if showInstallmentDetailModal && selectedInstallment}
    <div
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="modal-panel !max-w-2xl max-h-[90vh] overflow-y-auto"
            on:click|stopPropagation
        >
            <div class="modal-header">
                <div class="flex items-center justify-between w-full">
                    <h3 class="text-lg font-semibold text-slate-800">
                        Detail Angsuran <span class="font-tabular">#{selectedInstallment.angsuran_ke}</span>
                    </h3>
                    <button on:click={closeModals} class="btn btn-ghost btn-sm">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <div class="modal-body space-y-4">
                {#if selectedInstallment.user}
                    <div class="card p-3 bg-slate-50">
                        <p class="text-xs text-slate-500 mb-0.5">Member</p>
                        <p class="font-semibold text-slate-800">{selectedInstallment.user.name}</p>
                        <p class="text-sm text-slate-500">{selectedInstallment.user.email}</p>
                    </div>
                {/if}

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-slate-500 mb-0.5">Pinjaman</p>
                        <span class="font-tabular bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-sm">
                            {selectedInstallment.pinjaman?.kode_pinjaman || `#${selectedInstallment.pinjaman_id}`}
                        </span>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 mb-0.5">Status</p>
                        <span class="badge {selectedInstallment.status === 'proses' ? 'badge-warning' : selectedInstallment.status === 'verified' ? 'badge-success' : selectedInstallment.status === 'kurang' ? 'badge-warning' : selectedInstallment.status === 'lebih' ? 'badge-info' : 'badge-neutral'}">
                            {getStatusText(selectedInstallment.status)}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-slate-500 mb-0.5">Pokok</p>
                        <p class="font-semibold font-tabular text-slate-800">{formatCurrency(selectedInstallment.pokok)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 mb-0.5">Ujrah</p>
                        <p class="font-semibold font-tabular text-slate-800">{formatCurrency(selectedInstallment.bunga)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 mb-0.5">Denda</p>
                        <p class="font-semibold font-tabular text-slate-800">{formatCurrency(selectedInstallment.denda)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 mb-0.5">Total Pembayaran</p>
                        <p class="font-semibold font-tabular text-xl text-teal-700">{formatCurrency(selectedInstallment.total_bayar)}</p>
                    </div>
                </div>

                {#if selectedInstallment.bank_name || selectedInstallment.no_rekening}
                    <div class="card p-3 bg-slate-50">
                        <p class="text-xs text-slate-500 mb-0.5">Bank Pembayaran</p>
                        <p class="font-semibold text-slate-800">{selectedInstallment.bank_name || "-"}</p>
                        {#if selectedInstallment.no_rekening}
                            <p class="text-sm font-tabular text-slate-500">
                                No. Rek: {selectedInstallment.no_rekening}
                            </p>
                        {/if}
                    </div>
                {/if}

                <div>
                    <p class="text-xs text-slate-500 mb-0.5">Tanggal Bayar</p>
                    <p class="text-slate-800">{formatDate(selectedInstallment.tanggal_bayar)}</p>
                </div>

                {#if selectedInstallment.image_bukti_transfer}
                    <div>
                        <p class="text-xs text-slate-500 mb-2">Bukti Transfer</p>
                        <div class="border border-slate-200 rounded-lg overflow-hidden">
                            <img
                                src={selectedInstallment.image_bukti_transfer}
                                alt="Bukti Transfer"
                                class="w-full h-auto"
                                on:error={(e) => {
                                    e.currentTarget.style.display = "none";
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        const errorDiv = document.createElement("div");
                                        errorDiv.className = "p-4 bg-slate-50 text-center text-slate-500 text-sm";
                                        errorDiv.textContent = "Gambar tidak dapat dimuat";
                                        parent.appendChild(errorDiv);
                                    }
                                }}
                            />
                        </div>
                        <a
                            href={selectedInstallment.image_bukti_transfer}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-xs text-teal-600 hover:underline mt-1.5 inline-block break-all"
                        >
                            Lihat gambar penuh
                        </a>
                    </div>
                {/if}
            </div>

            <div class="modal-footer">
                {#if selectedInstallment.status === "proses" && isAdmin}
                    <button
                        on:click={() => verifyInstallment(selectedInstallment?.id || 0, "verified")}
                        class="btn btn-success"
                    >
                        Verifikasi
                    </button>
                    <button
                        on:click={() => verifyInstallment(selectedInstallment?.id || 0, "kurang")}
                        class="btn btn-warning"
                    >
                        Kurang
                    </button>
                {:else}
                    <button
                        on:click={closeModals}
                        class="btn btn-secondary"
                    >
                        Tutup
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}
