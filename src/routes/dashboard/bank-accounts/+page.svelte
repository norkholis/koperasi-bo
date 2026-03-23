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

<div class="p-4 sm:p-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800">Kelola Rekening Bank</h1>
            <p class="text-sm text-slate-500 mt-1">
                Kelola rekening tujuan untuk transfer top-up dan pembayaran
            </p>
        </div>
        <button
            on:click={openCreateModal}
            class="btn btn-primary mt-3 sm:mt-0"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Tambah Rekening
        </button>
    </div>

    <!-- Error Message -->
    {#if data.error}
        <div class="alert alert-danger mb-5 animate-slide-up">
            <svg class="h-5 w-5 flex-shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="font-medium flex-1">{data.error}</p>
        </div>
    {/if}

    <!-- Desktop Table View -->
    <div class="hidden md:block table-container">
        <table>
            <thead>
                <tr>
                    <th>Bank</th>
                    <th>Nomor Rekening</th>
                    <th>Nama Pemilik</th>
                    <th>Deskripsi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                {#each bankAccounts as account}
                    <tr class="stagger-item">
                        <td>
                            <span class="font-semibold text-slate-800">{account.bank_name}</span>
                        </td>
                        <td>
                            <span class="font-tabular">{account.account_number}</span>
                        </td>
                        <td>{account.account_holder_name || account.account_name || "\u2014"}</td>
                        <td>
                            <span class="text-slate-500">{account.description || "\u2014"}</span>
                        </td>
                        <td>
                            <span class="badge {account.is_active ? 'badge-success' : 'badge-danger'}">
                                {getStatusText(account.is_active)}
                            </span>
                        </td>
                        <td>
                            <div class="flex items-center gap-1">
                                <button
                                    on:click={() => openEditModal(account)}
                                    class="btn btn-ghost btn-sm"
                                    title="Edit rekening"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    on:click={() => openDeleteModal(account)}
                                    class="btn btn-ghost btn-sm"
                                    title="Hapus rekening"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="6">
                            <div class="empty-state">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <p class="font-medium text-slate-500">Belum Ada Rekening</p>
                                <p class="text-sm text-slate-400">Mulai dengan menambahkan rekening bank pertama</p>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-3">
        {#each bankAccounts as account}
            <div class="card card-interactive p-4 stagger-item">
                <div class="flex items-start justify-between mb-3">
                    <div class="min-w-0 flex-1">
                        <p class="font-semibold text-slate-800 truncate">{account.bank_name}</p>
                        <p class="text-sm text-slate-500 font-tabular">{account.account_number}</p>
                    </div>
                    <span class="badge ml-2 flex-shrink-0 {account.is_active ? 'badge-success' : 'badge-danger'}">
                        {getStatusText(account.is_active)}
                    </span>
                </div>
                <div class="mb-3 space-y-1">
                    <p class="text-sm text-slate-600">
                        <span class="text-slate-400">Pemilik:</span>
                        {account.account_holder_name || account.account_name || "\u2014"}
                    </p>
                    {#if account.description}
                        <p class="text-sm text-slate-400 truncate">{account.description}</p>
                    {/if}
                </div>
                <div class="flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
                    <button
                        on:click={() => openEditModal(account)}
                        class="btn btn-ghost btn-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        on:click={() => openDeleteModal(account)}
                        class="btn btn-ghost btn-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        Hapus
                    </button>
                </div>
            </div>
        {:else}
            <div class="card p-8">
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p class="font-medium text-slate-500">Belum Ada Rekening</p>
                    <p class="text-sm text-slate-400">Mulai dengan menambahkan rekening bank pertama</p>
                </div>
            </div>
        {/each}
    </div>
</div>

<!-- Create Drawer -->
{#if showCreateModal}
    <div
        class="drawer-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-drawer-title"
        tabindex="-1"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
    </div>
    <div
        class="drawer-panel"
        role="document"
        on:click|stopPropagation
    >
        <div class="drawer-header">
            <h3 id="create-drawer-title" class="text-lg font-semibold text-slate-900">
                Tambah Rekening Bank
            </h3>
            <button
                type="button"
                on:click={closeModals}
                class="btn btn-ghost btn-icon btn-sm"
                aria-label="Tutup drawer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>

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
        >
            <div class="drawer-body space-y-5">
                <div>
                    <label for="create-bank-name" class="input-label">Nama Bank *</label>
                    <input
                        type="text"
                        id="create-bank-name"
                        name="bank_name"
                        bind:value={formData.bank_name}
                        required
                        class="input"
                        placeholder="Bank BCA"
                    />
                </div>

                <div>
                    <label for="create-account-number" class="input-label">Nomor Rekening *</label>
                    <input
                        type="text"
                        id="create-account-number"
                        name="account_number"
                        bind:value={formData.account_number}
                        required
                        class="input font-tabular"
                        placeholder="1234567890"
                    />
                </div>

                <div>
                    <label for="create-account-name" class="input-label">Nama Pemilik Rekening *</label>
                    <input
                        type="text"
                        id="create-account-name"
                        name="account_name"
                        bind:value={formData.account_name}
                        required
                        class="input"
                        placeholder="Koperasi Savings"
                    />
                </div>

                <div>
                    <label for="create-description" class="input-label">Deskripsi</label>
                    <textarea
                        id="create-description"
                        name="description"
                        bind:value={formData.description}
                        rows="3"
                        class="input"
                        placeholder="Untuk top-up simpanan..."
                    ></textarea>
                </div>

                <div class="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="create-is-active"
                        name="is_active"
                        bind:checked={formData.is_active}
                        value="true"
                        class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label for="create-is-active" class="text-sm text-slate-700">
                        Rekening Aktif
                    </label>
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
                    class="btn btn-primary"
                >
                    Simpan
                </button>
            </div>
        </form>
    </div>
{/if}

<!-- Edit Drawer -->
{#if showEditModal && selectedBankAccount}
    <div
        class="drawer-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-drawer-title"
        tabindex="-1"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
    </div>
    <div
        class="drawer-panel"
        role="document"
        on:click|stopPropagation
    >
        <div class="drawer-header">
            <h3 id="edit-drawer-title" class="text-lg font-semibold text-slate-900">
                Edit Rekening Bank
            </h3>
            <button
                type="button"
                on:click={closeModals}
                class="btn btn-ghost btn-icon btn-sm"
                aria-label="Tutup drawer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>

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
        >
            <input
                type="hidden"
                name="id"
                value={selectedBankAccount.id || selectedBankAccount.ID}
            />

            <div class="drawer-body space-y-5">
                <div>
                    <label for="edit-bank-name" class="input-label">Nama Bank *</label>
                    <input
                        type="text"
                        id="edit-bank-name"
                        name="bank_name"
                        bind:value={formData.bank_name}
                        required
                        class="input"
                    />
                </div>

                <div>
                    <label for="edit-account-number" class="input-label">Nomor Rekening *</label>
                    <input
                        type="text"
                        id="edit-account-number"
                        name="account_number"
                        bind:value={formData.account_number}
                        required
                        class="input font-tabular"
                    />
                </div>

                <div>
                    <label for="edit-account-name" class="input-label">Nama Pemilik Rekening *</label>
                    <input
                        type="text"
                        id="edit-account-name"
                        name="account_name"
                        bind:value={formData.account_name}
                        required
                        class="input"
                    />
                </div>

                <div>
                    <label for="edit-description" class="input-label">Deskripsi</label>
                    <textarea
                        id="edit-description"
                        name="description"
                        bind:value={formData.description}
                        rows="3"
                        class="input"
                    ></textarea>
                </div>

                <div class="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="edit-is-active"
                        name="is_active"
                        bind:checked={formData.is_active}
                        value="true"
                        class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label for="edit-is-active" class="text-sm text-slate-700">
                        Rekening Aktif
                    </label>
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
                    class="btn btn-primary"
                >
                    Perbarui
                </button>
            </div>
        </form>
    </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && selectedBankAccount}
    <div
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        tabindex="-1"
        on:click={closeModals}
        on:keydown={(e) => e.key === "Escape" && closeModals()}
    >
        <div
            class="modal-panel"
            role="document"
            on:click|stopPropagation
        >
            <div class="modal-header">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <h3 id="delete-modal-title" class="text-lg font-semibold text-slate-900">
                        Hapus Rekening Bank
                    </h3>
                </div>
            </div>
            <div class="modal-body">
                <p class="text-slate-600">
                    Apakah Anda yakin ingin menghapus rekening bank <strong class="text-slate-800"
                        >{selectedBankAccount.bank_name} - <span class="font-tabular">{selectedBankAccount.account_number}</span></strong
                    >? Tindakan ini tidak dapat dibatalkan.
                </p>
            </div>
            <div class="modal-footer">
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

                    <div class="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            on:click={closeModals}
                            class="btn btn-secondary"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            class="btn btn-danger"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            Hapus
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}
