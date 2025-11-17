import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    if (!token) {
        throw redirect(302, '/login');
    }

    try {
        // Decode token to get user role
        const base64 = token.split('.')[1] || '';
        const payloadJson = Buffer.from(base64, 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        const userRole = payload.role;

        // Check if user has admin or super_admin role for financial reporting
        if (!['admin', 'super_admin'].includes(userRole)) {
            throw redirect(302, '/dashboard');
        }

        return {
            currentUser: {
                role: userRole,
                user_id: payload.user_id,
                nama: payload.nama || 'Admin'
            }
        };
    } catch (error) {
        console.error('Token validation error:', error);
        throw redirect(302, '/login');
    }
};