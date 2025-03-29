import { invoke } from "@tauri-apps/api/core";

// ✅ Case Type Definition
export interface Case {
    case_id: number;
    title: string;
    status: "Open" | "In Progress" | "Closed";
    assigned_staff_id?: number | null;
    priority: "Low" | "Medium" | "High";
    date_created: string;
}

// ✅ Get All Cases
export async function getAllCases(): Promise<Case[]> {
    try {
        const cases: Case[] = await invoke("get_all_cases");
        return cases;
    } catch (error) {
        console.error("Error fetching cases:", error);
        throw error;
    }
}

// ✅ Create a Case
export async function createCase(
    title: string,
    assignedStaffId?: number,
    priority: "Low" | "Medium" | "High" = "Medium"
): Promise<{ message: string; status: string; case_id: number }> {
    try {
        const response: { message: string; status: string; case_id: number } = await invoke("create_case", {
            title,
            assigned_staff_id: assignedStaffId,
            priority,
        });
        console.log("Case created successfully:", response);
        return response;
    } catch (error) {
        console.error("Error creating case:", error);
        throw error;
    }
}

// ✅ Get Case by ID
export async function getCase(caseId: number): Promise<Case | null> {
    try {
        const caseData: Case | null = await invoke("get_case", { case_id: caseId });
        return caseData;
    } catch (error) {
        console.error("Error fetching case:", error);
        return null;
    }
}

// ✅ Update Case Status
export async function updateCaseStatus(caseId: number, newStatus: "Open" | "In Progress" | "Closed"): Promise<string> {
    try {
        const response: string = await invoke("update_case_status", {
            case_id: caseId,
            new_status: newStatus,
        });
        console.log("Case status updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating case status:", error);
        throw error;
    }
}

// ✅ Assign Staff to a Case
export async function assignStaffToCase(caseId: number, staffId?: number | null): Promise<string> {
    try {
        const response: string = await invoke("assign_staff_to_case", {
            case_id: caseId,
            staff_id: staffId,
        });
        console.log("Staff assigned to case:", response);
        return response;
    } catch (error) {
        console.error("Error assigning staff:", error);
        throw error;
    }
}

// ✅ Delete a Case
export async function deleteCase(caseId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_case", { case_id: caseId });
        console.log("Case deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting case:", error);
        throw error;
    }
}
