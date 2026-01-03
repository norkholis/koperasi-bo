<script lang="ts">
    import { enhance } from "$app/forms";
    export let form; // dari action

    let showPassword = false;
</script>

<svelte:head><title>Daftar Backoffice</title></svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
    <form
        method="POST"
        use:enhance
        class="bg-white p-6 rounded shadow-md w-96 space-y-3"
    >
        <h1 class="text-xl font-semibold">Buat Akun Baru</h1>

        {#if form?.error}
            <p class="text-red-600 text-sm">{form.error}</p>
        {/if}

        <label class="block">
            Email
            <input
                name="email"
                type="email"
                value={form?.values?.email ?? ""}
                required
                class="w-full border px-3 py-2 rounded"
            />
        </label>

        <label class="block">
            Password
            <div class="relative">
                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    class="w-full border px-3 py-2 rounded pr-10"
                />
                <button
                    type="button"
                    on:click={() => (showPassword = !showPassword)}
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                    {#if showPassword}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clip-rule="evenodd"
                            />
                            <path
                                d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                            />
                        </svg>
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                                fill-rule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    {/if}
                </button>
            </div>
        </label>

        <label class="block">
            Role
            <select
                name="role_id"
                required
                class="w-full border px-3 py-2 rounded"
            >
                <option value="" disabled selected>Pilih role</option>
                <option value={1} selected={form?.values?.role_id === 1}
                    >Super Admin</option
                >
                <option value={2} selected={form?.values?.role_id === 2}
                    >Admin</option
                >
                <option value={3} selected={form?.values?.role_id === 3}
                    >Member</option
                >
            </select>
        </label>

        <button class="w-full bg-green-600 text-white py-2 rounded"
            >Daftar</button
        >

        <p class="text-sm text-center">
            Sudah punya akun?
            <a href="/login" class="text-indigo-600">Login di sini</a>
        </p>
    </form>
</div>
