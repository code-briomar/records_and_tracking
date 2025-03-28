import { invoke } from "@tauri-apps/api/core";

export const createUser = async (): Promise<void> => {
    try {
        const response = await invoke("create_user", {
            name: "Briane",
            role: "Staff",
            email: "alice@example.com",
            phoneNumber: "123456789",
            passwordHash: "hashedpassword",
        });
        console.log(response);
    } catch (error) {
        console.error("Error:", error);
    }
} 

export async function getUser(userId: number): Promise<void> {
    try {
        const user = await invoke("get_user", { userId });
        console.log(user);
    } catch (error) {
        console.error("Error fetching user:", error);
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
export async function deleteUser(userId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_user", { user_id: userId });
        console.log("User Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}