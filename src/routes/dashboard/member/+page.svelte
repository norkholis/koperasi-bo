<script lang="ts">
    export let data;
    const user = data.user;
</script>

<div class="max-w-4xl mx-auto">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Member</h1>
        <p class="text-gray-600 mt-2">
            Selamat datang, {user.full_name || user.email}!
        </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        Profile Saya
                    </h3>
                    <p class="text-gray-600">Kelola informasi pribadi</p>
                </div>
            </div>
            <a
                href="/dashboard/profile"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
                Lihat Profile
            </a>
        </div>

        <!-- Account Info -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        Status Akun
                    </h3>
                    <p class="text-gray-600">Informasi akun Anda</p>
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Email:</span>
                    <span class="font-medium">{user.email}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Role:</span>
                    <span
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                    >
                        Member
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                    >
                        Aktif
                    </span>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center mb-4">
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
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        Aksi Cepat
                    </h3>
                    <p class="text-gray-600">Tindakan yang tersedia</p>
                </div>
            </div>
            <div class="space-y-2">
                <a
                    href="/dashboard/profile"
                    class="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Edit Profile
                </a>
                <!-- Add more member-specific actions here -->
            </div>
        </div>
    </div>

    <!-- Member Information -->
    <div class="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Informasi Member
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 class="text-lg font-medium text-gray-900 mb-3">
                    Detail Akun
                </h3>
                <dl class="space-y-2">
                    <div class="flex justify-between">
                        <dt class="text-gray-600">ID Member:</dt>
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
                        <dt class="text-gray-600">No. Telepon:</dt>
                        <dd class="font-medium">
                            {user.phone || "Belum diisi"}
                        </dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-gray-600">Terdaftar:</dt>
                        <dd class="font-medium">
                            {new Date(user.created_at).toLocaleDateString(
                                "id-ID",
                            )}
                        </dd>
                    </div>
                </dl>
            </div>

            <div>
                <h3 class="text-lg font-medium text-gray-900 mb-3">Alamat</h3>
                <p class="text-gray-600">
                    {user.address ||
                        "Alamat belum diisi. Silakan lengkapi profil Anda."}
                </p>

                {#if !user.full_name || !user.phone || !user.address}
                    <div
                        class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md"
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
                                    <p>
                                        Mohon lengkapi informasi profil Anda
                                        untuk pengalaman yang lebih baik.
                                    </p>
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
</div>
