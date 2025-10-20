import type { PageServerLoad, Actions } from "./$types";
import axios from "axios";
import type { User, Role } from "$lib/types";

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
    const userSession = (locals as any).user;
    if (!userSession) {
        throw new Error("Not authenticated");
    }

    const userId = params.id;

    try {
        // Get user details
        const userResponse = await axios.get(`http://localhost:8000/api/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${userSession.token}`,
            },
        });

        // Get all roles for the dropdown
        const rolesResponse = await axios.get(`http://localhost:8000/api/roles`, {
            headers: {
                Authorization: `Bearer ${userSession.token}`,
            },
        });

        return {
            user: userResponse.data.data,
            roles: rolesResponse.data.data || [],
            currentUser: userSession
        };
    } catch (error) {
        console.error("Error loading user:", error);
        throw new Error("Failed to load user");
    }
};

export const actions: Actions = {
    update: async ({ request, params, locals }) => {
        const userSession = (locals as any).user;
        if (!userSession) {
            return { success: false, message: "Not authenticated" };
        }

        const userId = params.id;
        const formData = await request.formData();

        const updateData: any = {
            email: formData.get("email"),
            name: formData.get("name"),
            phone_number: formData.get("phone_number"),
            nik: formData.get("nik"),
            role_id: parseInt(formData.get("role_id") as string),
        };

        // Only include password if provided
        const password = formData.get("password");
        if (password && password.toString().trim()) {
            updateData.password = password;
        }

        try {
            await axios.put(`http://localhost:8000/api/users/${userId}`, updateData, {
                headers: {
                    Authorization: `Bearer ${userSession.token}`,
                    "Content-Type": "application/json",
                },
            });

            return { success: true, message: "User updated successfully" };
        } catch (error) {
            console.error("Error updating user:", error);
            return { success: false, message: "Failed to update user" };
        }
    },
};