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

<div class="max-w-2xl mx-auto animate-fade-in">
    <div class="mb-6">
        <button
            on:click={goBack}
            class="mb-4 text-teal-600 hover:text-teal-800 flex items-center gap-1 text-sm font-medium transition-colors"
        >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali ke Daftar User
        </button>
        <h2 class="text-2xl font-bold text-slate-900">Tambah User Baru</h2>
        <p class="text-slate-500 mt-1">Buat akun pengguna baru untuk sistem</p>
    </div>

    {#if showError || form?.error}
        <div class="alert alert-danger mb-6 animate-slide-up">
            <svg class="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{errorMessage || form?.error}</p>
        </div>
    {/if}

    <div class="card">
        <form method="POST" use:enhance={handleSubmit} class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Email -->
                <div class="md:col-span-2">
                    <label for="email" class="input-label">Email *</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="user@example.com"
                        class="input"
                    />
                    <p class="mt-1.5 text-xs text-slate-400">
                        Email akan digunakan sebagai username untuk login
                    </p>
                </div>

                <!-- Password -->
                <div class="md:col-span-2">
                    <label for="password" class="input-label">Password *</label>
                    <div class="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            minlength="6"
                            placeholder="Minimal 6 karakter"
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

                <!-- Full Name -->
                <div>
                    <label for="name" class="input-label">Nama Lengkap *</label>
                    <input id="name" name="name" type="text" required class="input" />
                </div>

                <!-- Phone -->
                <div>
                    <label for="phone_number" class="input-label">No. Telepon *</label>
                    <input id="phone_number" name="phone_number" type="tel" required class="input" />
                </div>

                <!-- NIK -->
                <div class="md:col-span-2">
                    <label for="nik" class="input-label">NIK (Nomor Induk Kependudukan)</label>
                    <input
                        id="nik"
                        name="nik"
                        type="text"
                        title="NIK harus 16 digit angka (opsional)"
                        maxlength="16"
                        placeholder="Masukkan 16 digit NIK (opsional)"
                        on:input={handleNikInput}
                        class="input font-tabular"
                    />
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                    <label for="address" class="input-label">Alamat</label>
                    <textarea
                        id="address"
                        name="address"
                        rows="3"
                        placeholder="Alamat lengkap pengguna"
                        class="input"
                        style="resize: vertical;"
                    ></textarea>
                </div>

                <!-- Role -->
                <div class="md:col-span-2">
                    <label for="role_id" class="input-label">Role *</label>
                    <select id="role_id" name="role_id" required class="input">
                        <option value="">Pilih Role</option>
                        {#if isSuper}
                            <option value="1">Super Admin - Akses penuh ke seluruh sistem</option>
                        {/if}
                        <option value="2">Admin - Dapat mengelola user dan data sistem</option>
                        <option value="3">Member - Akses terbatas sebagai anggota</option>
                    </select>
                    <p class="mt-1.5 text-xs text-slate-400">
                        Pilih role sesuai dengan tingkat akses yang dibutuhkan
                    </p>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                    type="button"
                    on:click={goBack}
                    class="btn btn-secondary"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Membuat..." : "Buat User"}
                </button>
            </div>
        </form>
    </div>

    <!-- Role Information -->
    <div class="alert alert-info mt-6">
        <svg class="w-5 h-5 flex-shrink-0 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div>
            <h4 class="font-semibold mb-1">Informasi Role:</h4>
            <ul class="text-sm space-y-1">
                {#if isSuper}
                    <li><strong>Super Admin:</strong> Akses penuh, dapat mengelola semua user termasuk admin</li>
                {/if}
                <li><strong>Admin:</strong> Dapat mengelola user member dan mengakses fungsi administrasi</li>
                <li><strong>Member:</strong> Akses terbatas untuk anggota koperasi</li>
            </ul>
        </div>
    </div>
</div>
