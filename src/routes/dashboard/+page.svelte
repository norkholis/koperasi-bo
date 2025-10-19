<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    export let data; // dari +layout.server.ts

    onMount(() => {
        const user = data.user;
        const role = user?.role?.name;

        console.log("🔍 Dashboard redirect check:");
        console.log("User:", user);
        console.log("Role:", role);

        // Ensure we have a valid user and role before redirecting
        if (!user || !role) {
            console.error("❌ No user or role found, redirecting to login");
            goto("/login");
            return;
        }

        // Role-based redirect with explicit logging
        if (role === "super_admin") {
            console.log("➡️ Redirecting super_admin to /dashboard/super");
            goto("/dashboard/super");
        } else if (role === "admin") {
            console.log("➡️ Redirecting admin to /dashboard/admin");
            goto("/dashboard/admin");
        } else if (role === "member") {
            console.log("➡️ Redirecting member to /dashboard/member");
            goto("/dashboard/member");
        } else {
            console.error(
                "❌ Unknown role:",
                role,
                "redirecting to member dashboard",
            );
            goto("/dashboard/member");
        }
    });
</script>

<div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
        <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Mengarahkan ke dashboard...</p>
    </div>
</div>
