<script lang="ts">
    import { onMount } from "svelte";
    export let message: string;
    export let duration = 3000;
    onMount(() => setTimeout(() => (message = ""), duration));
</script>

{#if message}
    <div
        class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow"
    >
        {message}
    </div>
{/if}
