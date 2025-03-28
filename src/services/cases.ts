import { invoke } from "@tauri-apps/api/core";

/**
 * Add a new case record.
 * @param title - The title of the case.
 * @param status - The status of the case ("Open", "In Progress", or "Closed").
 * @param assignedStaffId - The staff ID assigned to the case (optional).
 * @param priority - The priority of the case ("Low", "Medium", or "High").
 * @returns A promise resolving to a success message.
 */
export async function addCase(
    title: string,
    status: "Open" | "In Progress" | "Closed" = "Open",
    assignedStaffId?: number,
    priority: "Low" | "Medium" | "High" = "Medium"
): Promise<string> {
    try {
        const response: string = await invoke("add_case", {
            title,
            status,
            assigned_staff_id: assignedStaffId,
            priority,
        });
        console.log("Case Added:", response);
        return response;
    } catch (error) {
        console.error("Error adding case:", error);
        throw error;
    }
}

/**
 * Fetch all case records or filter by staff ID.
 * @param staffId - Optional staff ID to filter cases assigned to a specific staff member.
 * @returns A promise resolving to an array of case records.
 */
export async function getCases(staffId?: number): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_cases", { assigned_staff_id: staffId });
        console.log("Fetched Cases:", response);
        return response;
    } catch (error) {
        console.error("Error fetching cases:", error);
        throw error;
    }
}

/**
 * Update the details of a case.
 * @param caseId - The ID of the case to update.
 * @param status - Updated status of the case ("Open", "In Progress", or "Closed").
 * @param assignedStaffId - Updated staff ID assigned to the case (optional).
 * @param priority - Updated priority of the case ("Low", "Medium", or "High").
 * @returns A promise resolving to a success message.
 */
export async function updateCase(
    caseId: number,
    status: "Open" | "In Progress" | "Closed",
    assignedStaffId?: number,
    priority: "Low" | "Medium" | "High" = "Medium"
): Promise<string> {
    try {
        const response: string = await invoke("update_case", {
            case_id: caseId,
            status,
            assigned_staff_id: assignedStaffId,
            priority,
        });
        console.log("Case Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating case:", error);
        throw error;
    }
}

/**
 * Delete a case by its ID.
 * @param caseId - The ID of the case to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteCase(caseId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_case", { case_id: caseId });
        console.log("Case Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting case:", error);
        throw error;
    }
}
