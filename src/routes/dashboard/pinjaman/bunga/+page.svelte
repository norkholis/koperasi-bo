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

<div class="container mx-auto px-4 py-8">
    <!-- Debug info -->
    <!-- <div class="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h4>Debug Info:</h4>
        <p>showCreateModal: {showCreateModal}</p>
        <p>showEditModal: {showEditModal}</p>
        <p>selectedBunga: {selectedBunga ? selectedBunga.nama : "null"}</p>
        <p>canManageBunga: {canManageBunga}</p>
        <p>currentUser: {JSON.stringify(currentUser?.role)}</p>
        <p>bungaOptionsCount: {bungaOptions.length}</p>

        <button
            on:click={() => testAuth()}
            class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
            Test Auth
        </button>

        <button
            on:click={() => {
                console.log("🍪 Current cookies:", document.cookie);
                console.log("💾 Current localStorage:", {
                    token: localStorage.getItem("token"),
                    auth_token: localStorage.getItem("auth_token"),
                    user_info: localStorage.getItem("user_info"),
                });
            }}
            class="mt-2 ml-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
            Check Storage
        </button>

        <button
            on:click={() => {
                console.log("🧪 Testing edit modal with first bunga...");
                if (bungaOptions.length > 0) {
                    const firstBunga = bungaOptions[0];
                    console.log("📊 First bunga data:", firstBunga);
                    openEditModal(firstBunga);
                } else {
                    console.log("❌ No bunga options available");
                }
            }}
            class="mt-2 ml-2 px-3 py-1 bg-orange-500 text-white rounded text-sm"
        >
            Test Edit Modal
        </button>
    </div> -->

    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Manajemen Ujrah</h1>
            <p class="text-gray-600 mt-2">
                Kelola opsi ujrah untuk pembiayaan anggota
            </p>
        </div>

        {#if canManageBunga}
            <button
                on:click={openCreateModal}
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                + Tambah Ujrah
            </button>
        {/if}
    </div>

    {#if isLoading}
        <div class="flex justify-center items-center py-12">
            <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            ></div>
            <span class="ml-2 text-gray-600">Memuat data ujrah...</span>
        </div>
    {:else if bungaOptions.length === 0}
        <div class="text-center py-12">
            <div class="text-gray-400 text-6xl mb-4">📊</div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">
                Belum ada ujrah
            </h3>
            <p class="text-gray-600 mb-6">
                Tambahkan opsi ujrah pertama untuk memulai
            </p>
            {#if canManageBunga}
                <button
                    on:click={openCreateModal}
                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    Tambah Ujrah Pertama
                </button>
            {/if}
        </div>
    {:else}
        <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Nama Bunga
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Persentase
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Deskripsi
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Status
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Dibuat Oleh
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Tanggal
                            </th>
                            {#if canManageBunga}
                                <th
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Aksi
                                </th>
                            {/if}
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each bungaOptions as bunga (bunga.id)}
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div
                                        class="text-sm font-medium text-gray-900"
                                    >
                                        {bunga.nama}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div
                                        class="text-sm text-gray-900 font-semibold"
                                    >
                                        {formatPercentage(bunga.persen)}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div
                                        class="text-sm text-gray-600 max-w-xs truncate"
                                    >
                                        {bunga.deskripsi || "-"}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {bunga.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'}"
                                    >
                                        {bunga.is_active ? "Aktif" : "Nonaktif"}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-600">
                                        {bunga.created_by_user?.name ||
                                            `ID: ${bunga.created_by}`}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-600">
                                        {new Date(
                                            bunga.created_at,
                                        ).toLocaleDateString("id-ID")}
                                    </div>
                                </td>
                                {#if canManageBunga}
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                                    >
                                        <div class="flex justify-end space-x-2">
                                            <button
                                                on:click={() =>
                                                    openEditModal(bunga)}
                                                class="text-blue-600 hover:text-blue-900 transition-colors"
                                                title="Edit"
                                            >
                                                <svg
                                                    class="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                on:click={() =>
                                                    toggleBungaStatus(bunga)}
                                                class="{bunga.is_active
                                                    ? 'text-red-600 hover:text-red-900'
                                                    : 'text-green-600 hover:text-green-900'} transition-colors"
                                                title={bunga.is_active
                                                    ? "Nonaktifkan"
                                                    : "Aktifkan"}
                                            >
                                                {#if bunga.is_active}
                                                    <svg
                                                        class="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
                                                        />
                                                    </svg>
                                                {:else}
                                                    <svg
                                                        class="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                {/if}
                                            </button>
                                            <button
                                                on:click={() =>
                                                    deleteBungaOption(bunga)}
                                                class="text-red-600 hover:text-red-900 transition-colors"
                                                title="Hapus"
                                            >
                                                <svg
                                                    class="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</div>

<!-- Create Bunga Modal -->
{#if showCreateModal}
    <div
        class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    >
        <div class="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h2 class="text-xl font-bold mb-4">Tambah Ujrah Baru</h2>

            <form
                on:submit|preventDefault={createBungaOption}
                class="space-y-4"
            >
                <div>
                    <label class="block text-sm font-medium mb-1"
                        >Nama Ujrah *</label
                    >
                    <input
                        type="text"
                        bind:value={createForm.nama}
                        required
                        class="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="e.g., Ujrah Standar"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1"
                        >Persentase (%) *</label
                    >
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        bind:value={createForm.persen}
                        required
                        class="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="e.g., 1.5"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1"
                        >Deskripsi</label
                    >
                    <textarea
                        bind:value={createForm.deskripsi}
                        rows="3"
                        class="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Deskripsi opsional"
                    ></textarea>
                </div>

                <div class="flex gap-2 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                        type="button"
                        on:click={closeModals}
                        class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Edit Bunga Modal -->
{#if showEditModal && selectedBunga}
    <div
        class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    >
        <div class="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h2 class="text-xl font-bold mb-4">
                Edit Ujrah: {selectedBunga?.nama || "Unknown"}
            </h2>

            <!-- Debug info in modal -->
            <!-- <div
                class="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs"
            >
                <strong>Debug - Modal Data:</strong>
                <p>selectedBunga: {JSON.stringify(selectedBunga)}</p>
                <p>editForm: {JSON.stringify(editForm)}</p>
            </div> -->

            <form
                on:submit|preventDefault={updateBungaOption}
                class="space-y-4"
            >
                <div>
                    <label class="block text-sm font-medium mb-1"
                        >Nama Ujrah *</label
                    >
                    <input
                        type="text"
                        bind:value={editForm.nama}
                        required
                        class="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="e.g., Ujrah Standar"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1"
                        >Persentase (%) *</label
                    >
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        bind:value={editForm.persen}
                        required
                        class="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="e.g., 1.5"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1"
                        >Deskripsi</label
                    >
                    <textarea
                        bind:value={editForm.deskripsi}
                        rows="3"
                        class="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Deskripsi opsional"
                    ></textarea>
                </div>

                <div class="flex gap-2 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Menyimpan..." : "Perbarui"}
                    </button>
                    <button
                        type="button"
                        on:click={closeModals}
                        class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
