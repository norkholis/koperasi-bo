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

    function getBorderColor(type: string) {
        switch (type) {
            case "success": return "#059669";
            case "error": return "#e11d48";
            case "warning": return "#d97706";
            case "info": return "#0284c7";
            default: return "#94a3b8";
        }
    }

    function getProgressColor(type: string) {
        switch (type) {
            case "success": return "bg-emerald-400";
            case "error": return "bg-rose-400";
            case "warning": return "bg-amber-400";
            case "info": return "bg-sky-400";
            default: return "bg-slate-400";
        }
    }
</script>

{#if $notifications.length > 0}
    <div class="fixed top-4 right-4 z-[100] space-y-2.5 max-w-sm w-full pointer-events-none" style="margin-right: env(safe-area-inset-right, 0);">
        {#each $notifications as notification (notification.id)}
            <div
                class="pointer-events-auto bg-white rounded-xl shadow-lg overflow-hidden animate-scale-in"
                style="border-left: 4px solid {getBorderColor(notification.type)};"
                transition:fly={{ x: 320, duration: 300, opacity: 0 }}
            >
                <div class="flex items-start p-4">
                    <!-- Icon -->
                    <div class="flex-shrink-0 mt-0.5">
                        {#if notification.type === "success"}
                            <svg class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        {:else if notification.type === "error"}
                            <svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        {:else if notification.type === "warning"}
                            <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        {:else}
                            <svg class="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                        {/if}
                    </div>

                    <!-- Content -->
                    <div class="ml-3 flex-1 min-w-0">
                        {#if notification.title}
                            <p class="text-sm font-semibold text-slate-900 mb-0.5">
                                {notification.title}
                            </p>
                        {/if}
                        <p class="text-sm text-slate-600 leading-snug">
                            {notification.message}
                        </p>
                    </div>

                    <!-- Close -->
                    {#if notification.dismissible}
                        <button
                            type="button"
                            class="ml-3 flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            on:click={() => removeNotification(notification.id)}
                        >
                            <span class="sr-only">Close</span>
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    {/if}
                </div>

                <!-- Progress bar -->
                <div class="h-0.5 bg-slate-100">
                    <div
                        class="h-full {getProgressColor(notification.type)} rounded-r-full"
                        style="animation: progress-shrink {notification.duration || 5000}ms linear forwards;"
                    ></div>
                </div>
            </div>
        {/each}
    </div>
{/if}
