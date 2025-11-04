<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    // Client-side redirection with token synchronization
    onMount(() => {
        if (browser) {
            // Check both localStorage and cookie
            const tokenFromStorage = localStorage.getItem("token");
            const tokenFromCookie = document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1];

            const token = tokenFromStorage || tokenFromCookie;

            if (token) {
                // Sync tokens if they exist
                if (tokenFromStorage && !tokenFromCookie) {
                    // Set cookie from localStorage
                    document.cookie = `token=${tokenFromStorage}; path=/; max-age=${60 * 60 * 24}`;
                } else if (tokenFromCookie && !tokenFromStorage) {
                    // Set localStorage from cookie
                    localStorage.setItem("token", tokenFromCookie);
                }
                goto("/dashboard");
            } else {
                goto("/login");
            }
        }
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
        <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Redirecting...</p>
    </div>
</div>
