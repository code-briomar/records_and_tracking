import { invoke } from "@tauri-apps/api/core";
import { staff } from "../components/staff_data";

/**
 * Add a new staff member.
 * @param userId - The associated user ID.
 * @param role - The role of the staff member.
 * @param contactNumber - Optional contact number.
 * @param status - Staff status ("Active" or "Absent").
 * @returns A promise resolving to a success message.
 */
export async function addStaff(
    user_id: number,
    role: string,
    contactNumber?: string,
    status: "Active" | "Absent" = "Active"
): Promise<Object> {
    try {
        const response: Object = await invoke("create_staff", {
            userId: user_id,
            role: role,
            contactNumber,
            status,
        });
        staff.push(response);
        return response;
    } catch (error) {
        console.error("Error adding staff:", error);
        throw error;
    }
}

/**
 * Fetch a specific staff member by user ID.
 * @param userId - The ID of the user whose staff record to fetch.
 * @returns A promise resolving to the staff data.
 */
export async function getStaffByUserId(userId: number): Promise<any> {
    try {
        const response: any = await invoke("get_staff", { user_id: userId });
        console.log("Fetched Staff Member:", response);
        return response;
    } catch (error) {
        console.error("Error fetching staff by user ID:", error);
        throw error;
    }
}

/**
 * Fetch all staff members from the database.
 * @returns A promise resolving to an array of all staff records.
 */
export async function getAllStaff(): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_all_staff");
        console.log("Fetched All Staff:", response);
        return response;
    } catch (error) {
        console.error("Error fetching all staff:", error);
        throw error;
    }
}

/**
 * Update a staff member's details.
 * @param staffId - The ID of the staff member.
 * @param role - Updated role.
 * @param contactNumber - Updated contact number.
 * @param status - Updated status ("Active" or "Absent").
 * @returns A promise resolving to a success message.
 */
export async function updateStaff(
    staffId: number,
    newStatus: "Active" | "Absent" = "Active"
): Promise<any> {
    try {
        const response: string = await invoke("update_staff_status", {
            staffId,
            newStatus,
        });
        return response;
    } catch (error) {
        console.error("Error updating staff:", error);
        throw error;
    }
}

/**
 * Delete a staff member by ID.
 * @param staffId - The ID of the staff member to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteStaff(staffId: number): Promise<any> {
    try {
        const response: string = await invoke("delete_staff", { staffId });
        console.log("Staff Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting staff:", error);
        throw error;
    }
}
