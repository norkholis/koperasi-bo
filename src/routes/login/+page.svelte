<script lang="ts">
  import { enhance } from "$app/forms";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  export let form; // dari form action

  let showPassword = false;

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
    <label class="block mb-4">
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
    <button class="w-full bg-blue-600 text-white py-2 rounded">Masuk</button>
    <!-- <p class="text-sm text-center mt-4">
      Belum punya akun?
      <a href="/register" class="text-indigo-600">Daftar baru</a>
    </p> -->
  </form>
</div>
