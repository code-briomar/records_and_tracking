import { invoke } from "@tauri-apps/api/core";

/**
 * Add a new attendance record.
 * @param staffId - The ID of the staff member.
 * @param date - The date of attendance (YYYY-MM-DD format).
 * @param status - Attendance status ("Present" or "Absent").
 * @param reason - Optional reason for absence.
 * @param halfDay - Whether it's a half-day (true/false).
 * @param comments - Optional comments.
 * @returns A promise resolving to a success message.
 */
export async function addAttendance(
    staffId: number,
    date: string,
    status: "Present" | "Absent",
    reason?: string,
    halfDay: boolean = false,
    comments?: string
): Promise<string> {
    try {
        const response: string = await invoke("add_attendance", {
            staff_id: staffId,
            date,
            status,
            reason,
            half_day: halfDay,
            comments,
        });
        console.log("Attendance Added:", response);
        return response;
    } catch (error) {
        console.error("Error adding attendance:", error);
        throw error;
    }
}

/**
 * Fetch attendance records (all or filtered by staff ID).
 * @param staffId - Optional staff ID to filter records.
 * @returns A promise resolving to an array of attendance records.
 */
export async function getAttendance(staffId?: number): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_attendance", { staff_id: staffId });
        console.log("Fetched Attendance:", response);
        return response;
    } catch (error) {
        console.error("Error fetching attendance:", error);
        throw error;
    }
}

/**
 * Update an existing attendance record.
 * @param attendanceId - The ID of the attendance record.
 * @param status - Updated status ("Present" or "Absent").
 * @param reason - Updated reason for absence.
 * @param halfDay - Updated half-day status (true/false).
 * @param comments - Updated comments.
 * @returns A promise resolving to a success message.
 */
export async function updateAttendance(
    attendanceId: number,
    status: "Present" | "Absent",
    reason?: string,
    halfDay: boolean = false,
    comments?: string
): Promise<string> {
    try {
        const response: string = await invoke("update_attendance", {
            attendance_id: attendanceId,
            status,
            reason,
            half_day: halfDay,
            comments,
        });
        console.log("Attendance Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating attendance:", error);
        throw error;
    }
}

/**
 * Delete an attendance record by ID.
 * @param attendanceId - The ID of the attendance record to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteAttendance(attendanceId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_attendance", { attendance_id: attendanceId });
        console.log("Attendance Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting attendance:", error);
        throw error;
    }
}
