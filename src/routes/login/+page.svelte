<script lang="ts">
  import { enhance } from "$app/forms";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  export let form; // dari form action

  // Check if user is already logged in when component mounts
  onMount(() => {
    if (browser) {
      // Check both localStorage and cookie
      const tokenFromStorage = localStorage.getItem("token");
      const tokenFromCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (tokenFromStorage || tokenFromCookie) {
        // Sync tokens if they exist
        if (tokenFromStorage && !tokenFromCookie) {
          // Set cookie from localStorage
          document.cookie = `token=${tokenFromStorage}; path=/; max-age=${60 * 60 * 24}`;
        } else if (tokenFromCookie && !tokenFromStorage) {
          // Set localStorage from cookie
          localStorage.setItem("token", tokenFromCookie);
        }
        goto("/dashboard");
      }
    }
  });

  $: if (browser && form?.token) {
    // Sync both localStorage and cookie when login is successful
    localStorage.setItem("token", form.token);
    // Cookie should already be set by server, but ensure it's there
    document.cookie = `token=${form.token}; path=/; max-age=${60 * 60 * 24}`;
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
