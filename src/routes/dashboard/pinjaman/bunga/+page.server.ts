import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }: { cookies: any }) => {
    // Use same cookie name as dashboard layout
    const token = cookies.get('token');

    if (!token) {
        console.log('🚫 No token found, redirecting to login');
        throw redirect(302, '/login');
    }

    try {
        // Use the main layout's authentication pattern
        const response = await fetch('http://localhost:8080/api/me', {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        const userData = await response.json();
        let currentUser = userData.data || userData;

        // Ensure role object exists
        if (currentUser.role_id && !currentUser.role) {
            currentUser.role = {
                id: currentUser.role_id,
                name: currentUser.role_id === 1 ? 'super_admin' : currentUser.role_id === 2 ? 'admin' : 'member'
            };
        }

        // Check if user can manage bunga (admin or super_admin)
        const canManageBunga = currentUser.role?.name === 'admin' || currentUser.role?.name === 'super_admin';

        console.log('🔍 Bunga page access:', {
            user: currentUser.email,
            role: currentUser.role?.name,
            canManageBunga
        });

        if (!canManageBunga) {
            console.log('🚫 User does not have permission to manage bunga');
            throw redirect(302, '/dashboard');
        }

        return {
            bungaOptions: [], // Will be loaded client-side
            currentUser,
            canManageBunga
        };
    } catch (error) {
        console.log('🚫 Authentication error:', error);
        throw redirect(302, '/login');
    }
};