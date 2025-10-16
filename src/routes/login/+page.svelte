<script lang="ts">
  import { enhance } from "$app/forms";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  export let form; // dari form action
  $: if (browser && form?.token) {
    localStorage.setItem("token", form.token);
    goto("/dashboard");
  }
</script>

<svelte:head><title>Login Backoffice</title></svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
  <form method="POST" use:enhance class="bg-white p-6 rounded shadow-md w-96">
    <h1 class="text-xl font-semibold mb-4">Backoffice Login</h1>
    {#if form?.error}
      <p class="text-red-600 mb-2">{form.error}</p>
    {/if}
    <label class="block mb-2"
      >Email
      <input
        name="email"
        type="email"
        required
        class="w-full border px-3 py-2 rounded"
      />
    </label>
    <label class="block mb-4"
      >Password
      <input
        name="password"
        type="password"
        required
        class="w-full border px-3 py-2 rounded"
      />
    </label>
    <button class="w-full bg-blue-600 text-white py-2 rounded">Masuk</button>
    <p class="text-sm text-center mt-4">
      Belum punya akun?
      <a href="/register" class="text-indigo-600">Daftar baru</a>
    </p>
  </form>
</div>
