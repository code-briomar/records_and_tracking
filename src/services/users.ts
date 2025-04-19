import { invoke } from "@tauri-apps/api/core";


export const createUser = async (user: {
    name: string;
    role: "Super Admin" | "Court Admin" | "Staff";
    email: string;
    phoneNumber: string;
    passwordHash: string;
}): Promise<number> => { // ✅ Returns user_id
    try {
        const userId: number = await invoke("create_user", user);
        console.log("User created successfully with ID:", userId);
        return userId;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};



export async function getUser(userId: number): Promise<any> {
    try {
        const user = await invoke("get_user", { userId });
        return user || {};  // Ensure it always returns an object
    } catch (error) {
        console.error("Error fetching user:", error);
        return {}; // Return an empty object instead of undefined
    }
}


export async function updateUserStatus(userId: number, newStatus: string): Promise<string> {
    try {
        const response: string = await invoke("update_user_status", { user_id: userId, new_status: newStatus });
        console.log("User Status Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating user status:", error);
        throw error;
    }
}

/**
 * Delete a user by ID.
 * @param userId - The ID of the user to delete.
 * @returns A promise resolving to a success message or an error.
 */
export async function deleteUser(userId: number): Promise<any> {
    try {
        const response: string = await invoke("delete_user", { userId });
        console.log("User Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}