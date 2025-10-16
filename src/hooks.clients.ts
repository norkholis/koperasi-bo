import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export async function handle({ event, resolve }: { event: any; resolve: any }) {
    if (browser) {
        const token = localStorage.getItem('token');
        const url = new URL(event.url);
        if (!token && !url.pathname.startsWith('/login')) {
            goto('/login');
            return;
        }
    }
    return resolve(event);
}