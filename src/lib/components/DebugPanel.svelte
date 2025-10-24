<script lang="ts">
    import { clientAPI } from "$lib/clientAPI";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    let showDebugPanel = false;
    let apiLogs: Array<{
        id: string;
        timestamp: string;
        method: string;
        url: string;
        status: string;
    }> = [];
    let isLoading = false;

    // Toggle debug panel with keyboard shortcut
    onMount(() => {
        if (browser) {
            const handleKeydown = (e: KeyboardEvent) => {
                // Ctrl+Shift+D to toggle debug panel
                if (e.ctrlKey && e.shiftKey && e.key === "D") {
                    e.preventDefault();
                    showDebugPanel = !showDebugPanel;
                }
            };
            window.addEventListener("keydown", handleKeydown);
            return () => window.removeEventListener("keydown", handleKeydown);
        }
    });

    async function testAPICall(
        apiCall: () => Promise<any>,
        description: string,
    ) {
        isLoading = true;
        const startTime = Date.now();

        try {
            console.log(`🧪 Testing: ${description}`);
            console.log(`🚀 Watch the Network tab for: ${description}`);
            console.log(`🔍 Filter DevTools by: localhost:5173/api/`);

            const result = await apiCall();
            const duration = Date.now() - startTime;

            apiLogs = [
                ...apiLogs,
                {
                    id: Math.random().toString(36),
                    timestamp: new Date().toLocaleTimeString(),
                    method: "API",
                    url: description,
                    status: `✅ ${duration}ms`,
                },
            ];

            console.log(`✅ ${description} completed in ${duration}ms`);
            console.log(`📊 Result:`, result);
        } catch (error) {
            const duration = Date.now() - startTime;

            apiLogs = [
                ...apiLogs,
                {
                    id: Math.random().toString(36),
                    timestamp: new Date().toLocaleTimeString(),
                    method: "API",
                    url: description,
                    status: `❌ ${duration}ms`,
                },
            ];

            console.error(`❌ ${description} failed:`, error);
        }

        isLoading = false;
    }

    function clearLogs() {
        apiLogs = [];
    }
</script>

{#if showDebugPanel}
    <div
        class="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-80 overflow-y-auto z-50"
    >
        <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-800">🔧 API Debug Panel</h3>
            <button
                on:click={() => (showDebugPanel = false)}
                class="text-gray-500 hover:text-gray-700"
                aria-label="Close debug panel"
            >
                ✕
            </button>
        </div>

        <div class="text-xs text-gray-600 mb-3">
            Press Ctrl+Shift+D to toggle this panel<br />
            💡 <strong>DevTools Tip:</strong> Filter Network tab by "api" to see
            only API calls
        </div>

        <div class="space-y-2 mb-4">
            <h4 class="font-semibold text-sm">Test Client-Side API Calls</h4>

            <!-- Environment Check -->
            <div class="text-xs bg-gray-100 p-2 rounded mb-2">
                <strong>API Base URL:</strong>
                {browser ? import.meta.env.PUBLIC_API_URL : "Loading..."}
            </div>

            <!-- Simple tests -->
            <button
                on:click={() =>
                    testAPICall(async () => {
                        console.log("🎯 Making direct fetch to backend...");
                        const response = await fetch(
                            "http://localhost:8080/api/users",
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                                    "Content-Type": "application/json",
                                },
                            },
                        );
                        console.log("📡 Response status:", response.status);
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                        return response.json();
                    }, "Direct Backend Call")}
                disabled={isLoading}
                class="w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 mb-2"
            >
                🔥 DIRECT BACKEND TEST (localhost:8080)
            </button>

            <button
                on:click={() =>
                    testAPICall(async () => {
                        console.log(
                            "🎯 Making fetch to SvelteKit API route...",
                        );
                        const response = await fetch("/api/test", {
                            method: "GET",
                            headers: { "Content-Type": "application/json" },
                        });
                        console.log("📡 Response status:", response.status);
                        return response.text();
                    }, "SvelteKit API Route Test")}
                disabled={isLoading}
                class="w-full px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 mb-2"
            >
                🧪 SVELTEKIT API ROUTE TEST
            </button>

            <div class="grid grid-cols-2 gap-2">
                <button
                    on:click={() =>
                        testAPICall(
                            () => clientAPI.getUsers(),
                            "Get Users (Axios)",
                        )}
                    disabled={isLoading}
                    class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    Get Users
                </button>

                <button
                    on:click={() =>
                        testAPICall(
                            () => clientAPI.getWallets(),
                            "Get My Wallets",
                        )}
                    disabled={isLoading}
                    class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    Get Wallets
                </button>

                <button
                    on:click={() =>
                        testAPICall(
                            () => clientAPI.getAllWallets(),
                            "Get All Wallets",
                        )}
                    disabled={isLoading}
                    class="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                >
                    All Wallets
                </button>

                <button
                    on:click={() =>
                        testAPICall(
                            () => clientAPI.getPendingTransactions(),
                            "Pending Transactions",
                        )}
                    disabled={isLoading}
                    class="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                    Pending
                </button>
            </div>
        </div>

        <div class="border-t pt-3">
            <div class="flex justify-between items-center mb-2">
                <h4 class="font-semibold text-sm">Client-Side Requests Log</h4>
                <button
                    on:click={clearLogs}
                    class="text-xs text-gray-500 hover:text-gray-700"
                >
                    Clear
                </button>
            </div>

            <div class="max-h-32 overflow-y-auto">
                {#if apiLogs.length === 0}
                    <div class="text-xs text-gray-500 italic">
                        No client-side requests yet. Click buttons above to
                        test.
                    </div>
                {:else}
                    {#each apiLogs as log (log.id)}
                        <div class="text-xs border-b border-gray-100 py-1">
                            <div class="flex justify-between">
                                <span class="font-mono text-gray-600"
                                    >{log.timestamp}</span
                                >
                                <span
                                    class="font-mono {log.status.startsWith(
                                        '✅',
                                    )
                                        ? 'text-green-600'
                                        : 'text-red-600'}">{log.status}</span
                                >
                            </div>
                            <div class="text-gray-800 truncate">{log.url}</div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>

        <div class="mt-3 pt-2 border-t text-xs text-gray-500">
            💡 In DevTools Network tab, type "api" in filter to see only API
            requests<br />
            🔍 Look for requests to localhost:5173/api/ or your backend URL
        </div>
    </div>
{/if}

<!-- Toggle button (always visible) -->
<button
    on:click={() => (showDebugPanel = !showDebugPanel)}
    class="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-40"
    title="Open API Debug Panel (Ctrl+Shift+D)"
    aria-label="Toggle API debug panel"
>
    🔧
</button>
