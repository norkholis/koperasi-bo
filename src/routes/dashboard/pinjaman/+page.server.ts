import type { PageServerLoad } from "./$types";
import type { User, Pinjaman, Loan, Angsuran, Installment } from "$lib/types";
import axios from "$lib/api";

// Transform Pinjaman from PascalCase to snake_case
function transformLoan(pinjaman: any): Loan {
    // Check for required fields
    if (!pinjaman || typeof pinjaman !== 'object') {
        console.error("❌ Invalid pinjaman object:", pinjaman);
        throw new Error("Invalid pinjaman object");
    }

    const transformed = {
        id: pinjaman.ID || pinjaman.id || 0,
        created_at: pinjaman.CreatedAt || pinjaman.created_at || '',
        kode_pinjaman: pinjaman.KodePinjaman || pinjaman.kode_pinjaman || '',
        user_id: pinjaman.UserID || pinjaman.user_id || 0,
        tanggal_pinjam: pinjaman.TanggalPinjam || pinjaman.tanggal_pinjam || '',
        jumlah_pinjaman: pinjaman.JumlahPinjaman || pinjaman.jumlah_pinjaman || 0,
        bunga_persen: pinjaman.BungaPersen || pinjaman.bunga_persen || 0,
        lama_bulan: pinjaman.LamaBulan || pinjaman.lama_bulan || 0,
        jumlah_angsuran: pinjaman.JumlahAngsuran || pinjaman.jumlah_angsuran || 0,
        sisa_angsuran: pinjaman.SisaAngsuran || pinjaman.sisa_angsuran || 0,
        status: pinjaman.Status || pinjaman.status || 'proses',
        user: pinjaman.User || pinjaman.user
    };

    console.log("🔄 Transforming loan:", pinjaman);
    console.log("✅ Transformed result:", transformed);

    // Debug interest rate specifically
    if (transformed.bunga_persen === 0 && (pinjaman.BungaPersen || pinjaman.bunga_persen)) {
        console.warn("⚠️ Interest rate mismatch detected:");
        console.warn("  - Input BungaPersen:", pinjaman.BungaPersen);
        console.warn("  - Input bunga_persen:", pinjaman.bunga_persen);
        console.warn("  - Output bunga_persen:", transformed.bunga_persen);
    }

    return transformed;
}

// Transform Angsuran from API response to frontend format
function transformInstallment(angsuran: any): Installment {
    return {
        id: angsuran.ID,
        pinjaman_id: angsuran.pinjaman_id || angsuran.PinjamanID, // Support both formats
        angsuran_ke: angsuran.angsuran_ke || angsuran.AngsuranKe,
        tanggal_bayar: angsuran.tanggal_bayar || angsuran.TanggalBayar,
        pokok: angsuran.pokok || angsuran.Pokok,
        bunga: angsuran.bunga || angsuran.Bunga,
        denda: angsuran.denda || angsuran.Denda,
        total_bayar: angsuran.total_bayar || angsuran.TotalBayar,
        user_id: angsuran.user_id || angsuran.UserID,
        status: angsuran.status || angsuran.Status,
        pinjaman: angsuran.pinjaman ? transformLoan(angsuran.pinjaman) : undefined,
        user: angsuran.user || angsuran.User
    };
}

