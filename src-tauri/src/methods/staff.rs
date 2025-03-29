use rusqlite::params;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use serde_json::json;

use tauri::State;

use crate::AppState; // Import AppState

#[derive(Serialize, Deserialize)]
pub struct Staff {
    pub staff_id: i32,
    pub user_id: i32,
    pub role: String,
    pub contact_number: Option<String>,
    pub status: String,
}

// Get All Staff
#[tauri::command]
pub fn get_all_staff(state: State<AppState>) -> Result<Vec<Staff>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT staff_id, user_id, role, contact_number, status FROM staff")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let staff_iter = stmt
        .query_map([], |row| {
            Ok(Staff {
                staff_id: row.get(0)?,
                user_id: row.get(1)?,
                role: row.get(2)?,
                contact_number: row.get(3)?,
                status: row.get(4)?,
            })
        })
        .map_err(|e| format!("Failed to fetch staff members: {}", e))?;

    let staff: Vec<Staff> = staff_iter.filter_map(Result::ok).collect();

    Ok(staff)
}

// Create Staff Member
#[tauri::command]
pub fn create_staff(
    state: State<AppState>,
    user_id: serde_json::Value, // Accepts any JSON value
    role: String,
    contact_number: Option<String>,
) -> Result<serde_json::Value, String> {
    let conn = state.conn.lock().unwrap();

    // Extract `user_id` as i32 if it's a number or inside a map
    let user_id = match user_id {
        serde_json::Value::Number(n) => n.as_i64().unwrap_or(0) as i32, // Handles number directly
        serde_json::Value::Object(ref obj) => {
            if let Some(id) = obj.get("user_id").and_then(|v| v.as_i64()) {
                id as i32
            } else {
                return Err("Invalid user_id format".to_string());
            }
        }
        _ => return Err("Invalid user_id type".to_string()),
    };

    match conn.execute(
        "INSERT INTO staff (user_id, role, contact_number, status) VALUES (?1, ?2, ?3, 'Active')",
        params![user_id, role, contact_number],
    ) {
        Ok(_) => {
            let new_staff_id = conn.last_insert_rowid(); // Get the last inserted row ID
            Ok(json!({
                "message": "Staff member created successfully",
                "status": "success",
                "staff_id": new_staff_id
            }))
        }
        Err(e) => Err(format!("Failed to create staff member: {}", e)),
    }
}

// Get Staff Member by ID
#[tauri::command]
pub fn get_staff(state: State<AppState>, staff_id: i32) -> Result<Option<Staff>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT staff_id, user_id, role, contact_number, status FROM staff WHERE staff_id = ?1",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let staff = stmt
        .query_row(params![staff_id], |row| {
            Ok(Staff {
                staff_id: row.get(0)?,
                user_id: row.get(1)?,
                role: row.get(2)?,
                contact_number: row.get(3)?,
                status: row.get(4)?,
            })
        })
        .optional()
        .map_err(|e| format!("Failed to fetch staff member: {}", e))?;

    Ok(staff)
}

// Update Staff Member Status
#[tauri::command]
pub fn update_staff_status(
    state: State<AppState>,
    staff_id: i32,
    new_status: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE staff SET status = ?1 WHERE staff_id = ?2",
        params![new_status, staff_id],
    ) {
        Ok(_) => Ok("Staff member status updated".to_string()),
        Err(e) => Err(format!("Failed to update staff member status: {}", e)),
    }
}

// Delete Staff Member
#[tauri::command]
pub fn delete_staff(state: State<AppState>, staff_id: i32) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute("DELETE FROM staff WHERE staff_id = ?1", params![staff_id]) {
        Ok(_) => Ok("Staff member deleted successfully".to_string()),
        Err(e) => Err(format!("Failed to delete staff member: {}", e)),
    }
}
