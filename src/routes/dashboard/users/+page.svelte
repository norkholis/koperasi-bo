<script lang="ts">
    import type { User } from "$lib/types";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import axios from "$lib/api";
    import { onMount } from "svelte";
    import { extractErrorMessage } from "$lib/errorUtils";
    import { showSuccess, showError } from "$lib/stores/notifications";

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
    let showEditPassword = false;
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
        showEditPassword = false;
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
        showEditPassword = false;
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
            showSuccess("User berhasil diperbarui!");
        } catch (error: any) {
            console.error("Error updating user:", error);
            console.error("Error response:", error.response);
            const errorMessage = extractErrorMessage(error);
            showError(errorMessage, "Update Failed");
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
            showSuccess("User berhasil dihapus!");
        } catch (error: any) {
            console.error("Error deleting user:", error);
            const errorMessage = extractErrorMessage(error);
            showError(errorMessage, "Delete Failed");
        }
    }
</script>

<div class="p-4 sm:p-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800">User Management</h1>
            <p class="text-sm text-slate-500 mt-1">{users.length} total users</p>
        </div>
        {#if canManageUsers}
            <button
                on:click={() => goto("/dashboard/users/add")}
                class="btn btn-primary mt-3 sm:mt-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add User
            </button>
        {/if}
    </div>

    <!-- Success Message -->
    {#if showSuccessMessage}
        <div class="alert alert-success mb-5 animate-slide-up">
            <svg class="h-5 w-5 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <p class="font-medium flex-1">{successMessage}</p>
            <button
                type="button"
                aria-label="Close success message"
                on:click={() => (showSuccessMessage = false)}
                class="btn btn-ghost btn-icon btn-sm ml-auto"
            >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    {/if}

    <!-- Desktop Table View -->
    <div class="hidden md:block table-container">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each users as user (user.id)}
                    <tr class="stagger-item">
                        <td class="font-tabular">{user.id}</td>
                        <td>{user.email}</td>
                        <td>{user.name || "—"}</td>
                        <td>
                            <span class="badge {user.role?.name === 'super_admin'
                                ? 'badge-danger'
                                : user.role?.name === 'admin'
                                  ? 'badge-info'
                                  : 'badge-success'}">
                                {user.role?.name || user.role_id || "Unknown"}
                            </span>
                        </td>
                        <td>
                            <div class="flex items-center gap-1">
                                <button
                                    on:click={() => editUser(user)}
                                    class="btn btn-ghost btn-sm"
                                    disabled={!canManageUsers}
                                    title="Edit user"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    on:click={() => confirmDelete(user)}
                                    class="btn btn-ghost btn-sm"
                                    disabled={!canManageUsers || user.id === currentUser.id}
                                    title="Delete user"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="5">
                            <div class="empty-state">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p class="font-medium text-slate-500">No users found</p>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-3">
        {#each users as user (user.id)}
            <div class="card card-interactive p-4 stagger-item">
                <div class="flex items-start justify-between mb-3">
                    <div class="min-w-0 flex-1">
                        <p class="font-semibold text-slate-800 truncate">{user.name || "—"}</p>
                        <p class="text-sm text-slate-500 truncate">{user.email}</p>
                    </div>
                    <span class="badge ml-2 flex-shrink-0 {user.role?.name === 'super_admin'
                        ? 'badge-danger'
                        : user.role?.name === 'admin'
                          ? 'badge-info'
                          : 'badge-success'}">
                        {user.role?.name || user.role_id || "Unknown"}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-400">ID: <span class="font-tabular">{user.id}</span></span>
                    <div class="flex items-center gap-1">
                        <button
                            on:click={() => editUser(user)}
                            class="btn btn-ghost btn-sm"
                            disabled={!canManageUsers}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            on:click={() => confirmDelete(user)}
                            class="btn btn-ghost btn-sm"
                            disabled={!canManageUsers || user.id === currentUser.id}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="card p-8">
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p class="font-medium text-slate-500">No users found</p>
                </div>
            </div>
        {/each}
    </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && userToDelete}
    <div
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        tabindex="-1"
        on:click={cancelDelete}
        on:keydown={(e) => e.key === "Escape" && cancelDelete()}
    >
        <div
            class="modal-panel"
            role="document"
            on:click|stopPropagation
        >
            <div class="modal-header">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <h3 id="delete-modal-title" class="text-lg font-semibold text-slate-900">
                        Confirm Delete
                    </h3>
                </div>
            </div>
            <div class="modal-body">
                <p class="text-slate-600">
                    Are you sure you want to delete user <strong class="text-slate-800">{userToDelete.email}</strong>? This action cannot be undone.
                </p>
            </div>
            <div class="modal-footer">
                <button
                    on:click={cancelDelete}
                    class="btn btn-secondary"
                >
                    Cancel
                </button>
                <button
                    on:click={deleteUser}
                    class="btn btn-danger"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Edit User Drawer -->
{#if showEditModal && userToEdit}
    <div
        class="drawer-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        tabindex="-1"
        on:click={cancelEdit}
        on:keydown={(e) => e.key === "Escape" && cancelEdit()}
    >
    </div>
    <div
        class="drawer-panel"
        role="document"
        on:click|stopPropagation
    >
        <div class="drawer-header">
            <h3 id="edit-modal-title" class="text-lg font-semibold text-slate-900">
                Edit User
            </h3>
            <button
                type="button"
                on:click={cancelEdit}
                class="btn btn-ghost btn-icon btn-sm"
                aria-label="Close drawer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>

