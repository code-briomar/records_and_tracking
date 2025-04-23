import { invoke } from "@tauri-apps/api/core";

// ✅ File Type Definition
export interface File {
    case_number?: any;
    file_id: number;
    caseNumber: string
    purpose: string;
    uploaded_by: number;
    current_location: string;
    notes: string;
    date_recieved: string;
    required_on: string;
    required_on_signature: string;
    date_returned: string | null;
    date_returned_signature: string | null;
    deleted: boolean;
}

// ✅ Get All Files
export async function getAllFiles(): Promise<File[]> {
    try {
        const files: File[] = await invoke("get_all_files");
        console.log("Files", files);
        return files;
    } catch (error) {
        console.error("Error fetching files:", error);
        throw error;
    }
}

// ✅ Upload a File
export async function addNewFile(
    file: Omit<File, 'file_id'> // We don’t need `file_id` for upload as it’s auto-generated
): Promise<{ message: string; status: string; file_id: number }> {
    try {
        const response: { message: string; status: string; file_id: number } = await invoke("add_new_file", {
            caseNumber: file.caseNumber,
            purpose: file.purpose,
            uploadedBy: file.uploaded_by,
            currentLocation: file.current_location,
            notes: file.notes,
            requiredOn: file.required_on,
        });
        console.log("File uploaded successfully:", response);
        return response;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

// ✅ Update a File
export async function updateFile(
    file: {
      file_id: number;
      case_number: string;
      purpose: string;
      current_location: string;
      notes: string;
      required_on: string;
    }
  ): Promise<{ message: string; status: string; file_id: number }> {
    try {
      const response: { message: string; status: string; file_id: number } = await invoke("update_file", {
        fileId: file.file_id,
        caseNumber: file.case_number,
        purpose: file.purpose,
        currentLocation: file.current_location,
        notes: file.notes,
        requiredOn: file.required_on,
      });
  
      console.log("File updated successfully:", response);
      return response;
    } catch (error) {
      console.error("Error updating file:", error);
      throw error;
    }
  }
  

// ✅ Get File by ID
export async function getFile(fileId: number): Promise<File | null> {
    try {
        const fileData: File | null = await invoke("get_file_by_id", { file_id: fileId });
        return fileData;
    } catch (error) {
        console.error("Error fetching file:", error);
        return null;
    }
}

// ✅ Update File Date
export async function updateFileDate(fileId: number, dateType: string, newDate: string): Promise<string> {
    try {
        const response: string = await invoke("update_file_date", {
            file_id: fileId,
            date_type: dateType,
            new_date: newDate,
        });
        console.log("File date updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating file date:", error);
        throw error;
    }
}

// ✅ Update File Notes
export async function updateFileNotes(fileId: number, newNotes: string): Promise<string> {
    try {
        const response: string = await invoke("update_file_notes", {
            file_id: fileId,
            new_notes: newNotes,
        });
        console.log("File notes updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating file notes:", error);
        throw error;
    }
}

// ✅ Delete a File (Soft Delete)
export async function deleteFile(fileId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_file", {  fileId });
        console.log("File deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
}

// ✅ Search Files By Case Number
export async function searchFilesByCaseNumber(caseNumber: string): Promise<File[]> {
    try {
        const files: File[] = await invoke("search_files_by_case_number", { case_number: caseNumber });
        console.log("Files found by case number:", files);
        return files;
    } catch (error) {
        console.error("Error searching files by case number:", error);
        throw error;
    }
}

// ✅ Search Files By User
export async function filterFilesByUser(userId: number): Promise<File[]> {
    try {
        const files: File[] = await invoke("filter_files_by_user", { user_id: userId });
        console.log("Files found by user:", files);
        return files;
    } catch (error) {
        console.error("Error searching files by user:", error);
        throw error;
    }
}

// ✅ Search Files By Purpose
export async function getFilesByPurpose(purpose: string): Promise<File[]> {
    try {
        const files: File[] = await invoke("get_files_by_purpose", { purpose });
        console.log("Files found by purpose:", files);
        return files;
    } catch (error) {
        console.error("Error searching files by purpose:", error);
        throw error;
    }
}
