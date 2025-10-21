<script lang="ts">
    import type { User } from "$lib/types";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import axios from "$lib/api";
    import { onMount } from "svelte";

    export let data;
    // Handle both server load format and API response format
    let users: User[] = (data?.users ?? []) as unknown as User[];
    const currentUser = data.user;

    // Success message handling
    let successMessage = "";
    let showSuccessMessage = false;

    onMount(() => {
        // Check for success message in URL params
        const success = $page.url.searchParams.get("success");
        if (success) {
            successMessage = success;
            showSuccessMessage = true;

            // Remove success param from URL
            const url = new URL($page.url);
            url.searchParams.delete("success");
            window.history.replaceState({}, "", url);

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                showSuccessMessage = false;
            }, 5000);
        }
    });

    const canManageUsers =
        currentUser?.role?.name === "admin" ||
        currentUser?.role?.name === "super_admin";

    // Confirmation dialog state
    let showDeleteModal = false;
    let userToDelete: User | null = null;

    // Edit modal state
    let showEditModal = false;
    let userToEdit: User | null = null;
    let editForm = {
        email: "",
        name: "",
        address: "",
        phone_number: "",
        nik: "",
        role_id: 0,
        password: "",
    };

    function editUser(user: User) {
        // CHOOSE EDIT MODE: Modal or Page
        // For modal edit (current): keep the code below
        userToEdit = user;
        editForm = {
            email: user.email,
            name: user.name || "",
            address: user.address || "",
            phone_number: user.phone_number || "",
            nik: user.nik || "",
            role_id: user.role_id,
            password: "",
        };
        showEditModal = true;

        // For page navigation: uncomment the line below and comment out the modal code above
        // goto(`/dashboard/users/edit/${user.id}`);
    }

    function cancelEdit() {
        showEditModal = false;
        userToEdit = null;
        editForm = {
            email: "",
            name: "",
            address: "",
            phone_number: "",
            nik: "",
            role_id: 0,
            password: "",
        };
    }

    async function saveUser() {
        if (!userToEdit) return;

        try {
            const updateData: any = {
                email: editForm.email,
                name: editForm.name,
                address: editForm.address,
                phone_number: editForm.phone_number,
                nik: editForm.nik,
                role_id: editForm.role_id,
            };

            // Only include password if provided
            if (editForm.password.trim()) {
                updateData.password = editForm.password;
            }

            console.log("Updating user:", userToEdit.id, updateData);
            const response = await axios.put(
                `/users/${userToEdit.id}`,
                updateData,
            );
            console.log("Update response:", response);

            // Update user in local array
            users = users.map((u) =>
                u.id === userToEdit?.id
                    ? { ...u, ...updateData, role: u.role }
                    : u,
            );

            // Close modal
            showEditModal = false;
            userToEdit = null;

            // Show success message
            successMessage = "User berhasil diperbarui!";
            showSuccessMessage = true;
            setTimeout(() => {
                showSuccessMessage = false;
            }, 5000);
        } catch (error: any) {
            console.error("Error updating user:", error);
            console.error("Error response:", error.response);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to update user";
            alert(`Error: ${errorMessage}`);
        }
    }

    function confirmDelete(user: User) {
        userToDelete = user;
        showDeleteModal = true;
    }

    function cancelDelete() {
        showDeleteModal = false;
        userToDelete = null;
    }

    async function deleteUser() {
        if (!userToDelete) return;

        try {
            await axios.delete(`/users/${userToDelete.id}`);

            // Remove user from local array
            users = users.filter((u) => u.id !== userToDelete?.id);

            // Close modal
            showDeleteModal = false;
            userToDelete = null;

            // Show success message
            successMessage = "User berhasil dihapus!";
            showSuccessMessage = true;
            setTimeout(() => {
                showSuccessMessage = false;
            }, 5000);
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Gagal menghapus user. Silakan coba lagi.");
        }
    }
</script>

