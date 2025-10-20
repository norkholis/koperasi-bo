<script lang="ts">
    import type { User, Role } from "$lib/types";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";

    export let data;
    export let form;

    const user: User = data.user;
    const roles: Role[] = data.roles;
    const currentUser = data.currentUser;

    let isSubmitting = false;

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
                    alert("User updated successfully!");
                    goto("/dashboard/users");
                } else {
                    alert(result.data?.message || "Failed to update user");
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
                        <input
                            type="password"
                            id="password"
                            name="password"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
