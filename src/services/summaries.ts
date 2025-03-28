import { invoke } from "@tauri-apps/api/core";

/**
 * Create a new summary.
 * @param title - The title of the summary.
 * @param content - The summary content.
 * @param category - The category of the summary.
 * @param generatedBy - The name of the person who generated the summary.
 * @returns A promise resolving to a success message.
 */
export async function createSummary(
    title: string,
    content: string,
    category: "Cases" | "Files" | "Attendance" | "Notifications" | "Overall",
    generatedBy: string
): Promise<string> {
    try {
        const response: string = await invoke("create_summary", {
            title,
            content,
            category,
            generated_by: generatedBy,
        });
        console.log("Summary Created:", response);
        return response;
    } catch (error) {
        console.error("Error creating summary:", error);
        throw error;
    }
}

/**
 * Fetch all summaries.
 * @returns A promise resolving to an array of summaries.
 */
export async function getSummaries(): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_summaries");
        console.log("Fetched Summaries:", response);
        return response;
    } catch (error) {
        console.error("Error fetching summaries:", error);
        throw error;
    }
}

/**
 * Fetch a summary by ID.
 * @param summaryId - The ID of the summary to fetch.
 * @returns A promise resolving to the summary data.
 */
export async function getSummaryById(summaryId: number): Promise<any> {
    try {
        const response: any = await invoke("get_summary_by_id", { summary_id: summaryId });
        console.log("Fetched Summary:", response);
        return response;
    } catch (error) {
        console.error("Error fetching summary:", error);
        throw error;
    }
}

/**
 * Update a summary.
 * @param summaryId - The ID of the summary to update.
 * @param title - The updated title.
 * @param content - The updated content.
 * @param category - The updated category.
 * @returns A promise resolving to a success message.
 */
export async function updateSummary(
    summaryId: number,
    title: string,
    content: string,
    category: "Cases" | "Files" | "Attendance" | "Notifications" | "Overall"
): Promise<string> {
    try {
        const response: string = await invoke("update_summary", {
            summary_id: summaryId,
            title,
            content,
            category,
        });
        console.log("Summary Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating summary:", error);
        throw error;
    }
}

/**
 * Delete a summary by ID.
 * @param summaryId - The ID of the summary to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteSummary(summaryId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_summary", { summary_id: summaryId });
        console.log("Summary Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting summary:", error);
        throw error;
    }
}
