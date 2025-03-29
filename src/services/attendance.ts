import { invoke } from "@tauri-apps/api/core";

/**
 * Create a new attendance record.
 * @param attendance - The attendance details.
 * @returns The new attendance ID.
 */
export const createAttendance = async (attendance: {
    staffId: number;
    date: string; // Format: YYYY-MM-DD
    status: "Present" | "Absent";
    reason?: string;
    halfDay: boolean;
    comments?: string;
}): Promise<Object> => {
    try {
        const attendanceId: Object = await invoke("add_attendance", attendance);
        return attendanceId;
    } catch (error) {
        console.error("Error creating attendance:", error);
        throw error;
    }
};

/**
 * Fetch all attendance records.
 * @returns A list of all attendance records.
 */
export const getAllAttendance = async (): Promise<any[]> => {
    try {
        const records = await invoke("get_all_attendance");
        return records as any[] || [];
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return [];
    }
};

/**
 * Fetch attendance by ID.
 * @param attendanceId - The ID of the attendance record.
 * @returns The attendance record or an empty object if not found.
 */
export const getAttendanceById = async (attendanceId: number): Promise<any> => {
    try {
        const record = await invoke("get_attendance", { attendance_id: attendanceId });
        return record || {};
    } catch (error) {
        console.error("Error fetching attendance record:", error);
        return {};
    }
};

/**
 * Fetch all attendance records for a specific staff member.
 * @param staffId - The ID of the staff member.
 * @returns A list of attendance records.
 */
export const getAttendanceByStaff = async (staffId: number): Promise<any[]> => {
    try {
        const records: any[] = await invoke("get_attendance_by_staff", { staff_id: staffId });
        return records || [];
    } catch (error) {
        console.error("Error fetching staff attendance records:", error);
        return [];
    }
};

/**
 * Update an existing attendance record.
 * @param attendanceId - The ID of the attendance record.
 * @param updates - Updated attendance data.
 * @returns A success message.
 */
export const updateAttendance = async (
    attendanceId: number,
    updates: {
        status: "Present" | "Absent";
        reason?: string;
        halfDay: boolean;
        comments?: string;
    }
): Promise<string> => {
    try {
        const response: string = await invoke("update_attendance", {
            attendance_id: attendanceId,
            ...updates,
        });
        console.log("Attendance Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating attendance:", error);
        throw error;
    }
};

/**
 * Delete an attendance record.
 * @param attendanceId - The ID of the record to delete.
 * @returns A success message.
 */
export const deleteAttendance = async (attendanceId: number): Promise<string> => {
    try {
        const response: string = await invoke("delete_attendance", { attendance_id: attendanceId });
        console.log("Attendance Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting attendance:", error);
        throw error;
    }
};
