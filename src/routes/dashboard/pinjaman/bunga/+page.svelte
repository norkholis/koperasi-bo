<script lang="ts">
    import type {
        BungaOption,
        BungaOptionRequest,
        BungaOptionStatusRequest,
    } from "$lib/types";
    import { invalidateAll } from "$app/navigation";
    import axios from "$lib/api";
    import { onMount } from "svelte";
    import {
        showSuccess,
        showError,
        showWarning,
    } from "$lib/stores/notifications";

    export let data;

    let bungaOptions: BungaOption[] = data.bungaOptions || [];
    const currentUser = data.currentUser;
    const canManageBunga = data.canManageBunga || false;

    // Modal states
    let showCreateModal = false;
    let showEditModal = false;
    let selectedBunga: BungaOption | null = null;

    // Form data
    let createForm: BungaOptionRequest = {
        nama: "",
        persen: 0,
        deskripsi: "",
    };

    let editForm: BungaOptionRequest = {
        nama: "",
        persen: 0,
        deskripsi: "",
    };

    // Loading states
    let isLoading = false;
    let isSubmitting = false;

    onMount(() => {
        console.log("🔍 Component mounted with data:", {
            currentUser,
            canManageBunga,
            bungaOptionsCount: bungaOptions.length,
        });

        // Check authentication status
        console.log("🔐 Checking auth status...");
        const tokenFromStorage =
            typeof localStorage !== "undefined"
                ? localStorage.getItem("token")
                : null;
        const tokenFromCookie =
            typeof document !== "undefined"
                ? document.cookie
                      .split("; ")
                      .find((row) => row.startsWith("token="))
                      ?.split("=")[1]
                : null;

        console.log(
            "🔑 Token from localStorage:",
            tokenFromStorage
                ? `EXISTS (${tokenFromStorage.substring(0, 20)}...)`
                : "NULL",
        );
        console.log(
            "🔑 Token from cookie:",
            tokenFromCookie
                ? `EXISTS (${tokenFromCookie.substring(0, 20)}...)`
                : "NULL",
        );
        console.log("🍪 All cookies:", document.cookie);

        // Also check for other possible token names
        const authToken =
            typeof localStorage !== "undefined"
                ? localStorage.getItem("auth_token")
                : null;
        const userInfo =
            typeof localStorage !== "undefined"
                ? localStorage.getItem("user_info")
                : null;
        console.log(
            "🔑 Alternative auth_token:",
            authToken ? "EXISTS" : "NULL",
        );
        console.log("👤 User info:", userInfo ? "EXISTS" : "NULL");

        loadBungaOptions();
    });

    async function loadBungaOptions() {
        try {
            isLoading = true;
            console.log("🔍 Loading bunga options...");

            const response = await axios.get("/bunga-options");
            console.log("✅ Raw API response:", response.data);

            // Transform the data to match our interface
            const rawData = response.data.data || [];
            console.log("📊 Raw data from API:", rawData);

            // Map API response fields to our interface
            bungaOptions = rawData.map((item: any) => ({
                id: item.ID,
                nama: item.nama,
                persen: item.persen,
                deskripsi: item.deskripsi,
                is_active: item.is_active,
                created_by: item.created_by,
                created_by_user: item.created_by_user
                    ? {
                          id: item.created_by_user.ID,
                          name:
                              item.created_by_user.Name ||
                              item.created_by_user.Email,
                          email: item.created_by_user.Email,
                      }
                    : undefined,
                created_at: item.CreatedAt,
                updated_at: item.UpdatedAt,
            }));

            console.log("🔄 Transformed bunga options:", bungaOptions);
        } catch (error: any) {
            console.error("❌ Error loading bunga options:", error);
            console.error("Full error details:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url,
            });

            // Handle authentication errors specifically
            if (error.response?.status === 401) {
                showError("Session expired. Please login again.");
                // Redirect to login page
                window.location.href = "/login";
                return;
            }

            showError(
                `Gagal memuat daftar bunga: ${error.response?.data?.message || error.message}`,
            );
        } finally {
            isLoading = false;
        }
    }

    async function testAuth() {
        try {
            console.log("🧪 Testing authentication...");
            const response = await axios.get("/me");
            console.log("✅ Auth test successful:", response.data);
            return true;
        } catch (error: any) {
            console.error(
                "❌ Auth test failed:",
                error.response?.status,
                error.response?.data,
            );
            return false;
        }
    }

    async function createBungaOption() {
        if (!createForm.nama.trim() || createForm.persen <= 0) {
            showWarning("Silakan lengkapi semua field dengan benar");
            return;
        }

        try {
            isSubmitting = true;
            console.log("📝 Creating bunga option:", createForm);

            // Debug: Check token right before making the request
            const tokenFromStorage = localStorage.getItem("token");
            const tokenFromCookie = document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1];
            console.log("🔍 Token status before create request:");
            console.log(
                "  - localStorage:",
                tokenFromStorage
                    ? `${tokenFromStorage.substring(0, 20)}...`
                    : "NULL",
            );
            console.log(
                "  - cookie:",
                tokenFromCookie
                    ? `${tokenFromCookie.substring(0, 20)}...`
                    : "NULL",
            );

            // Debug: Check what axios will use
            console.log("🔧 Axios default config:");
            console.log("  - baseURL:", axios.defaults.baseURL);
            console.log("  - common headers:", axios.defaults.headers.common);
            console.log("  - post headers:", axios.defaults.headers.post);

            // Let's compare what headers will be sent for GET vs POST
            console.log("🔄 Testing headers comparison:");

            // Test GET request headers
            try {
                const getConfig = axios.getUri({
                    method: "get",
                    url: "/bunga-options",
                });
                console.log("GET request would use URL:", getConfig);

                // Get the actual headers that would be sent
                const getHeaders = {
                    ...axios.defaults.headers.common,
                    ...axios.defaults.headers.get,
                };
                console.log("GET headers:", getHeaders);
            } catch (e) {
                console.log("Could not construct GET config:", e);
            }

            // Test POST request headers
            try {
                const postHeaders = {
                    ...axios.defaults.headers.common,
                    ...axios.defaults.headers.post,
                    "Content-Type": "application/json",
                };
                console.log("POST headers:", postHeaders);
            } catch (e) {
                console.log("Could not construct POST headers:", e);
            }

            // Actually make a test GET request to compare
            console.log("🧪 Making test GET request first...");
            const testGet = await axios.get("/bunga-options");
            console.log("✅ Test GET successful with status:", testGet.status);

            console.log("🚀 Now making POST request...");
            const response = await axios.post("/bunga-options", createForm);
            console.log("✅ Raw POST response:", response.data);

            // Check if we need to transform the response
            if (response.data.data) {
                console.log("📊 POST response data:", response.data.data);
            }

            showSuccess("Bunga berhasil ditambahkan!");

            // Reset form and close modal
            createForm = { nama: "", persen: 0, deskripsi: "" };
            showCreateModal = false;

            // Reload data
            await loadBungaOptions();
        } catch (error: any) {
            console.error("❌ Error creating bunga option:", error);
            console.error("Full error details:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                requestData: error.config?.data,
            });

            // Handle authentication errors specifically
            if (error.response?.status === 401) {
                console.error("🚨 401 Error Details:");
                console.error("  - Request URL:", error.config?.url);
                console.error("  - Request Method:", error.config?.method);
                console.error("  - Request Headers:", error.config?.headers);
                console.error("  - Request Data:", error.config?.data);
                console.error("  - Response Headers:", error.response?.headers);

                showError(
                    "Authentication failed for create request. Check console for details.",
                );
                // Don't redirect immediately, let's see the full error first
                // window.location.href = '/login';
                return;
            }

            showError(
                `Gagal menambahkan bunga: ${error.response?.data?.message || error.message}`,
            );
        } finally {
            isSubmitting = false;
        }
    }

    async function updateBungaOption() {
        if (!selectedBunga || !editForm.nama.trim() || editForm.persen <= 0) {
            showWarning("Silakan lengkapi semua field dengan benar");
            return;
        }

        try {
            isSubmitting = true;
            console.log(
                "📝 Updating bunga option:",
                selectedBunga.id,
                editForm,
            );

            const response = await axios.put(
                `/bunga-options/${selectedBunga.id}`,
                editForm,
            );
            console.log("✅ Bunga option updated:", response.data);

            showSuccess("Bunga berhasil diperbarui!");

            // Close modal
            showEditModal = false;
            selectedBunga = null;

            // Reload data
            await loadBungaOptions();
        } catch (error: any) {
            console.error("❌ Error updating bunga option:", error);
            showError(
                `Gagal memperbarui bunga: ${error.response?.data?.message || error.message}`,
            );
        } finally {
            isSubmitting = false;
        }
    }

    async function toggleBungaStatus(bunga: BungaOption) {
        try {
            console.log(
                "🔄 Toggling bunga status:",
                bunga.id,
                !bunga.is_active,
            );

            const statusRequest: BungaOptionStatusRequest = {
                is_active: !bunga.is_active,
            };

            const response = await axios.put(
                `/bunga-options/${bunga.id}/status`,
                statusRequest,
            );
            console.log("✅ Bunga status updated:", response.data);

            const statusText = !bunga.is_active
                ? "diaktifkan"
                : "dinonaktifkan";
            showSuccess(`Bunga "${bunga.nama}" berhasil ${statusText}!`);

            // Reload data
            await loadBungaOptions();
        } catch (error: any) {
            console.error("❌ Error toggling bunga status:", error);
            showError(
                `Gagal mengubah status bunga: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    async function deleteBungaOption(bunga: BungaOption) {
        if (
            !confirm(`Apakah Anda yakin ingin menghapus bunga "${bunga.nama}"?`)
        ) {
            return;
        }

        try {
            console.log("🗑️ Deleting bunga option:", bunga.id);

            await axios.delete(`/bunga-options/${bunga.id}`);
            console.log("✅ Bunga option deleted");

            showSuccess(`Bunga "${bunga.nama}" berhasil dihapus!`);

            // Reload data
            await loadBungaOptions();
        } catch (error: any) {
            console.error("❌ Error deleting bunga option:", error);
            showError(
                `Gagal menghapus bunga: ${error.response?.data?.message || error.message}`,
            );
        }
    }

    function openCreateModal() {
        console.log("🚀 Opening create modal...");
        try {
            createForm = { nama: "", persen: 0, deskripsi: "" };
            showCreateModal = true;
            console.log("✅ Create modal state:", showCreateModal);
            // Force a small delay to see if it helps with rendering
            setTimeout(() => {
                console.log("⏰ Modal should be visible now");
                const modalEl = document.querySelector(".fixed.inset-0.z-50");
                console.log("🔍 Modal element found:", modalEl);
            }, 100);
        } catch (error) {
            console.error("❌ Error in openCreateModal:", error);
        }
    }

    function openEditModal(bunga: BungaOption) {
        console.log("🔧 Opening edit modal for bunga:", bunga);
        try {
            selectedBunga = bunga;
            editForm = {
                nama: bunga.nama,
                persen: bunga.persen,
                deskripsi: bunga.deskripsi,
            };
            console.log("📝 Edit form populated:", editForm);
            showEditModal = true;
            console.log("✅ Edit modal state:", showEditModal);
            console.log("👤 Selected bunga:", selectedBunga);

            // Force a small delay to check if modal renders
            setTimeout(() => {
                console.log("⏰ Edit modal should be visible now");
                const modalEl = document.querySelector(".fixed.inset-0.z-50");
                console.log("🔍 Edit modal element found:", modalEl);
            }, 100);
        } catch (error) {
            console.error("❌ Error in openEditModal:", error);
        }
    }

    function closeModals() {
        showCreateModal = false;
        showEditModal = false;
        selectedBunga = null;
    }

    function formatPercentage(value: number): string {
        return `${value}%`;
    }

    function formatCurrency(value: number): string {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    }
</script>

<svelte:head>
    <title>Manajemen Bunga - Koperasi Backoffice</title>
</svelte:head>

<div class="animate-fade-in">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Manajemen Ujrah</h1>
            <p class="text-slate-500 mt-1 text-sm">
                Kelola opsi ujrah untuk pembiayaan anggota
            </p>
        </div>

        {#if canManageBunga}
            <button
                on:click={openCreateModal}
                class="btn btn-primary"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tambah Ujrah
            </button>
        {/if}
    </div>

    {#if isLoading}
        <!-- Loading State -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {#each [1, 2, 3] as _}
                <div class="card p-6">
                    <div class="skeleton h-4 w-24 mb-4"></div>
                    <div class="skeleton h-8 w-16 mb-3"></div>
                    <div class="skeleton h-3 w-full mb-2"></div>
                    <div class="skeleton h-3 w-2/3"></div>
                </div>
            {/each}
        </div>
    {:else if bungaOptions.length === 0}
        <!-- Empty State -->
        <div class="card p-12 text-center">
            <div class="mx-auto w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-1">
                Belum ada ujrah
            </h3>
            <p class="text-slate-500 text-sm mb-6">
                Tambahkan opsi ujrah pertama untuk memulai
            </p>
            {#if canManageBunga}
                <button
                    on:click={openCreateModal}
                    class="btn btn-primary"
                >
                    Tambah Ujrah Pertama
                </button>
            {/if}
        </div>
    {:else}
        <!-- Interest Rate Card Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {#each bungaOptions as bunga (bunga.id)}
                <div class="card card-interactive stagger-item p-6 flex flex-col">
                    <!-- Card Top: Name + Badge -->
                    <div class="flex items-start justify-between mb-4">
                        <h3 class="text-sm font-semibold text-slate-900 leading-tight">
                            {bunga.nama}
                        </h3>
                        <span class="badge {bunga.is_active ? 'badge-success' : 'badge-danger'}">
                            {bunga.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                    </div>

                    <!-- Percentage Display -->
                    <div class="mb-4">
                        <span class="font-tabular text-3xl font-bold text-teal-700">
                            {formatPercentage(bunga.persen)}
                        </span>
                        <span class="text-slate-400 text-xs ml-1">per bulan</span>
                    </div>

                    <!-- Description -->
                    <p class="text-sm text-slate-500 mb-5 line-clamp-2 flex-1">
                        {bunga.deskripsi || "Tidak ada deskripsi"}
                    </p>

                    <!-- Card Footer: Meta + Actions -->
                    <div class="pt-4 border-t border-slate-100">
                        <div class="flex items-center justify-between">
                            <div class="text-xs text-slate-400">
                                <span>{bunga.created_by_user?.name || `ID: ${bunga.created_by}`}</span>
                                <span class="mx-1">&middot;</span>
                                <span>{new Date(bunga.created_at).toLocaleDateString("id-ID")}</span>
                            </div>

                            {#if canManageBunga}
                                <div class="flex items-center gap-1">
                                    <button
                                        on:click={() => openEditModal(bunga)}
                                        class="btn btn-ghost btn-sm"
                                        title="Edit"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        on:click={() => toggleBungaStatus(bunga)}
                                        class="btn btn-sm {bunga.is_active ? 'btn-ghost text-amber-600 hover:bg-amber-50' : 'btn-ghost text-teal-600 hover:bg-teal-50'}"
                                        title={bunga.is_active ? "Nonaktifkan" : "Aktifkan"}
                                    >
                                        {#if bunga.is_active}
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        {:else}
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        {/if}
                                    </button>
                                    <button
                                        on:click={() => deleteBungaOption(bunga)}
                                        class="btn btn-ghost btn-sm text-rose-500 hover:bg-rose-50"
                                        title="Hapus"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Create Bunga Drawer -->
{#if showCreateModal}
    <div
        class="drawer-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-drawer-title"
        on:click|self={closeModals}
        on:keydown={(e) => e.key === 'Escape' && closeModals()}
    >
    </div>
    <div class="drawer-panel">
        <div class="drawer-header">
            <h2 id="create-drawer-title" class="text-lg font-semibold text-slate-900">Tambah Ujrah Baru</h2>
            <button on:click={closeModals} class="btn btn-ghost btn-sm" aria-label="Tutup">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <form on:submit|preventDefault={createBungaOption}>
            <div class="drawer-body space-y-5">
                <div>
                    <label for="create-nama" class="input-label">Nama Ujrah *</label>
                    <input
                        id="create-nama"
                        type="text"
                        bind:value={createForm.nama}
                        required
                        class="input"
                        placeholder="e.g., Ujrah Standar"
                    />
                </div>

                <div>
                    <label for="create-persen" class="input-label">Persentase (%) *</label>
                    <input
                        id="create-persen"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        bind:value={createForm.persen}
                        required
                        class="input font-tabular"
                        placeholder="e.g., 1.5"
                    />
                </div>

                <div>
                    <label for="create-deskripsi" class="input-label">Deskripsi</label>
                    <textarea
                        id="create-deskripsi"
                        bind:value={createForm.deskripsi}
                        rows="4"
                        class="input"
                        placeholder="Deskripsi opsional"
                    ></textarea>
                </div>
            </div>

            <div class="drawer-footer">
                <button
                    type="button"
                    on:click={closeModals}
                    class="btn btn-secondary"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    class="btn btn-primary"
                >
                    {#if isSubmitting}
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Menyimpan...
                    {:else}
                        Simpan
                    {/if}
                </button>
            </div>
        </form>
    </div>
{/if}

<!-- Edit Bunga Drawer -->
{#if showEditModal && selectedBunga}
    <div
        class="drawer-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-drawer-title"
        on:click|self={closeModals}
        on:keydown={(e) => e.key === 'Escape' && closeModals()}
    >
    </div>
    <div class="drawer-panel">
        <div class="drawer-header">
            <h2 id="edit-drawer-title" class="text-lg font-semibold text-slate-900">
                Edit Ujrah: {selectedBunga?.nama || "Unknown"}
            </h2>
            <button on:click={closeModals} class="btn btn-ghost btn-sm" aria-label="Tutup">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <form on:submit|preventDefault={updateBungaOption}>
            <div class="drawer-body space-y-5">
                <div>
                    <label for="edit-nama" class="input-label">Nama Ujrah *</label>
                    <input
                        id="edit-nama"
                        type="text"
                        bind:value={editForm.nama}
                        required
                        class="input"
                        placeholder="e.g., Ujrah Standar"
                    />
                </div>

                <div>
                    <label for="edit-persen" class="input-label">Persentase (%) *</label>
                    <input
                        id="edit-persen"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        bind:value={editForm.persen}
                        required
                        class="input font-tabular"
                        placeholder="e.g., 1.5"
                    />
                </div>

                <div>
                    <label for="edit-deskripsi" class="input-label">Deskripsi</label>
                    <textarea
                        id="edit-deskripsi"
                        bind:value={editForm.deskripsi}
                        rows="4"
                        class="input"
                        placeholder="Deskripsi opsional"
                    ></textarea>
                </div>
            </div>

            <div class="drawer-footer">
                <button
                    type="button"
                    on:click={closeModals}
                    class="btn btn-secondary"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    class="btn btn-primary"
                >
                    {#if isSubmitting}
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Menyimpan...
                    {:else}
                        Perbarui
                    {/if}
                </button>
            </div>
        </form>
    </div>
{/if}
