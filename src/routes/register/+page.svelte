<script lang="ts">
    import { enhance } from "$app/forms";
    export let form; // dari action
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
            <input
                name="password"
                type="password"
                required
                class="w-full border px-3 py-2 rounded"
            />
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
