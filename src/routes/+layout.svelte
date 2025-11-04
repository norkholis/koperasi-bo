<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import NotificationToast from "$lib/components/NotificationToast.svelte";
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<!-- Global Notification System -->
<NotificationToast />
