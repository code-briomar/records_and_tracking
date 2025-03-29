use rusqlite::params;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;

use crate::AppState; // Import AppState

#[derive(Serialize, Deserialize)]
pub struct Attendance {
    pub attendance_id: i32,
    pub staff_id: i32,
    pub date: String,   // Use ISO-8601 format (YYYY-MM-DD)
    pub status: String, // "Present" or "Absent"
    pub reason: Option<String>,
    pub half_day: bool,
    pub comments: Option<String>,
}

#[tauri::command]
pub fn get_all_attendance(state: State<AppState>) -> Result<Vec<Attendance>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT attendance_id, staff_id, date, status, reason, half_day, comments FROM attendance",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let attendance_iter = stmt
        .query_map([], |row| {
            Ok(Attendance {
                attendance_id: row.get(0)?,
                staff_id: row.get(1)?,
                date: row.get(2)?,
                status: row.get(3)?,
                reason: row.get(4)?,
                half_day: row.get(5)?,
                comments: row.get(6)?,
            })
        })
        .map_err(|e| format!("Failed to fetch attendance records: {}", e))?;

    let attendance: Vec<Attendance> = attendance_iter.filter_map(Result::ok).collect();
    Ok(attendance)
}

#[tauri::command]
pub fn add_attendance(
    state: State<AppState>,
    staff_id: i32,
    date: String,
    status: String,
    reason: Option<String>,
    half_day: bool,
    comments: Option<String>,
) -> Result<serde_json::Value, String> {
    let conn = state.conn.lock().unwrap();

    // Validate `status`
    if status != "Present" && status != "Absent" {
        return Err("Invalid status. Must be 'Present' or 'Absent'.".to_string());
    }

    match conn.execute(
        "INSERT INTO attendance (staff_id, date, status, reason, half_day, comments) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![staff_id, date, status, reason, half_day, comments],
    ) {
        Ok(_) => {
            let new_attendance_id = conn.last_insert_rowid(); // Get last inserted row ID
            Ok(json!({
                "message": "Attendance record added successfully",
                "status": "success",
                "attendance_id": new_attendance_id
            }))
        }
        Err(e) => Err(format!("Failed to add attendance record: {}", e)),
    }
}

#[tauri::command]
pub fn get_attendance(
    state: State<AppState>,
    attendance_id: i32,
) -> Result<Option<Attendance>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT attendance_id, staff_id, date, status, reason, half_day, comments FROM attendance WHERE attendance_id = ?1",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let attendance = stmt
        .query_row(params![attendance_id], |row| {
            Ok(Attendance {
                attendance_id: row.get(0)?,
                staff_id: row.get(1)?,
                date: row.get(2)?,
                status: row.get(3)?,
                reason: row.get(4)?,
                half_day: row.get(5)?,
                comments: row.get(6)?,
            })
        })
        .optional()
        .map_err(|e| format!("Failed to fetch attendance record: {}", e))?;

    Ok(attendance)
}

#[tauri::command]
pub fn update_attendance(
    state: State<AppState>,
    attendance_id: i32,
    status: String,
    reason: Option<String>,
    half_day: bool,
    comments: Option<String>,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();

    // Validate `status`
    if status != "Present" && status != "Absent" {
        return Err("Invalid status. Must be 'Present' or 'Absent'.".to_string());
    }

    match conn.execute(
        "UPDATE attendance SET status = ?1, reason = ?2, half_day = ?3, comments = ?4 WHERE attendance_id = ?5",
        params![status, reason, half_day, comments, attendance_id],
    ) {
        Ok(_) => Ok("Attendance record updated successfully".to_string()),
        Err(e) => Err(format!("Failed to update attendance record: {}", e)),
    }
}

#[tauri::command]
pub fn delete_attendance(state: State<AppState>, attendance_id: i32) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "DELETE FROM attendance WHERE attendance_id = ?1",
        params![attendance_id],
    ) {
        Ok(_) => Ok("Attendance record deleted successfully".to_string()),
        Err(e) => Err(format!("Failed to delete attendance record: {}", e)),
    }
}

#[tauri::command]
pub fn get_attendance_by_staff(
    state: State<AppState>,
    staff_id: i32,
) -> Result<Vec<Attendance>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT attendance_id, staff_id, date, status, reason, half_day, comments FROM attendance WHERE staff_id = ?1",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let attendance_iter = stmt
        .query_map(params![staff_id], |row| {
            Ok(Attendance {
                attendance_id: row.get(0)?,
                staff_id: row.get(1)?,
                date: row.get(2)?,
                status: row.get(3)?,
                reason: row.get(4)?,
                half_day: row.get(5)?,
                comments: row.get(6)?,
            })
        })
        .map_err(|e| format!("Failed to fetch attendance records: {}", e))?;

    let attendance: Vec<Attendance> = attendance_iter.filter_map(Result::ok).collect();
    Ok(attendance)
}
