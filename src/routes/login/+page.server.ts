import type { Actions } from './$types';
import axios from '$lib/api';
import { extractErrorMessage } from '$lib/errorUtils';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        try {
            const res = await axios.post('/login', { email, password });

            console.log('Login response:', JSON.stringify(res.data, null, 2));

            // Check if response contains error in data field
            if (res.data?.data) {
                const dataField = res.data.data;

                // If data is a string, try to parse it
                if (typeof dataField === 'string') {
                    try {
                        const parsedData = JSON.parse(dataField);
                        // Check for error format: [{"error":1}, "error message"]
                        if (Array.isArray(parsedData) && parsedData.length >= 2) {
                            if (parsedData[0]?.error === 1) {
                                // Extract clean error message
                                let errorMsg = parsedData[1] || 'Login failed';
                                // Remove technical SSL/TLS error details for user-friendly message
                                if (errorMsg.includes('EPROTO') || errorMsg.includes('SSL')) {
                                    errorMsg = 'Authentication service temporarily unavailable. Please try again.';
                                }
                                return { error: errorMsg };
                            }
                        }
                    } catch (parseError) {
                        console.error('Failed to parse data field:', parseError);
                    }
                }
            }

            // Check if token exists in response
            const token = res.data?.token || res.data?.data?.token;
            if (!token) {
                console.error('No token in response:', res.data);
                return { error: 'Login failed: Invalid response from server' };
            }

            cookies.set('token', token, {
                path: '/',
                httpOnly: false,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24
            });
            return { token };
        } catch (e: any) {
            console.error('Login error:', e);
            const errorMessage = extractErrorMessage(e);
            return { error: errorMessage };
        }
    }
};