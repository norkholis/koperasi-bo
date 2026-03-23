<script lang="ts">
    import type { User } from "$lib/types";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";

    export let data;
    export let form;

    $: user = data.user; // Make user reactive to data changes

    let profileLoading = false;
    let passwordLoading = false;

    // Password visibility toggles
    let showCurrentPassword = false;
    let showNewPassword = false;
    let showConfirmPassword = false;

    function handleProfileSubmit() {
        profileLoading = true;
        return async ({ result }: { result: any }) => {
            profileLoading = false;
            if (result.type === "success") {
                // Profile updated successfully - refresh data
                await invalidateAll();
            }
        };
    }

    function handlePasswordSubmit() {
        passwordLoading = true;
        return async ({ result }: { result: any }) => {
            passwordLoading = false;
            if (result.type === "success") {
                // Clear password fields
                const form = document.getElementById(
                    "passwordForm",
                ) as HTMLFormElement;
                if (form) form.reset();
            }
        };
    }
</script>

<div class="max-w-5xl mx-auto animate-fade-in">
    <!-- Avatar + Page Header -->
    <div class="flex items-center gap-5 mb-8">
        <div class="profile-avatar">
            {(user.name || user.email || "U").charAt(0).toUpperCase()}
        </div>
        <div>
            <h2 class="text-2xl font-bold text-slate-900">{user.name || user.email}</h2>
            <p class="text-slate-500 mt-0.5">
                Kelola informasi personal dan keamanan akun Anda
            </p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Information -->
        <div class="card animate-slide-up">
            <div class="card-section-header">
                <svg class="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 class="text-base font-semibold text-slate-900">Informasi Profile</h3>
            </div>

            {#if form?.success}
                <div class="mx-6 mt-4 alert alert-success">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{form.success}</p>
                </div>
            {/if}

            {#if form?.error}
                <div class="mx-6 mt-4 alert alert-danger">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{form.error}</p>
                </div>
            {/if}

            <form
                method="POST"
                action="?/updateProfile"
                use:enhance={handleProfileSubmit}
                class="p-6 space-y-5"
            >
                <!-- User Info Display -->
                <div class="card user-info-card">
                    <dl class="user-info-grid">
                        <div class="user-info-item">
                            <dt class="user-info-label">ID</dt>
                            <dd class="user-info-value font-tabular">{user.id}</dd>
                        </div>
                        <div class="user-info-item">
                            <dt class="user-info-label">Role</dt>
                            <dd class="user-info-value">
                                <span class="badge badge-primary capitalize">{user.role?.name.replace("_", " ")}</span>
                            </dd>
                        </div>
                        <div class="user-info-item col-span-2">
                            <dt class="user-info-label">Terdaftar</dt>
                            <dd class="user-info-value font-tabular">{new Date(user.created_at || "").toLocaleDateString("id-ID")}</dd>
                        </div>
                    </dl>
                </div>

                <!-- Editable Fields -->
                <div>
                    <label for="email" class="input-label">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={user.email}
                        class="input"
                    />
                </div>

                <div>
                    <label for="full_name" class="input-label">Nama Lengkap</label>
                    <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={user.name || ""}
                        class="input"
                    />
                </div>

                <div>
                    <label for="phone_number" class="input-label">No. Telepon</label>
                    <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        value={user.phone_number || ""}
                        class="input"
                    />
                </div>

                <div>
                    <label for="address" class="input-label">Alamat</label>
                    <textarea
                        id="address"
                        name="address"
                        rows="3"
                        class="input"
                        >{user.address || ""}</textarea
                    >
                </div>

                <button
                    type="submit"
                    class="btn btn-primary w-full"
                    disabled={profileLoading}
                >
                    {#if profileLoading}
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Menyimpan...
                    {:else}
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Update Profile
                    {/if}
                </button>
            </form>
        </div>

        <!-- Change Password -->
        <div class="card animate-slide-up" style="animation-delay: 60ms;">
            <div class="card-section-header">
                <svg class="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 class="text-base font-semibold text-slate-900">Ubah Password</h3>
            </div>

            {#if form?.passwordSuccess}
                <div class="mx-6 mt-4 alert alert-success">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{form.passwordSuccess}</p>
                </div>
            {/if}

            {#if form?.passwordError}
                <div class="mx-6 mt-4 alert alert-danger">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{form.passwordError}</p>
                </div>
            {/if}

            <form
                id="passwordForm"
                method="POST"
                action="?/changePassword"
                use:enhance={handlePasswordSubmit}
                class="p-6 space-y-5"
            >
                <div>
                    <label for="current_password" class="input-label">Password Saat Ini</label>
                    <div class="relative">
                        <input
                            id="current_password"
                            name="current_password"
                            type={showCurrentPassword ? "text" : "password"}
                            required
                            class="input pr-10"
                        />
                        <button
                            type="button"
                            on:click={() =>
                                (showCurrentPassword = !showCurrentPassword)}
                            class="password-toggle-btn"
                        >
                            {#if showCurrentPassword}
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            {:else}
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>

                <div>
                    <label for="new_password" class="input-label">Password Baru</label>
                    <div class="relative">
                        <input
                            id="new_password"
                            name="new_password"
                            type={showNewPassword ? "text" : "password"}
                            required
                            minlength="6"
                            class="input pr-10"
                        />
                        <button
                            type="button"
                            on:click={() =>
                                (showNewPassword = !showNewPassword)}
                            class="password-toggle-btn"
                        >
                            {#if showNewPassword}
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            {:else}
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>

                <div>
                    <label for="confirm_password" class="input-label">Konfirmasi Password Baru</label>
                    <div class="relative">
                        <input
                            id="confirm_password"
                            name="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            minlength="6"
                            class="input pr-10"
                        />
                        <button
                            type="button"
                            on:click={() =>
                                (showConfirmPassword = !showConfirmPassword)}
                            class="password-toggle-btn"
                        >
                            {#if showConfirmPassword}
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            {:else}
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    class="btn btn-primary w-full"
                    disabled={passwordLoading}
                >
                    {#if passwordLoading}
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Mengubah...
                    {:else}
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Ubah Password
                    {/if}
                </button>
            </form>
        </div>
    </div>
</div>

<style>
    .profile-avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        font-weight: 700;
        flex-shrink: 0;
        box-shadow: 0 4px 14px rgb(13 148 136 / 0.3);
    }

    .card-section-header {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .user-info-card {
        padding: 1rem;
        background: var(--color-primary-50);
        border-color: var(--color-primary-200);
    }

    .user-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .user-info-item {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }

    .user-info-label {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
    }

    .user-info-value {
        font-size: 0.875rem;
        color: #1e293b;
        font-weight: 500;
    }

    .col-span-2 {
        grid-column: span 2;
    }

    .password-toggle-btn {
        position: absolute;
        inset-block: 0;
        right: 0;
        padding-right: 0.75rem;
        display: flex;
        align-items: center;
        color: #94a3b8;
        background: none;
        border: none;
        cursor: pointer;
        transition: color var(--transition-fast);
    }

    .password-toggle-btn:hover {
        color: #475569;
    }

    textarea.input {
        resize: vertical;
    }
</style>
