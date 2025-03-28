import { invoke } from "@tauri-apps/api/core";

/**
 * Upload a new file record.
 * @param fileName - Name of the file.
 * @param uploadedBy - ID of the user who uploaded the file.
 * @param fileSize - Size of the file.
 * @param caseId - Optional case ID to which the file belongs.
 * @param version - Version of the file (default is "1.0").
 * @returns A promise resolving to a success message.
 */
export async function uploadFile(
    fileName: string,
    uploadedBy: number,
    fileSize: string,
    caseId?: number,
    version: string = "1.0"
): Promise<string> {
    try {
        const response: string = await invoke("upload_file", {
            file_name: fileName,
            uploaded_by: uploadedBy,
            file_size: fileSize,
            case_id: caseId,
            version,
        });
        console.log("File Uploaded:", response);
        return response;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

/**
 * Fetch all file records or filter by case ID.
 * @param caseId - Optional case ID to filter files related to a specific case.
 * @returns A promise resolving to an array of file records.
 */
export async function getFiles(caseId?: number): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_files", { case_id: caseId });
        console.log("Fetched Files:", response);
        return response;
    } catch (error) {
        console.error("Error fetching files:", error);
        throw error;
    }
}

/**
 * Update the details of a file record.
 * @param fileId - The ID of the file to update.
 * @param fileName - Updated name of the file.
 * @param caseId - Updated case ID (optional).
 * @param version - Updated version of the file.
 * @returns A promise resolving to a success message.
 */
export async function updateFile(
    fileId: number,
    fileName: string,
    caseId?: number,
    version: string = "1.0"
): Promise<string> {
    try {
        const response: string = await invoke("update_file", {
            file_id: fileId,
            file_name: fileName,
            case_id: caseId,
            version,
        });
        console.log("File Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating file:", error);
        throw error;
    }
}

/**
 * Delete a file by its ID.
 * @param fileId - The ID of the file to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteFile(fileId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_file", { file_id: fileId });
        console.log("File Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
}
