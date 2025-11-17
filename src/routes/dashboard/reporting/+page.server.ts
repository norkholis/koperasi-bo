import type { PageServerLoad } from './$types';
import axios from '$lib/api';
import type { FinancialSummaryResponse } from '$lib/types';

export const load: PageServerLoad = async ({ parent }) => {
    try {
        const { user: currentUser } = await parent();

        if (!currentUser) {
            return {
                currentUser: null,
                financialSummary: null,
                error: "User not found"
            };
        }

        // Check if user has permission to view reports
        const isAdmin = currentUser.role?.name === "admin" || currentUser.role?.name === "super_admin";

        if (!isAdmin) {
            return {
                currentUser,
                financialSummary: null,
                error: "Access denied. Admin role required."
            };
        }

        // Get financial summary for the dashboard
        let financialSummary = null;
        try {
            console.log("📊 Fetching financial summary");
            const response = await axios.get('/transactions/summary');
            financialSummary = response.data.data;
            console.log("✅ Financial summary loaded:", financialSummary);
        } catch (error) {
            console.error("❌ Error fetching financial summary:", error);
            // Provide fallback data when API fails (e.g., database table doesn't exist)
            financialSummary = {
                total_simpanan: 0,
                total_pinjaman: 0,
                total_angsuran: 0,
                total_shu: 0,
                total_transactions: 0,
                period_start: new Date().toISOString(),
                period_end: new Date().toISOString()
            };
            console.log("📊 Using fallback financial summary data");
        }

        return {
            currentUser,
            financialSummary
        };

    } catch (error) {
        console.error("❌ Error in reporting page load:", error);
        return {
            currentUser: null,
            financialSummary: null,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
};