<script lang="ts">
    import { page } from "$app/stores";
    export let data;
    $: user = data.user;
    console.log(data.user.role.name);
    console.log("Here 123");
    console.log("uyy");
</script>

<nav class="bg-indigo-700 text-white p-4 flex justify-between">
    <span>Koperasi Backoffice</span>
    <span>{data.user.email} | {data.user.role.name}</span>
</nav>

<main class="p-6">
    {#if data.user.role.name === "super_admin"}
        <a href="/dashboard/super" class="btn">Super Dashboard</a>
        <a href="/dashboard/users" class="btn ml-2">Kelola User</a>
    {:else if data.user.role.name === "admin"}
        <a href="/dashboard/admin" class="btn">Admin Dashboard</a>
    {/if}
    <hr class="my-4" />
    <slot />
</main>

<style>
    .btn {
        background-color: white;
        color: #3730a3; /* Tailwind's indigo-700 */
        padding-left: 0.75rem;
        padding-right: 0.75rem;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
        border-radius: 0.25rem;
    }
    .ml-2 {
        margin-left: 0.5rem;
    }
</style>
