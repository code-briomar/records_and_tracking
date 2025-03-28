import { invoke } from "@tauri-apps/api/core";

/**
 * Create a new report.
 * @param type - The type of report ('Attendance' | 'Cases' | 'Files Processed').
 * @param dataJson - The JSON data of the report.
 * @returns A promise resolving to a success message.
 */
export async function createReport(
    type: "Attendance" | "Cases" | "Files Processed",
    dataJson: string
): Promise<string> {
    try {
        const response: string = await invoke("create_report", {
            type,
            data_json: dataJson,
        });
        console.log("Report Created:", response);
        return response;
    } catch (error) {
        console.error("Error creating report:", error);
        throw error;
    }
}

/**
 * Fetch all reports.
 * @returns A promise resolving to an array of reports.
 */
export async function getReports(): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_reports");
        console.log("Fetched Reports:", response);
        return response;
    } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
    }
}

/**
 * Fetch a report by ID.
 * @param reportId - The ID of the report to fetch.
 * @returns A promise resolving to the report data.
 */
export async function getReportById(reportId: number): Promise<any> {
    try {
        const response: any = await invoke("get_report_by_id", { report_id: reportId });
        console.log("Fetched Report:", response);
        return response;
    } catch (error) {
        console.error("Error fetching report:", error);
        throw error;
    }
}

/**
 * Update a report's data.
 * @param reportId - The ID of the report to update.
 * @param type - The updated type of report.
 * @param dataJson - The updated JSON data.
 * @returns A promise resolving to a success message.
 */
export async function updateReport(
    reportId: number,
    type: "Attendance" | "Cases" | "Files Processed",
    dataJson: string
): Promise<string> {
    try {
        const response: string = await invoke("update_report", {
            report_id: reportId,
            type,
            data_json: dataJson,
        });
        console.log("Report Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating report:", error);
        throw error;
    }
}

/**
 * Delete a report by its ID.
 * @param reportId - The ID of the report to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteReport(reportId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_report", { report_id: reportId });
        console.log("Report Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting report:", error);
        throw error;
    }
}
