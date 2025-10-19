<script lang="ts">
    import type { User } from "$lib/types";
    import { goto } from "$app/navigation";

    export let data;
    let users: User[] = data.users;
    const currentUser = data.user;

    // Debug logging
    console.log("🔍 Users page data:", data);
    console.log("Users array:", users);
    console.log("Users length:", users?.length);
    console.log("Current user:", currentUser);

    // Check if current user can manage users (admin or super_admin)
    const canManageUsers =
        currentUser?.role?.name === "admin" ||
        currentUser?.role?.name === "super_admin";
    const isSuper = currentUser?.role?.name === "super_admin";

    let showDeleteModal = false;
    let userToDelete: User | null = null;
    let deleteLoading = false;

    function openDeleteModal(user: User) {
        userToDelete = user;
        showDeleteModal = true;
    }

    function closeDeleteModal() {
        showDeleteModal = false;
        userToDelete = null;
        deleteLoading = false;
    }

    // deletion will be performed via server action form submission
    function submitDelete(form: HTMLFormElement) {
        deleteLoading = true;
        // when form submits, SvelteKit will reload the page; we don't need further handling here
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString("id-ID");
    }

    function getRoleBadgeClass(roleName: string) {
        switch (roleName) {
            case "super_admin":
                return "bg-red-100 text-red-800";
            case "admin":
                return "bg-blue-100 text-blue-800";
            case "member":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }
</script>

<!-- Debug info -->
{#if process.env.NODE_ENV === "development"}
    <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p class="text-sm">
            <strong>Debug:</strong> Users count: {users?.length || 0} | Current user:
            {currentUser?.email} ({currentUser?.role?.name}) | Can manage: {canManageUsers}
        </p>
    </div>
{/if}

<div class="mb-6">
    <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Manajemen User</h2>
        {#if canManageUsers}
            <a
                href="/dashboard/users/add"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
                + Tambah User
            </a>
        {/if}
    </div>
    <p class="text-gray-600 mt-2">Kelola data pengguna sistem</p>
</div>

<div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >User</th
                    >
                    <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >Role</th
                    >
                    <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >Status</th
                    >
                    <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >Terdaftar</th
                    >
                    <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >Aksi</th
                    >
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each users as user}
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <div
                                        class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center"
                                    >
                                        <span
                                            class="text-sm font-medium text-gray-700"
                                        >
                                            {user.email.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <div
                                        class="text-sm font-medium text-gray-900"
                                    >
                                        {user.full_name || "Tidak ada nama"}
                                    </div>
                                    <div class="text-sm text-gray-500">
                                        {user.email}
                                    </div>
                                    {#if user.phone}
                                        <div class="text-xs text-gray-400">
                                            {user.phone}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span
                                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getRoleBadgeClass(
                                    user.role.name,
                                )}"
                            >
                                {user.role.name === "super_admin"
                                    ? "Super Admin"
                                    : user.role.name === "admin"
                                      ? "Admin"
                                      : "Member"}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span
                                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {user.is_active !==
                                false
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'}"
                            >
                                {user.is_active !== false
                                    ? "Aktif"
                                    : "Nonaktif"}
                            </span>
                        </td>
                        <td
                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                            {formatDate(user.created_at)}
                        </td>
                        <td
                            class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
                        >
                            <!-- View/Edit button for current user (profile) or admin management -->
                            {#if user.id === currentUser?.id}
                                <a
                                    href="/dashboard/profile"
                                    class="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                    Profile
                                </a>
                            {:else if canManageUsers}
                                <a
                                    href="/dashboard/users/{user.id}"
                                    class="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                    Edit
                                </a>

                                <!-- Delete button - only for super_admin and not self -->
                                {#if isSuper && user.id !== currentUser?.id}
                                    <button
                                        on:click={() => openDeleteModal(user)}
                                        class="text-red-600 hover:text-red-900 transition-colors"
                                    >
                                        Hapus
                                    </button>
                                {/if}
                            {:else}
                                <span class="text-gray-400">-</span>
                            {/if}
                        </td>
                    </tr>
                {/each}

                {#if users.length === 0}
                    <tr>
                        <td
                            colspan="5"
                            class="px-6 py-4 text-center text-gray-500"
                        >
                            Tidak ada data user
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && userToDelete}
    <div
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
        <div
            class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        >
            <div class="mt-3">
                <div
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100"
                >
                    <svg
                        class="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mt-4 text-center">
                    Hapus User
                </h3>
                <div class="mt-2 px-2 py-3">
                    <p class="text-sm text-gray-500 text-center">
                        Apakah Anda yakin ingin menghapus user <strong
                            >{userToDelete.email}</strong
                        >? Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
                <form
                    method="POST"
                    action="?/delete"
                    class="items-center px-4 py-3 flex gap-3"
                    on:submit|preventDefault={(e) => {
                        submitDelete(e.target as HTMLFormElement);
                        e.currentTarget.submit();
                    }}
                >
                    <input type="hidden" name="id" value={userToDelete?.id} />
                    <button
                        type="button"
                        on:click={closeDeleteModal}
                        disabled={deleteLoading}
                        class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={deleteLoading}
                        class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 disabled:opacity-50"
                    >
                        {deleteLoading ? "Menghapus..." : "Hapus"}
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}
