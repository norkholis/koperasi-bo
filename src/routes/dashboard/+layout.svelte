<script lang="ts">
    import { page } from "$app/stores";
    export let data;
    $: user = data.user;

    // Check user permissions
    $: canManageUsers =
        user?.role?.name === "admin" || user?.role?.name === "super_admin";
    $: isSuper = user?.role?.name === "super_admin";
    $: isAdmin = user?.role?.name === "admin";
    $: isMember = user?.role?.name === "member";
</script>

<nav class="bg-indigo-700 text-white p-4 flex justify-between">
    <div class="flex items-center space-x-4">
        <span class="font-bold">Koperasi Backoffice</span>
        <div class="flex space-x-2">
            <a href="/dashboard" class="hover:bg-indigo-600 px-3 py-1 rounded"
                >Dashboard</a
            >

            {#if canManageUsers}
                <a
                    href="/dashboard/users"
                    class="hover:bg-indigo-600 px-3 py-1 rounded">Kelola User</a
                >
            {/if}

            {#if isSuper}
                <a
                    href="/dashboard/super"
                    class="hover:bg-indigo-600 px-3 py-1 rounded">Super Admin</a
                >
            {/if}

            <a
                href="/dashboard/profile"
                class="hover:bg-indigo-600 px-3 py-1 rounded">Profile</a
            >
        </div>
    </div>

    <div class="flex items-center space-x-4">
        <span class="text-sm">
            {user.name || user.email}
            <span class="text-indigo-200">({user.role?.name})</span>
        </span>
        <a
            href="/logout"
            class="bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded text-sm"
        >
            Logout
        </a>
    </div>
</nav>

<main class="p-6">
    <slot />
</main>