export const load: PageServerLoad = async ({ parent, url, cookies }) => {
    console.log("🚀 Loading pinjaman page data");

    try {
        const { user: currentUser } = await parent();
        console.log("👤 Current user:", currentUser?.email, currentUser?.role?.name);

        if (!currentUser) {
            console.error("❌ No current user found");
            return {
                currentUser: null,
                loans: [],
                pendingInstallments: [],
                error: "User not found"
            };
        }

        // Get selected user ID from URL params (for admin viewing specific user)
        const selectedUserId = url.searchParams.get("user_id");
        console.log("🎯 Selected User ID:", selectedUserId);

        const isAdmin = currentUser.role?.name === "admin" || currentUser.role?.name === "super_admin";
        const isMember = currentUser.role?.name === "member";

        console.log("🔐 User permissions:", { isAdmin, isMember });

        let loans: Loan[] = [];
        let pendingInstallments: Installment[] = [];

        // Load loans based on user role and selected user
        try {
            if (selectedUserId) {
                // Admin viewing specific user's loans
                console.log("📊 Fetching loans for specific user:", selectedUserId);
                const response = await axios.get(`/pinjaman?user_id=${selectedUserId}`);
                console.log("📦 Raw loans response for user:", response.data);

                const rawLoans = response.data.data || [];
                console.log("🔍 Raw loans array for user:", rawLoans);
                loans = rawLoans.map((loan: any) => {
                    console.log("🔄 Transforming loan:", loan);
                    const transformed = transformLoan(loan);
                    console.log("✅ Transformed result:", transformed);
                    return transformed;
                });
            } else if (isMember) {
                // Members see only their own loans
                console.log("📊 Fetching loans for member user:", currentUser.id);
                const response = await axios.get(`/pinjaman?user_id=${currentUser.id}`);
                console.log("📦 Raw loans response for member:", response.data);

                const rawLoans = response.data.data || [];
                console.log("🔍 Raw loans array for member:", rawLoans);
                loans = rawLoans.map((loan: any) => {
                    console.log("🔄 Transforming loan:", loan);
                    const transformed = transformLoan(loan);
                    console.log("✅ Transformed result:", transformed);
                    return transformed;
                });
            } else if (isAdmin) {
                // Admin loads all loans from all users
                console.log("📊 Fetching ALL loans for admin");
                console.log("🔗 API URL:", "/pinjaman");

                try {
                    const response = await axios.get("/pinjaman");
                    console.log("📦 Raw ALL loans response status:", response.status);
                    console.log("📦 Raw ALL loans response data:", response.data);
                    console.log("📦 Response data type:", typeof response.data);
                    console.log("📦 Response data structure:", Object.keys(response.data || {}));

                    const rawLoans = response.data.data || [];
                    console.log("🔍 Raw ALL loans array:", rawLoans.length, "loans");
                    console.log("🔍 Raw loans array type:", Array.isArray(rawLoans));

                    if (rawLoans.length > 0) {
                        console.log("🔍 Sample loan from API:", rawLoans[0]);
                        console.log("🔍 Sample loan keys:", Object.keys(rawLoans[0] || {}));
                    } else {
                        console.log("⚠️ API returned empty loans array");
                        console.log("🔍 Full API response:", JSON.stringify(response.data, null, 2));
                    }

                    loans = rawLoans.map((loan: any) => {
                        console.log("🔄 Transforming loan:", loan);
                        const transformed = transformLoan(loan);
                        console.log("✅ Transformed result:", transformed);
                        return transformed;
                    });

                    console.log("✅ Total loans loaded for admin:", loans.length);
                } catch (apiError) {
                    console.error("❌ API Error fetching all loans:", apiError);
                    if (apiError && typeof apiError === 'object' && 'response' in apiError) {
                        const axiosError = apiError as any;
                        console.error("❌ API error status:", axiosError.response?.status);
                        console.error("❌ API error data:", axiosError.response?.data);
                        console.error("❌ API error headers:", axiosError.response?.headers);
                    }
                    if (apiError && typeof apiError === 'object' && 'message' in apiError) {
                        console.error("❌ API error message:", (apiError as Error).message);
                    }
                }
            }

            console.log("✅ Transformed loans:", loans.length);
            if (loans.length > 0) {
                console.log("🔍 First loan:", loans[0]);
            } else {
                console.log("⚠️ No loans found after transformation");
            }
        } catch (error) {
            console.error("❌ Error fetching loans:", error);
            if (error instanceof Error) {
                console.error("❌ Error message:", error.message);
            }
            // Check if it's an axios error
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                console.error("❌ Axios error response:", axiosError.response?.data);
                console.error("❌ Axios error status:", axiosError.response?.status);
            }
        }

        // Load pending installments for admin
        if (isAdmin && !selectedUserId) {
            try {
                console.log("📊 Fetching pending installments");
                const response = await axios.get("/angsuran/pending");
                console.log("📦 Raw pending installments response:", response.data);

                const rawInstallments = response.data.data || [];
                pendingInstallments = rawInstallments.map(transformInstallment);

                console.log("✅ Transformed pending installments:", pendingInstallments.length);
            } catch (error) {
                console.error("❌ Error fetching pending installments:", error);
            }
        }

        // Fetch active bunga options for loan forms
        let activeBungaOptions: any[] = [];
        try {
            console.log("📊 Fetching active bunga options");
            const bungaResponse = await axios.get("/bunga-options", {
                params: { active: true }
            });
            console.log("📦 Raw bunga options response:", bungaResponse.data);

            const rawBungaOptions = bungaResponse.data.data || [];

            // Transform bunga options to match frontend interface (same as bunga page)
            activeBungaOptions = rawBungaOptions.map((item: any) => ({
                id: item.ID,
                nama: item.nama,
                persen: item.persen,
                deskripsi: item.deskripsi,
                is_active: item.is_active,
                created_by: item.created_by,
                created_by_user: item.created_by_user ? {
                    id: item.created_by_user.ID,
                    name: item.created_by_user.Name || item.created_by_user.Email,
                    email: item.created_by_user.Email
                } : undefined,
                created_at: item.CreatedAt,
                updated_at: item.UpdatedAt
            }));

            console.log("✅ Active bunga options loaded and transformed:", activeBungaOptions.length);
            console.log("🔍 First bunga option after transformation:", activeBungaOptions[0]);
        } catch (error) {
            console.error("❌ Error fetching bunga options:", error);
            activeBungaOptions = [];
        }

        console.log("✅ Pinjaman page data loaded successfully");
        console.log("📊 Final data:", {
            loansCount: loans.length,
            pendingInstallmentsCount: pendingInstallments.length,
            activeBungaOptionsCount: activeBungaOptions.length,
            selectedUserId
        });

        return {
            currentUser,
            loans,
            pendingInstallments,
            activeBungaOptions,
            selectedUserId: selectedUserId ? parseInt(selectedUserId) : null
        };

    } catch (error) {
        console.error("❌ Error in pinjaman page load:", error);
        return {
            currentUser: null,
            loans: [],
            pendingInstallments: [],
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
};