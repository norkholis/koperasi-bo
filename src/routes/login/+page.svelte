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

<svelte:head><title>Login - Koperasi Backoffice</title></svelte:head>

<div class="min-h-screen flex">
  <!-- Left Panel - Branding -->
  <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900">
    <!-- Decorative pattern -->
    <div class="absolute inset-0 opacity-10">
      <svg class="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
    <!-- Decorative circles -->
    <div class="absolute -top-20 -left-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col justify-center px-16">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
          <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="text-white text-2xl font-bold tracking-tight">Koperasi</span>
      </div>

      <h1 class="text-4xl font-bold text-white leading-tight mb-4">
        Kelola Koperasi<br />Anda dengan Mudah
      </h1>
      <p class="text-teal-200 text-lg max-w-md leading-relaxed">
        Platform manajemen koperasi modern untuk simpanan, pinjaman, dan pelaporan keuangan.
      </p>

      <!-- Feature pills -->
      <div class="flex flex-wrap gap-2 mt-8">
        <span class="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-teal-100 border border-white/10">Simpanan Wadiah</span>
        <span class="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-teal-100 border border-white/10">Manajemen Pinjaman</span>
        <span class="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-teal-100 border border-white/10">Laporan SHU</span>
      </div>
    </div>
  </div>

  <!-- Right Panel - Login Form -->
  <div class="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
    <div class="w-full max-w-md">
      <!-- Mobile logo -->
      <div class="lg:hidden flex items-center gap-3 mb-10">
        <div class="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="text-slate-900 text-xl font-bold">Koperasi</span>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-bold text-slate-900">Selamat Datang</h2>
        <p class="text-slate-500 mt-2">Masuk ke akun backoffice Anda</p>
      </div>

      {#if form?.error}
        <div class="alert alert-danger mb-6">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{form.error}</span>
        </div>
      {/if}

      <form method="POST" use:enhance class="space-y-5">
        <div>
          <label for="email" class="input-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nama@email.com"
            class="input"
          />
        </div>

        <div>
          <label for="password" class="input-label">Password</label>
          <div class="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Masukkan password"
              class="input pr-11"
            />
            <button
              type="button"
              on:click={() => (showPassword = !showPassword)}
              class="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {#if showPassword}
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              {:else}
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-full btn-lg">
          Masuk
        </button>
      </form>
    </div>
  </div>
</div>
