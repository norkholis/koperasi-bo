<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";

    export let data;
    export let form;

    const currentUser = data.user;
    const isSuper = currentUser?.role?.name === "super_admin";

    let loading = false;

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
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minlength="6"
                        placeholder="Minimal 6 karakter"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
