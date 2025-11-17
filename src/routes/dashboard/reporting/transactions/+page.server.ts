import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
    try {
        const { user: currentUser } = await parent();

        if (!currentUser) {
            return {
                currentUser: null,
                error: "User not found"
            };
        }

        // Check if user has permission to view transaction history
        const isAdmin = currentUser.role?.name === "admin" || currentUser.role?.name === "super_admin";

        if (!isAdmin) {
            return {
                currentUser,
                error: "Access denied. Admin role required."
            };
        }

        // Extract query parameters for initial filters
        const filters = {
            user_id: url.searchParams.get('user_id') ? parseInt(url.searchParams.get('user_id')!) : undefined,
            transaction_type: url.searchParams.get('transaction_type') as any,
            status: url.searchParams.get('status') as any,
            start_date: url.searchParams.get('start_date') || undefined,
            end_date: url.searchParams.get('end_date') || undefined,
            min_amount: url.searchParams.get('min_amount') ? parseInt(url.searchParams.get('min_amount')!) : undefined,
            max_amount: url.searchParams.get('max_amount') ? parseInt(url.searchParams.get('max_amount')!) : undefined,
            limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 50,
            offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0
        };

        return {
            currentUser,
            initialFilters: filters
        };

    } catch (error) {
        console.error("❌ Error in transaction history page load:", error);
        return {
            currentUser: null,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
};