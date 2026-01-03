<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";

    export let data;
    export let form;

    const currentUser = data.user;
    const isSuper = currentUser?.role?.name === "super_admin";

    let loading = false;
    let errorMessage = "";
    let showError = false;
    let showPassword = false;

    function handleSubmit() {
        loading = true;
        errorMessage = "";
        showError = false;

        return async ({ result }: { result: any }) => {
            loading = false;
            console.log("📥 Form submission result:", result);
            console.log("📋 Result type:", result.type);
            console.log("📋 Result status:", result.status);
            console.log("📋 Result data:", result.data);

            if (result.type === "redirect") {
                goto(result.location);
            } else if (result.type === "failure") {
                console.log("❌ Form submission failed");

                // Extract error message from the complex data structure
                if (result.data) {
                    try {
                        if (typeof result.data === "string") {
                            // Try to parse the data string if it's JSON
                            const parsed = JSON.parse(result.data);
                            if (Array.isArray(parsed) && parsed.length > 1) {
                                errorMessage = parsed[1];
                            } else {
                                errorMessage = result.data;
                            }
                        } else if (result.data.error) {
                            errorMessage = result.data.error;
                        } else {
                            errorMessage = "Gagal menambahkan user";
                        }
                    } catch (e) {
                        errorMessage = "Gagal menambahkan user";
                    }
                } else {
                    errorMessage = "Gagal menambahkan user";
                }

                showError = true;
                console.log("🔍 Extracted error message:", errorMessage);
            }
        };
    }

    function goBack() {
        goto("/dashboard/users");
    }

    // NIK input formatting - only allow numbers
    function handleNikInput(event: Event) {
        const input = event.target as HTMLInputElement;
        // Remove all non-digit characters
        input.value = input.value.replace(/\D/g, "");
        // Limit to 16 digits
        console.log("Current NIK input length:", input.value.length);
        if (input.value.length > 16) {
            input.value = input.value.slice(0, 16);
        }
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
        <h2 class="text-2xl font-bold text-gray-900">Tambah User Baru</h2>
        <p class="text-gray-600 mt-2">Buat akun pengguna baru untuk sistem</p>
    </div>

    {#if showError || form?.error}
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
                    <p class="text-sm text-red-700">
                        {errorMessage || form?.error}
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <div class="bg-white shadow rounded-lg">
        <form method="POST" use:enhance={handleSubmit} class="p-6 space-y-6">
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
                        placeholder="user@example.com"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p class="mt-1 text-sm text-gray-500">
                        Email akan digunakan sebagai username untuk login
                    </p>
                </div>

                <!-- Password -->
                <div class="md:col-span-2">
                    <label
                        for="password"
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Password *
                    </label>
                    <div class="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            minlength="6"
                            placeholder="Minimal 6 karakter"
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
                        for="name"
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Nama Lengkap *
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <!-- Phone -->
                <div>
                    <label
                        for="phone_number"
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        No. Telepon *
                    </label>
                    <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        required
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <!-- NIK -->
                <div class="md:col-span-2">
                    <label
                        for="nik"
                        class="block text-sm font-medium text-gray-700 mb-2"
                    >
                        NIK (Nomor Induk Kependudukan)
                    </label>
                    <input
                        id="nik"
                        name="nik"
                        type="text"
                        title="NIK harus 16 digit angka (opsional)"
                        maxlength="16"
                        placeholder="Masukkan 16 digit NIK (opsional)"
                        on:input={handleNikInput}
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
                        placeholder="Alamat lengkap pengguna"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                </div>

                <!-- Role -->
                <div class="md:col-span-2">
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
                        <option value="">Pilih Role</option>
                        {#if isSuper}
                            <option value="1"
                                >Super Admin - Akses penuh ke seluruh sistem</option
                            >
                        {/if}
                        <option value="2"
                            >Admin - Dapat mengelola user dan data sistem</option
                        >
                        <option value="3"
                            >Member - Akses terbatas sebagai anggota</option
                        >
                    </select>
                    <p class="mt-1 text-sm text-gray-500">
                        Pilih role sesuai dengan tingkat akses yang dibutuhkan
                    </p>
                </div>
            </div>

            <!-- Form Actions -->
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
                    {loading ? "Membuat..." : "Buat User"}
                </button>
            </div>
        </form>
    </div>

    <!-- Role Information -->
    <div class="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-800 mb-2">Informasi Role:</h4>
        <ul class="text-sm text-blue-700 space-y-1">
            {#if isSuper}
                <li>
                    <strong>Super Admin:</strong> Akses penuh, dapat mengelola semua
                    user termasuk admin
                </li>
            {/if}
            <li>
                <strong>Admin:</strong> Dapat mengelola user member dan mengakses
                fungsi administrasi
            </li>
            <li>
                <strong>Member:</strong> Akses terbatas untuk anggota koperasi
            </li>
        </ul>
    </div>
</div>
