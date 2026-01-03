<script lang="ts">
    import type { User, Role } from "$lib/types";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
    import { showSuccess, showError } from "$lib/stores/notifications";

    export let data;

    const user: User = data.user;
    const roles: Role[] = data.roles;
    const currentUser = data.currentUser;

    let isSubmitting = false;
    let showPassword = false;

    const canManageUsers =
        currentUser?.role?.name === "admin" ||
        currentUser?.role?.name === "super_admin";

    function goBack() {
        goto("/dashboard/users");
    }

    function handleSubmit() {
        isSubmitting = true;
        return async ({ result }: { result: { type: string; data?: any } }) => {
            isSubmitting = false;
            if (result.type === "success") {
                if (result.data?.success) {
                    showSuccess("User updated successfully!");
                    goto("/dashboard/users");
                } else {
                    showError(result.data?.message || "Failed to update user");
                }
            }
        };
    }
</script>

<div class="p-6 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Edit User</h1>
        <button
            on:click={goBack}
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
            Back to Users
        </button>
    </div>

    {#if !canManageUsers}
        <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p class="text-red-800">You don't have permission to edit users.</p>
        </div>
    {:else}
        <div class="bg-white shadow rounded-lg p-6">
            <form method="POST" action="?/update" use:enhance={handleSubmit}>
                <div class="space-y-4">
                    <!-- Email -->
                    <div>
                        <label
                            for="email"
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={user.email}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <!-- Name -->
                    <div>
                        <label
                            for="name"
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={user.name || ""}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <!-- Phone Number -->
                    <div>
                        <label
                            for="phone_number"
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Phone Number
                        </label>
                        <input
                            type="text"
                            id="phone_number"
                            name="phone_number"
                            value={user.phone_number || ""}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <!-- NIK -->
                    <div>
                        <label
                            for="nik"
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            NIK
                        </label>
                        <input
                            type="text"
                            id="nik"
                            name="nik"
                            value={user.nik || ""}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <!-- Role -->
                    <div>
                        <label
                            for="role_id"
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Role
                        </label>
                        <select
                            id="role_id"
                            name="role_id"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {#each roles as role}
                                <option
                                    value={role.id}
                                    selected={role.id === user.role_id}
                                >
                                    {role.name}
                                </option>
                            {/each}
                        </select>
                    </div>

                    <!-- Password (optional) -->
                    <div>
                        <label
                            for="password"
                            class="block text-sm font-medium text-gray-700 mb-1"
                        >
                            New Password (leave empty to keep current)
                        </label>
                        <div class="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                on:click={() => (showPassword = !showPassword)}
                                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {#if showPassword}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                            clip-rule="evenodd"
                                        />
                                        <path
                                            d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                                        />
                                    </svg>
                                {:else}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                {/if}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        on:click={goBack}
                        class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : "Update User"}
                    </button>
                </div>
            </form>
        </div>
    {/if}
</div>
