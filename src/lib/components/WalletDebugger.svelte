<script lang="ts">
    import { browser } from "$app/environment";
    import axios from "$lib/api";

    let debugOutput = "";
    let isLoading = false;

    async function testWalletAPI() {
        if (!browser) return;

        isLoading = true;
        debugOutput = "Testing wallet API...\n";

        try {
            // Test 1: Check token
            const token = localStorage.getItem("token");
            debugOutput += `✅ Token found: ${token ? "Yes" : "No"}\n`;
            if (token) {
                debugOutput += `🔑 Token preview: ${token.substring(0, 20)}...\n`;
            }

            // Test 2: Check API base URL
            debugOutput += `🌐 API Base URL: ${import.meta.env.PUBLIC_API_URL}\n`;

            // Test 3: Try to get wallets
            debugOutput += "📡 Making API call to /simpanan/wallets...\n";

            const response = await axios.get("/simpanan/wallets");
            debugOutput += `✅ Response status: ${response.status}\n`;
            debugOutput += `📊 Data received: ${JSON.stringify(response.data, null, 2)}\n`;

            if (response.data?.data) {
                debugOutput += `🏦 Number of wallets: ${response.data.data.length}\n`;
                if (response.data.data.length > 0) {
                    debugOutput += `🔍 First wallet: ${JSON.stringify(response.data.data[0], null, 2)}\n`;
                }
            }
        } catch (error: any) {
            debugOutput += `❌ Error: ${error.message}\n`;
            if (error.response) {
                debugOutput += `📡 Response status: ${error.response.status}\n`;
                debugOutput += `📝 Response data: ${JSON.stringify(error.response.data, null, 2)}\n`;
            }
            console.error("Wallet API test error:", error);
        }

        isLoading = false;
    }

    async function testAllWallets() {
        if (!browser) return;

        isLoading = true;
        debugOutput = "Testing all wallets API...\n";

        try {
            const response = await axios.get("/simpanan/wallets/all");
            debugOutput += `✅ Response status: ${response.status}\n`;
            debugOutput += `📊 Data received: ${JSON.stringify(response.data, null, 2)}\n`;
        } catch (error: any) {
            debugOutput += `❌ Error: ${error.message}\n`;
            if (error.response) {
                debugOutput += `📡 Response status: ${error.response.status}\n`;
                debugOutput += `📝 Response data: ${JSON.stringify(error.response.data, null, 2)}\n`;
            }
        }

        isLoading = false;
    }
</script>

<div class="bg-white p-4 rounded-lg shadow border">
    <h3 class="text-lg font-bold mb-4">🔧 Wallet API Debugger</h3>

    <div class="space-x-2 mb-4">
        <button
            on:click={testWalletAPI}
            disabled={isLoading}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
            Test My Wallets
        </button>

        <button
            on:click={testAllWallets}
            disabled={isLoading}
            class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
            Test All Wallets (Admin)
        </button>
    </div>

    {#if isLoading}
        <div class="text-blue-600">Testing API...</div>
    {/if}

    {#if debugOutput}
        <div
            class="bg-gray-100 p-3 rounded text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto"
        >
            {debugOutput}
        </div>
    {/if}
</div>
