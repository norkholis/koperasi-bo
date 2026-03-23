<script lang="ts">
    export let data;
    const user = data.user;
</script>

<div class="space-y-8">
    <!-- Header -->
    <div class="animate-fade-in">
        <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
            <span class="badge badge-danger">Super Admin</span>
        </div>
        <p class="text-slate-500">Selamat datang, {user.full_name || user.email}! Anda memiliki akses penuh ke sistem.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <a href="/dashboard/users" class="card card-interactive p-5 stagger-item block group border-t-2 border-teal-500">
            <div class="flex items-start justify-between mb-4">
                <div class="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                    <svg class="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                </div>
                <svg class="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
            </div>
            <h3 class="font-semibold text-slate-900 mb-0.5">Kelola User</h3>
            <p class="text-sm text-slate-500">Manajemen semua pengguna</p>
        </a>

        <div class="card p-5 stagger-item border-t-2 border-amber-500 opacity-60">
            <div class="flex items-start justify-between mb-4">
                <div class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                </div>
            </div>
            <h3 class="font-semibold text-slate-900 mb-0.5">Admin Control</h3>
            <p class="text-sm text-slate-500">Segera hadir</p>
        </div>

        <div class="card p-5 stagger-item border-t-2 border-emerald-500 opacity-60">
            <div class="flex items-start justify-between mb-4">
                <div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>
            <h3 class="font-semibold text-slate-900 mb-0.5">Sistem</h3>
            <p class="text-sm text-slate-500">Segera hadir</p>
        </div>

        <div class="card p-5 stagger-item border-t-2 border-rose-500 opacity-60">
            <div class="flex items-start justify-between mb-4">
                <div class="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
                    <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                </div>
            </div>
            <h3 class="font-semibold text-slate-900 mb-0.5">Laporan</h3>
            <p class="text-sm text-slate-500">Segera hadir</p>
        </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Account Info (2 cols) -->
        <div class="lg:col-span-2 card p-6 animate-slide-up">
            <h2 class="text-lg font-semibold text-slate-900 mb-6">Informasi Super Admin</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Detail Akun</h3>
                    <dl class="space-y-4">
                        <div class="flex justify-between items-center">
                            <dt class="text-sm text-slate-500">ID</dt>
                            <dd class="font-tabular font-medium text-slate-900">#{user.id}</dd>
                        </div>
                        <div class="flex justify-between items-center">
                            <dt class="text-sm text-slate-500">Nama Lengkap</dt>
                            <dd class="text-sm font-medium text-slate-900">{user.full_name || "Belum diisi"}</dd>
                        </div>
                        <div class="flex justify-between items-center">
                            <dt class="text-sm text-slate-500">Email</dt>
                            <dd class="text-sm font-medium text-slate-900">{user.email}</dd>
                        </div>
                        <div class="flex justify-between items-center">
                            <dt class="text-sm text-slate-500">Role</dt>
                            <dd><span class="badge badge-danger">Super Admin</span></dd>
                        </div>
                        <div class="flex justify-between items-center">
                            <dt class="text-sm text-slate-500">No. Telepon</dt>
                            <dd class="text-sm font-medium text-slate-900">{user.phone || "Belum diisi"}</dd>
                        </div>
                        <div class="flex justify-between items-center">
                            <dt class="text-sm text-slate-500">Terdaftar</dt>
                            <dd class="font-tabular text-sm font-medium text-slate-900">{new Date(user.created_at).toLocaleDateString("id-ID")}</dd>
                        </div>
                    </dl>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Hak Akses</h3>
                    <ul class="space-y-3">
                        {#each ["Kelola semua user", "Hapus user (termasuk admin)", "Buat admin baru", "Akses pengaturan sistem", "Lihat semua laporan"] as permission}
                            <li class="flex items-center gap-2.5">
                                <div class="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                                    <svg class="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <span class="text-sm text-slate-700">{permission}</span>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="card p-6 animate-slide-up">
                <h2 class="text-lg font-semibold text-slate-900 mb-4">Aksi Cepat</h2>
                <div class="space-y-3">
                    <a href="/dashboard/users/add" class="btn btn-primary w-full">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Tambah User Baru
                    </a>
                    <a href="/dashboard/users" class="btn btn-secondary w-full">
                        Kelola Semua User
                    </a>
                    <a href="/dashboard/profile" class="btn btn-secondary w-full">
                        Edit Profile Saya
                    </a>
                </div>
            </div>

            <!-- Profile Status -->
            <div class="card p-6 animate-slide-up">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Status Profil</h3>

                {#if user.full_name && user.phone && user.address}
                    <div class="alert alert-success">
                        <svg class="w-5 h-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="font-medium">Profil lengkap!</span>
                    </div>
                {:else}
                    <div class="alert alert-warning">
                        <svg class="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div>
                            <p class="font-medium">Profil Belum Lengkap</p>
                            <a href="/dashboard/profile" class="text-sm font-semibold mt-1 inline-block hover:underline">
                                Lengkapi Profil &rarr;
                            </a>
                        </div>
                    </div>
                {/if}

                <div class="mt-4">
                    <h4 class="text-sm font-medium text-slate-500 mb-1.5">Alamat</h4>
                    <p class="text-sm text-slate-700">{user.address || "Alamat belum diisi"}</p>
                </div>
            </div>

            <!-- System Info -->
            <div class="card p-6 animate-slide-up">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Info Sistem</h3>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-500">Versi</span>
                        <span class="font-tabular text-sm font-medium text-slate-900">v1.0.0</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-500">Last Login</span>
                        <span class="text-sm font-medium text-slate-900">Hari ini</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-500">Status</span>
                        <span class="badge badge-success">Online</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
