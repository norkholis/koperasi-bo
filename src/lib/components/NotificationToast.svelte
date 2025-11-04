<script lang="ts">
    import {
        notifications,
        removeNotification,
    } from "$lib/stores/notifications";
    import { fly } from "svelte/transition";

    function getIconForType(type: string) {
        switch (type) {
            case "success":
                return "✅";
            case "error":
                return "❌";
            case "warning":
                return "⚠️";
            case "info":
                return "ℹ️";
            default:
                return "ℹ️";
        }
    }

    function getColorClasses(type: string) {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200 text-green-800";
            case "error":
                return "bg-red-50 border-red-200 text-red-800";
            case "warning":
                return "bg-yellow-50 border-yellow-200 text-yellow-800";
            case "info":
                return "bg-blue-50 border-blue-200 text-blue-800";
            default:
                return "bg-gray-50 border-gray-200 text-gray-800";
        }
    }
</script>

{#if $notifications.length > 0}
    <div class="fixed top-4 right-4 z-50 space-y-2">
        {#each $notifications as notification (notification.id)}
            <div
                class="max-w-sm rounded-lg border p-4 shadow-lg {getColorClasses(
                    notification.type,
                )}"
                transition:fly={{ x: 300, duration: 300 }}
            >
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <span class="text-lg"
                            >{getIconForType(notification.type)}</span
                        >
                    </div>
                    <div class="ml-3 flex-1">
                        {#if notification.title}
                            <h3 class="text-sm font-medium mb-1">
                                {notification.title}
                            </h3>
                        {/if}
                        <p class="text-sm">
                            {notification.message}
                        </p>
                    </div>
                    {#if notification.dismissible}
                        <div class="ml-4 flex-shrink-0">
                            <button
                                type="button"
                                class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                on:click={() =>
                                    removeNotification(notification.id)}
                            >
                                <span class="sr-only">Close</span>
                                <svg
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
{/if}
