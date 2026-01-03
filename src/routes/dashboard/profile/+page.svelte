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

<div class="max-w-4xl mx-auto">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Profile Saya</h2>
        <p class="text-gray-600 mt-2">
            Kelola informasi personal dan keamanan akun Anda
        </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Information -->
        <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">
                    Informasi Profile
                </h3>
            </div>

            {#if form?.success}
                <div
                    class="mx-6 mt-4 bg-green-50 border border-green-200 rounded-md p-4"
                >
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg
                                class="h-5 w-5 text-green-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-green-700">{form.success}</p>
                        </div>
                    </div>
                </div>
            {/if}

            {#if form?.error}
                <div
                    class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4"
                >
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg
                                class="h-5 w-5 text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">{form.error}</p>
                        </div>
                    </div>
                </div>
            {/if}

            <form
                method="POST"
                action="?/updateProfile"
                use:enhance={handleProfileSubmit}
                class="p-6 space-y-4"
            >
                <!-- User Info Display -->
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="font-medium text-gray-600">ID:</span>
                            <span class="ml-2">{user.id}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-600">Role:</span>
                            <span class="ml-2 capitalize"
                                >{user.role?.name.replace("_", " ")}</span
                            >
                        </div>
                        <div class="col-span-2">
                            <span class="font-medium text-gray-600"
                                >Terdaftar:</span
                            >
                            <span class="ml-2"
                                >{new Date(
                                    user.created_at || "",
                                ).toLocaleDateString("id-ID")}</span
                            >
                        </div>
                    </div>
                </div>

                <!-- Editable Fields -->
                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={user.email}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label
                        for="full_name"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Nama Lengkap
                    </label>
                    <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={user.name || ""}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label
                        for="phone_number"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        No. Telepon
                    </label>
                    <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        value={user.phone_number || ""}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label
                        for="address"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Alamat
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        rows="3"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >{user.address || ""}</textarea
                    >
                </div>

                <button
                    type="submit"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={profileLoading}
                >
                    {profileLoading ? "Menyimpan..." : "Update Profile"}
                </button>
            </form>
        </div>

        <!-- Change Password -->
        <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Ubah Password</h3>
            </div>

            {#if form?.passwordSuccess}
                <div
                    class="mx-6 mt-4 bg-green-50 border border-green-200 rounded-md p-4"
                >
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg
                                class="h-5 w-5 text-green-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-green-700">
                                {form.passwordSuccess}
                            </p>
                        </div>
                    </div>
                </div>
            {/if}

            {#if form?.passwordError}
                <div
                    class="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4"
                >
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg
                                class="h-5 w-5 text-red-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">
                                {form.passwordError}
                            </p>
                        </div>
                    </div>
                </div>
            {/if}

            <form
                id="passwordForm"
                method="POST"
                action="?/changePassword"
                use:enhance={handlePasswordSubmit}
                class="p-6 space-y-4"
            >
                <div>
                    <label
                        for="current_password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Password Saat Ini
                    </label>
                    <div class="relative">
                        <input
                            id="current_password"
                            name="current_password"
                            type={showCurrentPassword ? "text" : "password"}
                            required
                            class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            on:click={() =>
                                (showCurrentPassword = !showCurrentPassword)}
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                            {#if showCurrentPassword}
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
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
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

                <div>
                    <label
                        for="new_password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Password Baru
                    </label>
                    <div class="relative">
                        <input
                            id="new_password"
                            name="new_password"
                            type={showNewPassword ? "text" : "password"}
                            required
                            minlength="6"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            on:click={() =>
                                (showNewPassword = !showNewPassword)}
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                            {#if showNewPassword}
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
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
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

                <div>
                    <label
                        for="confirm_password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Konfirmasi Password Baru
                    </label>
                    <div class="relative">
                        <input
                            id="confirm_password"
                            name="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            minlength="6"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            on:click={() =>
                                (showConfirmPassword = !showConfirmPassword)}
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                            {#if showConfirmPassword}
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
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
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

                <button
                    type="submit"
                    class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={passwordLoading}
                >
                    {passwordLoading ? "Mengubah..." : "Ubah Password"}
                </button>
            </form>
        </div>
    </div>
</div>
