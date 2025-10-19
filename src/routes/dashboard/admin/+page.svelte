<script lang="ts">
    export let data;
    const user = data.user;
</script>

<div class="max-w-6xl mx-auto">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p class="text-gray-600 mt-2">
            Selamat datang, {user.full_name || user.email}!
        </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- User Management -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
                <div
                    class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center"
                >
                    <svg
                        class="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                        />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        Kelola User
                    </h3>
                    <p class="text-gray-600 text-sm">Manajemen pengguna</p>
                </div>
            </div>
            <div class="mt-4">
                <a
                    href="/dashboard/users"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Lihat Users
                </a>
            </div>
        </div>

        <!-- Profile Management -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
                <div
                    class="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center"
                >
                    <svg
                        class="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">Profile</h3>
                    <p class="text-gray-600 text-sm">Kelola profile Anda</p>
                </div>
            </div>
            <div class="mt-4">
                <a
                    href="/dashboard/profile"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Edit Profile
                </a>
            </div>
        </div>

        <!-- Reports Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
                <div
                    class="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center"
                >
                    <svg
                        class="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">Laporan</h3>
                    <p class="text-gray-600 text-sm">Statistik & laporan</p>
                </div>
            </div>
            <div class="mt-4">
                <button
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-not-allowed opacity-50"
                    disabled
                >
                    Segera Hadir
                </button>
            </div>
        </div>

        <!-- Settings Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
                <div
                    class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center"
                >
                    <svg
                        class="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        Pengaturan
                    </h3>
                    <p class="text-gray-600 text-sm">Konfigurasi sistem</p>
                </div>
            </div>
            <div class="mt-4">
                <button
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-not-allowed opacity-50"
                    disabled
                >
                    Segera Hadir
                </button>
            </div>
        </div>
    </div>

    <!-- Admin Information -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Account Information -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
                Informasi Akun
            </h2>
            <dl class="space-y-3">
                <div class="flex justify-between">
                    <dt class="text-gray-600">ID Admin:</dt>
                    <dd class="font-medium">#{user.id}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600">Nama Lengkap:</dt>
                    <dd class="font-medium">
                        {user.full_name || "Belum diisi"}
                    </dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600">Email:</dt>
                    <dd class="font-medium">{user.email}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600">Role:</dt>
                    <dd class="font-medium">
                        <span
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                        >
                            Admin
                        </span>
                    </dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600">No. Telepon:</dt>
                    <dd class="font-medium">{user.phone || "Belum diisi"}</dd>
                </div>
                <div class="flex justify-between">
                    <dt class="text-gray-600">Terdaftar:</dt>
                    <dd class="font-medium">
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                    </dd>
                </div>
            </dl>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
            <div class="space-y-3">
                <a
                    href="/dashboard/users/add"
                    class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    + Tambah User Baru
                </a>
                <a
                    href="/dashboard/users"
                    class="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Lihat Semua User
                </a>
                <a
                    href="/dashboard/profile"
                    class="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Edit Profile Saya
                </a>
            </div>

            {#if !user.full_name || !user.phone || !user.address}
                <div
                    class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md"
                >
                    <div class="flex">
                        <svg
                            class="h-5 w-5 text-yellow-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-yellow-800">
                                Profil Belum Lengkap
                            </h3>
                            <div class="mt-2 text-sm text-yellow-700">
                                <p>Mohon lengkapi informasi profil Anda.</p>
                            </div>
                            <div class="mt-3">
                                <a
                                    href="/dashboard/profile"
                                    class="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                                >
                                    Lengkapi Profil →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
