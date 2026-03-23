<script lang="ts">
    export let data;
    const user = data.user;
</script>

<div class="space-y-8">
    <!-- Header -->
    <div class="animate-fade-in">
        <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-slate-900">Dashboard Member</h1>
            <span class="badge badge-success">Member</span>
        </div>
        <p class="text-slate-500">Selamat datang, {user.full_name || user.email}!</p>
    </div>

    <!-- Quick Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Profile Card -->
        <a href="/dashboard/profile" class="card card-interactive p-5 stagger-item block group">
            <div class="flex items-start justify-between mb-4">
                <div class="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                    <svg class="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <svg class="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
            </div>
            <h3 class="font-semibold text-slate-900 mb-0.5">Profile Saya</h3>
            <p class="text-sm text-slate-500">Kelola informasi pribadi</p>
        </a>

        <!-- Account Status -->
        <div class="card p-5 stagger-item">
            <div class="flex items-start justify-between mb-4">
                <div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <h3 class="font-semibold text-slate-900 mb-3">Status Akun</h3>
            <div class="space-y-2.5">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-slate-500">Email</span>
                    <span class="text-sm font-medium text-slate-900 truncate ml-4">{user.email}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-slate-500">Role</span>
                    <span class="badge badge-success">Member</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-slate-500">Status</span>
                    <span class="badge badge-success">Aktif</span>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="card p-5 stagger-item">
            <div class="flex items-start justify-between mb-4">
                <div class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                </div>
            </div>
            <h3 class="font-semibold text-slate-900 mb-3">Aksi Cepat</h3>
            <a href="/dashboard/profile" class="btn btn-secondary w-full btn-sm">
                Edit Profile
            </a>
        </div>
    </div>

    <!-- Member Information -->
    <div class="card p-6 animate-slide-up">
        <h2 class="text-lg font-semibold text-slate-900 mb-5">Informasi Member</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Detail Akun</h3>
                <dl class="space-y-4">
                    <div class="flex justify-between items-center">
                        <dt class="text-sm text-slate-500">ID Member</dt>
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
                <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Alamat</h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                    {user.address || "Alamat belum diisi. Silakan lengkapi profil Anda."}
                </p>

                {#if !user.full_name || !user.phone || !user.address}
                    <div class="alert alert-warning mt-5">
                        <svg class="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div>
                            <p class="font-medium">Profil Belum Lengkap</p>
                            <p class="text-sm mt-1 opacity-80">Mohon lengkapi informasi profil Anda untuk pengalaman yang lebih baik.</p>
                            <a href="/dashboard/profile" class="text-sm font-semibold mt-2 inline-block hover:underline">
                                Lengkapi Profil &rarr;
                            </a>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
