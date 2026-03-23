<script lang="ts">
    import { page } from "$app/stores";
    import NotificationToast from "$lib/components/NotificationToast.svelte";
    export let data;
    $: user = data.user;

    // Check user permissions
    $: canManageUsers =
        user?.role?.name === "admin" || user?.role?.name === "super_admin";
    $: isSuper = user?.role?.name === "super_admin";
    $: isAdmin = user?.role?.name === "admin";
    $: isMember = user?.role?.name === "member" || user?.role?.name === "user";

    // Sidebar state
    let sidebarOpen = false;
    let showPinjamanSubmenu = false;
    let showUserDropdown = false;

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    function closeSidebar() {
        sidebarOpen = false;
    }

    function togglePinjamanSubmenu() {
        showPinjamanSubmenu = !showPinjamanSubmenu;
    }

    function toggleUserDropdown() {
        showUserDropdown = !showUserDropdown;
    }

    // Close dropdowns on outside click
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest(".user-dropdown")) {
            showUserDropdown = false;
        }
    }

    // Check if a path is active
    function isActive(path: string): boolean {
        return $page.url.pathname === path || $page.url.pathname.startsWith(path + "/");
    }

    // Get breadcrumb segments
    $: breadcrumbs = getBreadcrumbs($page.url.pathname);

    function getBreadcrumbs(pathname: string) {
        const segments = pathname.split("/").filter(Boolean);
        const crumbs: { label: string; href: string }[] = [];
        let currentPath = "";

        const labels: Record<string, string> = {
            dashboard: "Dashboard",
            users: "Kelola User",
            admin: "Admin",
            member: "Member",
            super: "Super Admin",
            simpanan: "Wadiah",
            pinjaman: "Pinjaman",
            bunga: "Kelola Ujrah",
            "bank-accounts": "Rekening Bank",
            shu: "Laporan SHU",
            reporting: "Laporan",
            financial: "Keuangan",
            transactions: "Transaksi",
            profile: "Profile",
            add: "Tambah",
            edit: "Edit",
        };

        for (const segment of segments) {
            currentPath += "/" + segment;
            const label = labels[segment] || segment;
            crumbs.push({ label, href: currentPath });
        }
        return crumbs;
    }

    // User initials for avatar
    $: userInitials = getUserInitials(user);

    function getUserInitials(u: any): string {
        if (!u) return "?";
        if (u.name) {
            return u.name
                .split(" ")
                .map((w: string) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
        }
        return u.email?.[0]?.toUpperCase() || "?";
    }

    // Role badge class
    $: roleBadgeClass = getRoleBadgeClass(user?.role?.name);

    function getRoleBadgeClass(role: string | undefined): string {
        switch (role) {
            case "super_admin": return "badge-danger";
            case "admin": return "badge-info";
            default: return "badge-success";
        }
    }

    // Nav items config
    type NavItem = {
        label: string;
        href?: string;
        icon: string;
        show: boolean;
        children?: { label: string; href: string; show: boolean }[];
    };

    $: navItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: "dashboard",
            show: true,
        },
        {
            label: "Kelola User",
            href: "/dashboard/users",
            icon: "users",
            show: canManageUsers,
        },
        {
            label: "Rekening Bank",
            href: "/dashboard/bank-accounts",
            icon: "bank",
            show: canManageUsers,
        },
        {
            label: "Wadiah",
            href: "/dashboard/simpanan",
            icon: "wallet",
            show: true,
        },
        {
            label: "Pinjaman",
            icon: "loan",
            show: true,
            children: [
                { label: "Kelola Pinjaman", href: "/dashboard/pinjaman", show: true },
                { label: "Kelola Ujrah", href: "/dashboard/pinjaman/bunga", show: canManageUsers },
            ],
        },
        {
            label: "Laporan SHU",
            href: "/dashboard/shu",
            icon: "chart",
            show: true,
        },
        {
            label: "Laporan",
            href: "/dashboard/reporting",
            icon: "report",
            show: canManageUsers,
        },
        {
            label: "Super Admin",
            href: "/dashboard/super",
            icon: "shield",
            show: isSuper,
        },
    ] as NavItem[];
</script>

<svelte:window on:click={handleClickOutside} />

