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

<div class="max-w-2xl mx-auto animate-fade-in">
    <div class="flex items-center justify-between mb-6">
        <div>
            <button
                on:click={goBack}
                class="mb-3 text-teal-600 hover:text-teal-800 flex items-center gap-1 text-sm font-medium transition-colors"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Kembali ke Daftar User
            </button>
            <h1 class="text-2xl font-bold text-slate-900">Edit User</h1>
        </div>
    </div>

    {#if !canManageUsers}
        <div class="alert alert-danger">
            <svg class="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p>You don't have permission to edit users.</p>
        </div>
    {:else}
        <div class="card">
            <form method="POST" action="?/update" use:enhance={handleSubmit} class="p-6 space-y-5">
                <div>
                    <label for="email" class="input-label">Email</label>
                    <input type="email" id="email" name="email" value={user.email} required class="input" />
                </div>

                <div>
                    <label for="name" class="input-label">Nama</label>
                    <input type="text" id="name" name="name" value={user.name || ""} class="input" />
                </div>

                <div>
                    <label for="phone_number" class="input-label">No. Telepon</label>
                    <input type="text" id="phone_number" name="phone_number" value={user.phone_number || ""} class="input" />
                </div>

                <div>
                    <label for="nik" class="input-label">NIK</label>
                    <input type="text" id="nik" name="nik" value={user.nik || ""} class="input font-tabular" />
                </div>

                <div>
                    <label for="role_id" class="input-label">Role</label>
                    <select id="role_id" name="role_id" required class="input">
                        {#each roles as role}
                            <option value={role.id} selected={role.id === user.role_id}>
                                {role.name}
                            </option>
                        {/each}
                    </select>
                </div>

                <div>
                    <label for="password" class="input-label">Password Baru (kosongkan untuk tetap)</label>
                    <div class="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            class="input pr-11"
                        />
                        <button
                            type="button"
                            on:click={() => (showPassword = !showPassword)}
                            class="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {#if showPassword}
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            {:else}
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-5 border-t border-slate-200">
                    <button
                        type="button"
                        on:click={goBack}
                        class="btn btn-secondary"
                        disabled={isSubmitting}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : "Update User"}
                    </button>
                </div>
            </form>
        </div>
    {/if}
</div>