        <form on:submit|preventDefault={saveUser}>
            <div class="drawer-body space-y-5">
                <!-- Email -->
                <div>
                    <label for="edit-email" class="input-label">Email</label>
                    <input
                        type="email"
                        id="edit-email"
                        bind:value={editForm.email}
                        required
                        class="input"
                    />
                </div>

                <!-- Name -->
                <div>
                    <label for="edit-name" class="input-label">Name</label>
                    <input
                        type="text"
                        id="edit-name"
                        bind:value={editForm.name}
                        class="input"
                    />
                </div>

                <!-- Address -->
                <div>
                    <label for="edit-address" class="input-label">Address</label>
                    <textarea
                        id="edit-address"
                        bind:value={editForm.address}
                        rows="2"
                        class="input"
                    ></textarea>
                </div>

                <!-- Phone Number -->
                <div>
                    <label for="edit-phone" class="input-label">Phone Number</label>
                    <input
                        type="text"
                        id="edit-phone"
                        bind:value={editForm.phone_number}
                        class="input"
                    />
                </div>

                <!-- NIK -->
                <div>
                    <label for="edit-nik" class="input-label">NIK</label>
                    <input
                        type="text"
                        id="edit-nik"
                        bind:value={editForm.nik}
                        class="input font-tabular"
                    />
                </div>

                <!-- Role -->
                <div>
                    <label for="edit-role" class="input-label">Role</label>
                    <select
                        id="edit-role"
                        bind:value={editForm.role_id}
                        required
                        class="input"
                    >
                        <option value={1}>Super Admin</option>
                        <option value={2}>Admin</option>
                        <option value={3}>Member</option>
                    </select>
                </div>

                <!-- Password -->
                <div>
                    <label for="edit-password" class="input-label">
                        New Password <span class="font-normal text-slate-400">(leave empty to keep current)</span>
                    </label>
                    <div class="relative">
                        <input
                            type={showEditPassword ? "text" : "password"}
                            id="edit-password"
                            bind:value={editForm.password}
                            class="input pr-10"
                        />
                        <button
                            type="button"
                            on:click={() => (showEditPassword = !showEditPassword)}
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {#if showEditPassword}
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>
            </div>

            <div class="drawer-footer">
                <button
                    type="button"
                    on:click={cancelEdit}
                    class="btn btn-secondary"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                >
                    Save Changes
                </button>
            </div>
        </form>
    </div>
{/if}