<div class="p-6">
    <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">User Management</h1>
        {#if canManageUsers}
            <button
                on:click={() => goto("/dashboard/users/add")}
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
                Add User
            </button>
        {/if}
    </div>

    <!-- Success Message -->
    {#if showSuccessMessage}
        <div class="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex items-center">
                <svg
                    class="h-5 w-5 text-green-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                    />
                </svg>
                <p class="text-green-800 font-medium">{successMessage}</p>
                <button
                    on:click={() => (showSuccessMessage = false)}
                    class="ml-auto text-green-400 hover:text-green-600"
                >
                    <svg
                        class="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </div>
    {/if}

    <!-- Users Table -->
    <div class="bg-white shadow rounded">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-2 text-left">ID</th>
                    <th class="px-4 py-2 text-left">Email</th>
                    <th class="px-4 py-2 text-left">Name</th>
                    <th class="px-4 py-2 text-left">Role</th>
                    <th class="px-4 py-2 text-left">Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each users as user}
                    <tr class="border-t hover:bg-gray-50">
                        <td class="px-4 py-2">{user.id}</td>
                        <td class="px-4 py-2">{user.email}</td>
                        <td class="px-4 py-2">{user.name || "Empty"}</td>
                        <td class="px-4 py-2">
                            <span
                                class="px-2 py-1 text-xs rounded-full {user.role
                                    ?.name === 'super_admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : user.role?.name === 'admin'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'}"
                            >
                                {user.role?.name || user.role_id || "Unknown"}
                            </span>
                        </td>
                        <td class="px-4 py-2">
                            <div class="flex gap-2">
                                <button
                                    on:click={() => editUser(user)}
                                    class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    disabled={!canManageUsers}
                                >
                                    Edit
                                </button>
                                <button
                                    on:click={() => confirmDelete(user)}
                                    class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    disabled={!canManageUsers ||
                                        user.id === currentUser.id}
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr class="bg-red-100">
                        <td colspan="5" class="px-4 py-2 text-center">
                            No users found
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && userToDelete}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        tabindex="-1"
        on:click={cancelDelete}
        on:keydown={(e) => e.key === "Escape" && cancelDelete()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            role="document"
            on:click|stopPropagation
        >
            <h3
                id="delete-modal-title"
                class="text-lg font-semibold text-gray-900 mb-4"
            >
                Confirm Delete
            </h3>
            <p class="text-gray-600 mb-6">
                Are you sure you want to delete user <strong
                    >{userToDelete.email}</strong
                >? This action cannot be undone.
            </p>
            <div class="flex justify-end gap-3">
                <button
                    on:click={cancelDelete}
                    class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    on:click={deleteUser}
                    class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Edit User Modal -->
{#if showEditModal && userToEdit}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        tabindex="-1"
        on:click={cancelEdit}
        on:keydown={(e) => e.key === "Escape" && cancelEdit()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            role="document"
            on:click|stopPropagation
        >
            <h3
                id="edit-modal-title"
                class="text-lg font-semibold text-gray-900 mb-4"
            >
                Edit User
            </h3>

            <form on:submit|preventDefault={saveUser} class="space-y-4">
                <!-- Email -->
                <div>
                    <label
                        for="edit-email"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="edit-email"
                        bind:value={editForm.email}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- Name -->
                <div>
                    <label
                        for="edit-name"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        id="edit-name"
                        bind:value={editForm.name}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- Address -->
                <div>
                    <label
                        for="edit-address"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Address
                    </label>
                    <textarea
                        id="edit-address"
                        bind:value={editForm.address}
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                <!-- Phone Number -->
                <div>
                    <label
                        for="edit-phone"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Phone Number
                    </label>
                    <input
                        type="text"
                        id="edit-phone"
                        bind:value={editForm.phone_number}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- NIK -->
                <div>
                    <label
                        for="edit-nik"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        NIK
                    </label>
                    <input
                        type="text"
                        id="edit-nik"
                        bind:value={editForm.nik}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- Role -->
                <div>
                    <label
                        for="edit-role"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Role
                    </label>
                    <select
                        id="edit-role"
                        bind:value={editForm.role_id}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={1}>Super Admin</option>
                        <option value={2}>Admin</option>
                        <option value={3}>Member</option>
                    </select>
                </div>

                <!-- Password -->
                <div>
                    <label
                        for="edit-password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        New Password (leave empty to keep current)
                    </label>
                    <input
                        type="password"
                        id="edit-password"
                        bind:value={editForm.password}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        on:click={cancelEdit}
                        class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
