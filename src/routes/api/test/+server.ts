import { json } from '@sveltejs/kit';

export async function GET() {
    console.log('🧪 SvelteKit API route /api/test was called');

    return json({
        message: 'SvelteKit API route is working!',
        timestamp: new Date().toISOString(),
        server: 'SvelteKit'
    });
}