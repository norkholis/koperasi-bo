<script lang="ts">
    import { page } from "$app/stores";
    import DebugPanel from "$lib/components/DebugPanel.svelte";
    export let data;
    $: user = data.user;

    // Check user permissions
    $: canManageUsers =
        user?.role?.name === "admin" || user?.role?.name === "super_admin";
    $: isSuper = user?.role?.name === "super_admin";
    $: isAdmin = user?.role?.name === "admin";
    $: isMember = user?.role?.name === "member";

    // Mobile menu state
    let showMobileMenu = false;
    let showPinjamanDropdown = false;

    function toggleMobileMenu() {
        showMobileMenu = !showMobileMenu;
    }

    function closeMobileMenu() {
        showMobileMenu = false;
    }

    function togglePinjamanDropdown() {
        showPinjamanDropdown = !showPinjamanDropdown;
    }

    function closePinjamanDropdown() {
        showPinjamanDropdown = false;
    }

    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest(".relative")) {
            showPinjamanDropdown = false;
        }
    }
</script>

<nav class="bg-indigo-700 text-white">
    <!-- Desktop Navigation -->
    <div class="hidden md:flex p-4 justify-between">
        <div class="flex items-center space-x-4">
            <span class="font-bold">Koperasi Backoffice</span>
            <div class="flex space-x-2">
                <a
                    href="/dashboard"
                    class="hover:bg-indigo-600 px-3 py-1 rounded">Dashboard</a
                >

                {#if canManageUsers}
                    <a
                        href="/dashboard/users"
                        class="hover:bg-indigo-600 px-3 py-1 rounded"
                        >Kelola User</a
                    >
                {/if}

                <a
                    href="/dashboard/simpanan"
                    class="hover:bg-indigo-600 px-3 py-1 rounded">Simpanan</a
                >

                <a
                    href="/dashboard/pinjaman"
                    class="hover:bg-indigo-600 px-3 py-1 rounded">Pinjaman</a
                >

                {#if canManageUsers}
                    <a
                        href="/dashboard/pinjaman/bunga"
                        class="hover:bg-indigo-600 px-3 py-1 rounded"
                        >Kelola Bunga</a
                    >
                {/if}

                <a
                    href="/dashboard/shu"
                    class="hover:bg-indigo-600 px-3 py-1 rounded">Laporan SHU</a
                >

                {#if isSuper}
                    <a
                        href="/dashboard/super"
                        class="hover:bg-indigo-600 px-3 py-1 rounded"
                        >Super Admin</a
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
    </div>

    <!-- Mobile Navigation -->
    <div class="md:hidden">
        <!-- Mobile Header -->
        <div class="flex justify-between items-center p-4">
            <span class="font-bold">Koperasi Backoffice</span>
            <button
                on:click={toggleMobileMenu}
                class="p-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded={showMobileMenu}
                aria-label="Toggle navigation menu"
            >
                <!-- Hamburger Icon -->
                <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    {#if showMobileMenu}
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    {:else}
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    {/if}
                </svg>
            </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        {#if showMobileMenu}
            <div class="border-t border-indigo-600 bg-indigo-800">
                <div class="px-2 pt-2 pb-3 space-y-1">
                    <a
                        href="/dashboard"
                        class="block px-3 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                        on:click={closeMobileMenu}
                    >
                        Dashboard
                    </a>

                    {#if canManageUsers}
                        <a
                            href="/dashboard/users"
                            class="block px-3 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                            on:click={closeMobileMenu}
                        >
                            Kelola User
                        </a>
                    {/if}

                    <a
                        href="/dashboard/simpanan"
                        class="block px-3 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                        on:click={closeMobileMenu}
                    >
                        Simpanan
                    </a>

                    <a
                        href="/dashboard/pinjaman"
                        class="block px-3 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                        on:click={closeMobileMenu}
                    >
                        Kelola Pinjaman
                    </a>

                    {#if canManageUsers}
                        <a
                            href="/dashboard/pinjaman/bunga"
                            class="block px-3 py-2 rounded-md hover:bg-indigo-600 transition-colors ml-4"
                            on:click={closeMobileMenu}
                        >
                            Kelola Bunga
                        </a>
                    {/if}

                    <a
                        href="/dashboard/shu"
                        class="block px-3 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                        on:click={closeMobileMenu}
                    >
                        Laporan SHU
                    </a>

                    {#if isSuper}
                        <a
                            href="/dashboard/super"
                            class="block px-3 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                            on:click={closeMobileMenu}
                        >
                            Super Admin
                        </a>
                    {/if}

                    <a
                        href="/dashboard/profile"
                        class="block px-3 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                        on:click={closeMobileMenu}
                    >
                        Profile
                    </a>
                </div>

                <!-- Mobile User Info & Logout -->
                <div class="border-t border-indigo-600 px-4 py-3">
                    <div class="text-sm text-indigo-200 mb-2">
                        {user.name || user.email} ({user.role?.name})
                    </div>
                    <a
                        href="/logout"
                        class="block w-full text-left px-3 py-2 bg-indigo-900 hover:bg-red-600 rounded-md text-sm transition-colors"
                        on:click={closeMobileMenu}
                    >
                        Logout
                    </a>
                </div>
            </div>
        {/if}
    </div>
</nav>

<main class="p-4 sm:p-6">
    <slot />
</main>

<!-- Debug Panel for API Testing -->
<DebugPanel />
