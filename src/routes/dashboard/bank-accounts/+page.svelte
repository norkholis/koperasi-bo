<script lang="ts">
    import type { BankAccount } from "$lib/types";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { showSuccess, showError } from "$lib/stores/notifications";

    export let data;

    let bankAccounts: BankAccount[] = data.bankAccounts || [];
    const currentUser = data.user;

    // Modal states
    let showCreateModal = false;
    let showEditModal = false;
    let showDeleteModal = false;
    let selectedBankAccount: BankAccount | null = null;

    // Form data
    let formData = {
        bank_name: "",
        account_number: "",
        account_name: "",
        description: "",
        is_active: true,
    };

    function openCreateModal() {
        formData = {
            bank_name: "",
            account_number: "",
            account_name: "",
            description: "",
            is_active: true,
        };
        showCreateModal = true;
    }

    function openEditModal(bankAccount: BankAccount) {
        selectedBankAccount = bankAccount;
        formData = {
            bank_name: bankAccount.bank_name,
            account_number: bankAccount.account_number,
            account_name:
                bankAccount.account_holder_name ||
                bankAccount.account_name ||
                "",
            description: bankAccount.description || "",
            is_active: bankAccount.is_active,
        };
        showEditModal = true;
    }

    function openDeleteModal(bankAccount: BankAccount) {
        selectedBankAccount = bankAccount;
        showDeleteModal = true;
    }

    function closeModals() {
        showCreateModal = false;
        showEditModal = false;
        showDeleteModal = false;
        selectedBankAccount = null;
    }

    function getStatusBadge(isActive: boolean) {
        return isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
    }

    function getStatusText(isActive: boolean) {
        return isActive ? "Aktif" : "Nonaktif";
    }
</script>

<svelte:head>
    <title>Kelola Rekening Bank - Koperasi Backoffice</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">
                Kelola Rekening Bank
            </h1>
            <p class="text-gray-600 mt-1">
                Kelola rekening tujuan untuk transfer top-up dan pembayaran
            </p>
        </div>
        <button
            on:click={openCreateModal}
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
            + Tambah Rekening
        </button>
    </div>

    <!-- Error Message -->
    {#if data.error}
        <div
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
        >
            {data.error}
        </div>
    {/if}

    <!-- Bank Accounts Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        {#if bankAccounts.length === 0}
            <div class="text-center py-12">
                <svg
                    class="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">
                    Belum Ada Rekening
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                    Mulai dengan menambahkan rekening bank pertama
                </p>
            </div>
        {:else}
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Bank
                        </th>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Nomor Rekening
                        </th>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Nama Pemilik
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
                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each bankAccounts as account}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">
                                    {account.bank_name}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">
                                    {account.account_number}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">
                                    {account.account_holder_name ||
                                        account.account_name ||
                                        "-"}
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-500">
                                    {account.description || "-"}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span
                                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusBadge(
                                        account.is_active,
                                    )}"
                                >
                                    {getStatusText(account.is_active)}
                                </span>
                            </td>
                            <td
                                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                            >
                                <button
                                    on:click={() => openEditModal(account)}
                                    class="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                    Edit
                                </button>
                                <button
                                    on:click={() => openDeleteModal(account)}
                                    class="text-red-600 hover:text-red-900"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<!-- Create Modal -->
{#if showCreateModal}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            on:click|stopPropagation
        >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Tambah Rekening Bank
            </h3>

            <form
                method="POST"
                action="?/create"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type === "success") {
                            showSuccess("Rekening bank berhasil ditambahkan");
                            closeModals();
                            await invalidateAll();
                        } else if (result.type === "failure") {
                            showError(
                                result.data?.error ||
                                    "Gagal menambahkan rekening",
                            );
                        }
                        await update();
                    };
                }}
                class="space-y-4"
            >
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nama Bank *
                    </label>
                    <input
                        type="text"
                        name="bank_name"
                        bind:value={formData.bank_name}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Bank BCA"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Rekening *
                    </label>
                    <input
                        type="text"
                        name="account_number"
                        bind:value={formData.account_number}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1234567890"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nama Pemilik Rekening *
                    </label>
                    <input
                        type="text"
                        name="account_name"
                        bind:value={formData.account_name}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Koperasi Savings"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                    </label>
                    <textarea
                        name="description"
                        bind:value={formData.description}
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Untuk top-up simpanan..."
                    ></textarea>
                </div>

                <div class="flex items-center">
                    <input
                        type="checkbox"
                        name="is_active"
                        bind:checked={formData.is_active}
                        value="true"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 text-sm text-gray-700">
                        Rekening Aktif
                    </label>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Edit Modal -->
{#if showEditModal && selectedBankAccount}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            on:click|stopPropagation
        >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Edit Rekening Bank
            </h3>

            <form
                method="POST"
                action="?/update"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type === "success") {
                            showSuccess("Rekening bank berhasil diperbarui");
                            closeModals();
                            await invalidateAll();
                        } else if (result.type === "failure") {
                            showError(
                                result.data?.error ||
                                    "Gagal memperbarui rekening",
                            );
                        }
                        await update();
                    };
                }}
                class="space-y-4"
            >
                <input
                    type="hidden"
                    name="id"
                    value={selectedBankAccount.id || selectedBankAccount.ID}
                />

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nama Bank *
                    </label>
                    <input
                        type="text"
                        name="bank_name"
                        bind:value={formData.bank_name}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Rekening *
                    </label>
                    <input
                        type="text"
                        name="account_number"
                        bind:value={formData.account_number}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nama Pemilik Rekening *
                    </label>
                    <input
                        type="text"
                        name="account_name"
                        bind:value={formData.account_name}
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                    </label>
                    <textarea
                        name="description"
                        bind:value={formData.description}
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                <div class="flex items-center">
                    <input
                        type="checkbox"
                        name="is_active"
                        bind:checked={formData.is_active}
                        value="true"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label class="ml-2 text-sm text-gray-700">
                        Rekening Aktif
                    </label>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Perbarui
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Delete Modal -->
{#if showDeleteModal && selectedBankAccount}
    <div
        class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            on:click|stopPropagation
        >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Hapus Rekening Bank
            </h3>

            <p class="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus rekening bank <strong
                    >{selectedBankAccount.bank_name} - {selectedBankAccount.account_number}</strong
                >?
            </p>

            <form
                method="POST"
                action="?/delete"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type === "success") {
                            showSuccess("Rekening bank berhasil dihapus");
                            closeModals();
                            await invalidateAll();
                        } else if (result.type === "failure") {
                            showError(
                                result.data?.error ||
                                    "Gagal menghapus rekening",
                            );
                        }
                        await update();
                    };
                }}
            >
                <input
                    type="hidden"
                    name="id"
                    value={selectedBankAccount.id || selectedBankAccount.ID}
                />

                <div class="flex justify-end gap-3">
                    <button
                        type="button"
                        on:click={closeModals}
                        class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Hapus
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