<div class="min-h-screen bg-pattern">
    <!-- Mobile Sidebar Overlay -->
    {#if sidebarOpen}
        <div
            class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            on:click={closeSidebar}
            on:keydown={(e) => e.key === "Escape" && closeSidebar()}
            role="button"
            tabindex="-1"
            aria-label="Close sidebar"
        ></div>
    {/if}

    <!-- Sidebar -->
    <aside
        class="fixed top-0 left-0 z-50 h-full flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-30"
        class:translate-x-0={sidebarOpen}
        class:-translate-x-full={!sidebarOpen}
        style="width: var(--sidebar-width); background: var(--color-sidebar-bg);"
    >
        <!-- Logo -->
        <div class="flex items-center gap-3 px-5 h-16 border-b border-slate-800 flex-shrink-0">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <span class="text-white font-bold text-sm tracking-wide">Koperasi</span>
                <span class="text-slate-500 text-xs block leading-none">Backoffice</span>
            </div>
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {#each navItems as item}
                {#if item.show}
                    {#if item.children}
                        <!-- Submenu item -->
                        <div>
                            <button
                                on:click={togglePinjamanSubmenu}
                                class="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                                    {isActive('/dashboard/pinjaman') ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}"
                            >
                                <div class="flex items-center gap-3">
                                    <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                    </svg>
                                    <span>{item.label}</span>
                                </div>
                                <svg
                                    class="w-4 h-4 transition-transform duration-200 {showPinjamanSubmenu ? 'rotate-180' : ''}"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {#if showPinjamanSubmenu}
                                <div class="mt-1 ml-5 pl-3 border-l border-slate-700 space-y-0.5">
                                    {#each item.children as child}
                                        {#if child.show}
                                            <a
                                                href={child.href}
                                                class="block px-3 py-2 rounded-lg text-sm transition-colors duration-150
                                                    {isActive(child.href) ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}"
                                                on:click={closeSidebar}
                                            >
                                                {child.label}
                                            </a>
                                        {/if}
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <!-- Regular item -->
                        <a
                            href={item.href}
                            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                                {isActive(item.href || '') ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}"
                            on:click={closeSidebar}
                        >
                            {#if item.icon === "dashboard"}
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                                </svg>
                            {:else if item.icon === "users"}
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            {:else if item.icon === "bank"}
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                </svg>
                            {:else if item.icon === "wallet"}
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.75a2.25 2.25 0 002.25-2.25V3m-2.25 0h-8.25A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h9a2.25 2.25 0 002.25-2.25v-1.5m-2.25 0H15a3 3 0 110-6h3.75m0 6V15m0-6v-1.5" />
                                </svg>
                            {:else if item.icon === "chart"}
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                            {:else if item.icon === "report"}
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            {:else if item.icon === "shield"}
                                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            {/if}
                            <span>{item.label}</span>
                        </a>
                    {/if}
                {/if}
            {/each}
        </nav>

        <!-- Sidebar Footer - User Info -->
        <div class="flex-shrink-0 border-t border-slate-800 p-4">
            <a href="/dashboard/profile" class="flex items-center gap-3 group" on:click={closeSidebar}>
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <span class="text-white text-xs font-bold">{userInitials}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{user?.name || user?.email}</p>
                    <span class="badge {roleBadgeClass}" style="font-size: 0.625rem; padding: 0.125rem 0.5rem;">{user?.role?.name}</span>
                </div>
            </a>
        </div>
    </aside>

    <!-- Top Bar -->
    <header
        class="fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6"
        style="left: 0; transition: left var(--transition-normal);"
    >
        <!-- Left: Hamburger + Breadcrumbs -->
        <div class="flex items-center gap-3">
            <!-- Mobile hamburger -->
            <button
                on:click={toggleSidebar}
                class="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                aria-label="Toggle sidebar"
            >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    {#if sidebarOpen}
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    {/if}
                </svg>
            </button>

            <!-- Breadcrumbs (hidden on mobile) -->
            <nav class="hidden sm:flex items-center text-sm" aria-label="Breadcrumb">
                {#each breadcrumbs as crumb, i}
                    {#if i > 0}
                        <svg class="w-4 h-4 text-slate-300 mx-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    {/if}
                    {#if i === breadcrumbs.length - 1}
                        <span class="font-medium text-slate-900">{crumb.label}</span>
                    {:else}
                        <a href={crumb.href} class="text-slate-500 hover:text-teal-600 transition-colors">{crumb.label}</a>
                    {/if}
                {/each}
            </nav>

            <!-- Mobile page title -->
            <span class="sm:hidden font-semibold text-slate-900 text-sm">
                {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard'}
            </span>
        </div>

        <!-- Right: User dropdown -->
        <div class="flex items-center gap-3">
            <div class="relative user-dropdown">
                <button
                    on:click={toggleUserDropdown}
                    class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                        <span class="text-white text-xs font-bold">{userInitials}</span>
                    </div>
                    <span class="hidden md:block text-sm font-medium text-slate-700">{user?.name || user?.email}</span>
                    <svg class="hidden md:block w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                {#if showUserDropdown}
                    <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-scale-in">
                        <div class="px-4 py-2.5 border-b border-slate-100">
                            <p class="text-sm font-semibold text-slate-900">{user?.name || user?.email}</p>
                            <p class="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <a
                            href="/dashboard/profile"
                            class="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            on:click={() => showUserDropdown = false}
                        >
                            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            Profile
                        </a>
                        <div class="border-t border-slate-100 mt-1 pt-1">
                            <a
                                href="/logout"
                                class="flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                                Logout
                            </a>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="pt-16 lg:ml-[260px] min-h-screen">
        <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
            <slot />
        </div>
    </main>
</div>

<NotificationToast />
