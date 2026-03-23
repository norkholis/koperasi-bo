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

<div class="max-w-2xl mx-auto animate-fade-in">
    <div class="mb-6">
        <button
            on:click={goBack}
            class="mb-3 text-teal-600 hover:text-teal-800 flex items-center gap-1 text-sm font-medium transition-colors"
        >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali ke Daftar User
        </button>
        <h2 class="text-2xl font-bold text-slate-900">Edit User</h2>
        <p class="text-slate-500 mt-1">Edit informasi pengguna</p>
    </div>

    {#if form?.error}
        <div class="alert alert-danger mb-6 animate-slide-up">
            <svg class="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{form.error}</p>
        </div>
    {/if}

    <div class="card">
        <form
            method="POST"
            action="?/update"
            use:enhance={handleSubmit}
            class="p-6 space-y-6"
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Email -->
                <div class="md:col-span-2">
                    <label for="email" class="input-label">Email *</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={user.email}
                        class="input"
                    />
                </div>

                <!-- Password -->
                <div class="md:col-span-2">
                    <label for="password" class="input-label">Password Baru (Kosongkan jika tidak ingin mengubah)</label>
                    <div class="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password baru"
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
                    <label for="full_name" class="input-label">Nama Lengkap</label>
                    <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={user.name || ""}
                        class="input"
                    />
                </div>

                <!-- Phone -->
                <div>
                    <label for="phone" class="input-label">No. Telepon</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={user.phone_number || ""}
                        class="input"
                    />
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                    <label for="address" class="input-label">Alamat</label>
                    <textarea
                        id="address"
                        name="address"
                        rows="3"
                        class="input"
                        style="resize: vertical;"
                        >{user.address || ""}</textarea
                    >
                </div>

                <!-- Role -->
                <div>
                    <label for="role_id" class="input-label">Role *</label>
                    <select
                        id="role_id"
                        name="role_id"
                        required
                        class="input"
                    >
                        {#if isSuper}
                            <option value="1" selected={user.role?.id === 1}>Super Admin</option>
                        {/if}
                        <option value="2" selected={user.role?.id === 2}>Admin</option>
                        <option value="3" selected={user.role?.id === 3}>Member</option>
                    </select>
                </div>

                <!-- Status -->
                <div>
                    <label class="input-label mb-3">Status</label>
                    <div class="flex items-center gap-2">
                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={user.is_active !== false}
                            class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                        />
                        <label for="is_active" class="text-sm font-medium text-slate-700">
                            User Aktif
                        </label>
                    </div>
                </div>
            </div>

            <!-- User Info -->
            <div class="border-t border-slate-200 pt-5">
                <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Informasi User
                </h3>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="font-medium text-slate-500">ID:</span>
                        <span class="ml-2 text-slate-900 font-tabular">{user.id}</span>
                    </div>
                    <div>
                        <span class="font-medium text-slate-500">Terdaftar:</span>
                        <span class="ml-2 text-slate-900 font-tabular"
                            >{new Date(
                                user.created_at || "",
                            ).toLocaleDateString("id-ID")}</span
                        >
                    </div>
                    {#if user.updated_at}
                        <div class="col-span-2">
                            <span class="font-medium text-slate-500">Terakhir Diupdate:</span>
                            <span class="ml-2 text-slate-900 font-tabular"
                                >{new Date(user.updated_at).toLocaleDateString(
                                    "id-ID",
                                )}</span
                            >
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end gap-3 pt-5 border-t border-slate-200">
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
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </form>
    </div>
</div>
