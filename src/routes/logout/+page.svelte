<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    onMount(() => {
        if (browser) {
            // Clear both localStorage and cookie
            localStorage.removeItem("token");
            document.cookie =
                "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            goto("/login");
        }
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center">
        <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Logging out...</p>
    </div>
</div>
