import type { SHURecord } from '$lib/types';
import axios from '$lib/api';

export const load = async ({ parent }: { parent: any }) => {
    console.log("🚀 Loading SHU page data");

    try {
        const { user: currentUser } = await parent();

        if (!currentUser) {
            console.log("❌ No current user found");
            return {
                currentUser: null,
                shuRecords: [],
                error: "Authentication required"
            };
        }

        console.log("👤 Current user:", currentUser?.email, currentUser?.role?.name);

        const isAdmin = currentUser.role?.name === 'admin';
        const isSuperAdmin = currentUser.role?.name === 'super_admin';
        const canManageSHU = isAdmin || isSuperAdmin;

        console.log("🔐 User permissions:", {
            isAdmin,
            isSuperAdmin,
            canManageSHU
        });

        let shuRecords: SHURecord[] = [];
        let userShuHistory: any[] = [];

        // Load SHU records for admin/super admin or user history for members
        try {
            if (canManageSHU) {
                console.log("📊 Fetching SHU records for admin");
                const response = await axios.get("/shu");
                console.log("📦 Raw SHU response:", response.data);

                shuRecords = response.data.data || [];
                console.log("✅ SHU records loaded:", shuRecords.length);

                // Validate that records have IDs for proper deletion
                if (shuRecords.length > 0) {
                    const firstRecord = shuRecords[0];
                    console.log("🔍 First SHU record fields:", Object.keys(firstRecord));
                    console.log("🔍 First SHU record sample:", firstRecord);

                    const hasId = firstRecord.id || firstRecord.ID;
                    if (!hasId) {
                        console.warn("⚠️ SHU records missing ID field (tried both 'id' and 'ID') - delete functionality may not work properly");
                    } else {
                        console.log("✅ SHU records have ID field:", hasId);
                    }
                }
            } else {
                console.log("📊 Fetching user SHU history for member ID:", currentUser.id);

                // Try the new SHU Anggota endpoint first
                try {
                    console.log("🔄 Trying new SHU Anggota history endpoint:", `/shu-anggota/user/${currentUser.id}/history`);
                    const response = await axios.get(`/shu-anggota/user/${currentUser.id}/history`);
                    console.log(`📦 SHU Anggota response:`, JSON.stringify(response.data, null, 2));
                    console.log(`📦 Response status:`, response.status);
                    console.log(`📦 Response data type:`, typeof response.data);

                    if (response.data?.data && Array.isArray(response.data.data)) {
                        userShuHistory = response.data.data;
                        console.log("✅ Found SHU Anggota history (array):", userShuHistory.length);
                        console.log("📊 First SHU Anggota record sample:", userShuHistory[0]);
                    } else if (Array.isArray(response.data)) {
                        userShuHistory = response.data;
                        console.log("✅ Found SHU Anggota history (direct array):", userShuHistory.length);
                    } else {
                        console.log("⚠️ SHU Anggota endpoint returned unexpected structure:", response.data);
                        throw new Error("Unexpected response structure");
                    }
                } catch (shuAnggotaError: any) {
                    console.log(`❌ SHU Anggota endpoint failed:`, shuAnggotaError.response?.status, shuAnggotaError.response?.data);

                    // Fallback to original endpoints if new endpoint fails
                    console.log("🔄 Falling back to original endpoints...");

                    // Try different possible endpoints for user SHU history (original fallback)
                    const possibleEndpoints = [
                        `/shu/user/${currentUser.id}`,
                        `/shu/user/${currentUser.id}/history`,
                        `/shu/member/${currentUser.id}`,
                        `/shu?user_id=${currentUser.id}`,
                        `/user/${currentUser.id}/shu`,
                        `/shu/anggota/${currentUser.id}`,
                        `/anggota/${currentUser.id}/shu`
                    ];

                    let historyLoaded = false;
                    for (const endpoint of possibleEndpoints) {
                        try {
                            console.log("🔄 Trying fallback endpoint:", endpoint);
                            const response = await axios.get(endpoint);
                            console.log(`📦 Raw response from ${endpoint}:`, JSON.stringify(response.data, null, 2));
                            console.log(`📦 Response status:`, response.status);
                            console.log(`📦 Response data type:`, typeof response.data);
                            console.log(`📦 Response data keys:`, response.data ? Object.keys(response.data) : 'null');

                            // Handle different response structures
                            if (response.data?.data && Array.isArray(response.data.data)) {
                                userShuHistory = response.data.data;
                                console.log("✅ Found data in response.data.data (array):", userShuHistory.length);
                            } else if (response.data?.data && !Array.isArray(response.data.data)) {
                                userShuHistory = [response.data.data];
                                console.log("✅ Found data in response.data.data (object):", userShuHistory.length);
                            } else if (Array.isArray(response.data)) {
                                userShuHistory = response.data;
                                console.log("✅ Found direct array:", userShuHistory.length);
                            } else if (response.data && !Array.isArray(response.data) && Object.keys(response.data).length > 0) {
                                userShuHistory = [response.data];
                                console.log("✅ Found single object:", userShuHistory.length);
                            } else {
                                console.log("⚠️ Response structure not recognized:", response.data);
                                continue; // Try next endpoint
                            }

                            console.log("✅ User SHU history loaded from", endpoint, ":", userShuHistory.length);
                            console.log("📊 First record sample:", userShuHistory[0]);
                            historyLoaded = true;
                            break;
                        } catch (error: any) {
                            console.log(`❌ Endpoint ${endpoint} failed:`, error.response?.status, error.response?.data);
                        }
                    }

                    if (!historyLoaded) {
                        console.log("⚠️ No working endpoint found for user SHU history");
                        console.log("🔍 Let's try to understand the API structure better...");

                        // Try to get user's basic info to verify the API works
                        try {
                            console.log("🔍 Testing basic user info endpoint...");
                            const userInfoResponse = await axios.get(`/user/${currentUser.id}`);
                            console.log("✅ User info response:", userInfoResponse.data);
                        } catch (error: any) {
                            console.log("❌ User info failed:", error.response?.status, error.response?.data);
                        }

                        // Try to list all SHU records and see if any match the user
                        try {
                            console.log("🔍 Testing general SHU list endpoint...");
                            const allShuResponse = await axios.get("/shu");
                            console.log("✅ All SHU response structure:", typeof allShuResponse.data);
                            if (allShuResponse.data?.data) {
                                const userRecords = allShuResponse.data.data.filter((record: any) =>
                                    record.user_id === currentUser.id ||
                                    record.anggota_id === currentUser.id ||
                                    record.member_id === currentUser.id
                                );
                                if (userRecords.length > 0) {
                                    console.log("✅ Found user SHU records in general list:", userRecords);
                                    userShuHistory = userRecords;
                                    historyLoaded = true;
                                }
                            }
                        } catch (error: any) {
                            console.log("❌ General SHU list failed:", error.response?.status, error.response?.data);
                        }

                        if (!historyLoaded) {
                            userShuHistory = [];
                        }
                    }
                }
            }
        } catch (error) {
            console.error("❌ Error fetching SHU data:", error);
        }

        console.log("✅ SHU page data loaded successfully");
        console.log("📊 Final data:", {
            shuRecordsCount: shuRecords.length,
            canManageSHU
        });

        return {
            currentUser,
            shuRecords,
            userShuHistory,
            canManageSHU
        };

    } catch (error) {
        console.error("❌ Error in SHU page load:", error);
        return {
            currentUser: null,
            shuRecords: [],
            canManageSHU: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
};