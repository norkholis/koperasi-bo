<script lang="ts">
    import type { User } from "$lib/types";
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";

    export let data;
    export let form;

    const user: User = data.user;
    const currentUser: User = data.currentUser;
    const isSuper = currentUser?.role?.name === "super_admin";

    let loading = false;
    let showPassword = false;

    function handleSubmit() {
        loading = true;
        return async ({ result }: { result: any }) => {
            loading = false;
            if (result.type === "redirect") {
                goto(result.location);
            }
        };
    }

    function goBack() {
        goto("/dashboard/users");
    }
</script>

<div class="max-w-2xl mx-auto">
    <div class="mb-6">
        <button
            on:click={goBack}
            class="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
            ← Kembali ke Daftar User
        </button>
        <h2 class="text-2xl font-bold text-gray-900">Edit User</h2>
        <p class="text-gray-600 mt-2">Edit informasi pengguna</p>
    </div>

    {#if form?.error}
        <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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

    <div class="bg-white shadow rounded-lg">
        <form
            method="POST"
            action="?/update"
            use:enhance={handleSubmit}
            class="p-6 space-y-6"
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Email -->
                <div class="md:col-span-2">
                    <label
                        for="email"
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email *
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

                <!-- Password -->
                <div class="md:col-span-2">
                    <label
                        for="password"
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Password Baru (Kosongkan jika tidak ingin mengubah)
                    </label>
                    <div class="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password baru"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <!-- Full Name -->
                <div>
                    <label
                        for="full_name"
                        class="block text-sm font-medium text-gray-700 mb-2"
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

                <!-- Phone -->
                <div>
                    <label
                        for="phone"
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        No. Telepon
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={user.phone_number || ""}
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                    <label
                        for="address"
                        class="block text-sm font-medium text-gray-700 mb-2"
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

                <!-- Role -->
                <div>
                    <label
                        for="role_id"
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Role *
                    </label>
                    <select
                        id="role_id"
                        name="role_id"
                        required
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {#if isSuper}
                            <option value="1" selected={user.role?.id === 1}
                                >Super Admin</option
                            >
                        {/if}
                        <option value="2" selected={user.role?.id === 2}
                            >Admin</option
                        >
                        <option value="3" selected={user.role?.id === 3}
                            >Member</option
                        >
                    </select>
                </div>

                <!-- Status -->
                <div>
                    <div class="flex items-center">
                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={user.is_active !== false}
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                            for="is_active"
                            class="ml-2 block text-sm font-medium text-gray-700"
                        >
                            User Aktif
                        </label>
                    </div>
                </div>
            </div>

            <!-- User Info -->
            <div class="border-t pt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Informasi User
                </h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-gray-600">ID:</span>
                        <span class="ml-2">{user.id}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Terdaftar:</span
                        >
                        <span class="ml-2"
                            >{new Date(
                                user.created_at || "",
                            ).toLocaleDateString("id-ID")}</span
                        >
                    </div>
                    {#if user.updated_at}
                        <div class="col-span-2">
                            <span class="font-medium text-gray-600"
                                >Terakhir Diupdate:</span
                            >
                            <span class="ml-2"
                                >{new Date(user.updated_at).toLocaleDateString(
                                    "id-ID",
                                )}</span
                            >
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end space-x-3 pt-6 border-t">
                <button
                    type="button"
                    on:click={goBack}
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </form>
    </div>
</div>
