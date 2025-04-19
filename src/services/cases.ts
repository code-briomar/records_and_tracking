import { invoke } from "@tauri-apps/api/core";

// ✅ Case Type Definition
export interface Case {
  file_id: number;
  case_number: string;
  purpose: "Ruling" | "Judgement" | "Other";
  uploaded_by: number;
  current_location: string;
  notes: string;
  date_recieved: string;
  required_on: string;
  required_on_signature: string;
  date_returned?: string | null;
  date_returned_signature?: string | null;
  deleted: number;
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
  data: Omit<
    Case,
    "case_id" | "date_returned" | "date_returned_signature" | "deleted"
  >
): Promise<{ message: string; status: string; case_id: number }> {
  try {
    const response = await invoke("create_case", {
      ...data,
    });
    console.log("Case created successfully:", response);
    return response as { message: string; status: string; case_id: number };
  } catch (error) {
    console.error("Error creating case:", error);
    throw error;
  }
}

// ✅ Get Case by ID
export async function getCase(caseId: number): Promise<Case | null> {
  try {
    const caseData: Case = await invoke("get_case", { case_id: caseId });
    return caseData;
  } catch (error) {
    console.error("Error fetching case:", error);
    return null;
  }
}

// ✅ Update Full Case Record
export async function updateCase(
  caseId: number,
  updates: Partial<Omit<Case, "case_id">>
): Promise<string> {
  try {
    const response: string = await invoke("update_case", {
      case_id: caseId,
      ...updates,
    });
    console.log("Case updated successfully:", response);
    return response;
  } catch (error) {
    console.error("Error updating case:", error);
    throw error;
  }
}

// ✅ Update Case Status (if applicable)
export async function updateCaseStatus(caseId: number, newStatus: string): Promise<string> {
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

// ✅ Assign Staff to a Case (optional, if you still use assigned_staff_id)
export async function assignStaffToCase(caseId: number, staffId: number | null): Promise<string> {
  try {
    const response: string = await invoke("assign_staff_to_case", {
      case_id: caseId,
      staff_id: staffId,
    });
    console.log("Staff assigned to case:", response);
    return response;
  } catch (error) {
    console.error("Error assigning staff to case:", error);
    throw error;
  }
}

// ✅ Delete Case
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
