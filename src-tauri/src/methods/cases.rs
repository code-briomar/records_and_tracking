use rusqlite::params;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;

use crate::AppState; // Import AppState

#[derive(Serialize, Deserialize)]
pub struct Case {
    pub case_id: i32,
    pub title: String,
    pub status: String,
    pub assigned_staff_id: Option<i32>,
    pub priority: String,
    pub date_created: String,
}

// ✅ Get All Cases
#[tauri::command]
pub fn get_all_cases(state: State<AppState>) -> Result<Vec<Case>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT case_id, title, status, assigned_staff_id, priority, date_created FROM cases",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let case_iter = stmt
        .query_map([], |row| {
            Ok(Case {
                case_id: row.get(0)?,
                title: row.get(1)?,
                status: row.get(2)?,
                assigned_staff_id: row.get(3)?,
                priority: row.get(4)?,
                date_created: row.get(5)?,
            })
        })
        .map_err(|e| format!("Failed to fetch cases: {}", e))?;

    let cases: Vec<Case> = case_iter.filter_map(Result::ok).collect();

    Ok(cases)
}

// ✅ Create a Case
#[tauri::command]
pub fn create_case(
    state: State<AppState>,
    title: String,
    assigned_staff_id: Option<i32>,
    priority: String,
) -> Result<serde_json::Value, String> {
    let conn = state.conn.lock().unwrap();

    match conn.execute(
        "INSERT INTO cases (title, status, assigned_staff_id, priority) VALUES (?1, 'Open', ?2, ?3)",
        params![title, assigned_staff_id, priority],
    ) {
        Ok(_) => {
            let new_case_id = conn.last_insert_rowid();
            Ok(json!({
                "message": "Case created successfully",
                "status": "success",
                "case_id": new_case_id
            }))
        }
        Err(e) => Err(format!("Failed to create case: {}", e)),
    }
}

// ✅ Get Case by ID
#[tauri::command]
pub fn get_case(state: State<AppState>, case_id: i32) -> Result<Option<Case>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT case_id, title, status, assigned_staff_id, priority, date_created FROM cases WHERE case_id = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let case = stmt
        .query_row(params![case_id], |row| {
            Ok(Case {
                case_id: row.get(0)?,
                title: row.get(1)?,
                status: row.get(2)?,
                assigned_staff_id: row.get(3)?,
                priority: row.get(4)?,
                date_created: row.get(5)?,
            })
        })
        .optional()
        .map_err(|e| format!("Failed to fetch case: {}", e))?;

    Ok(case)
}

// ✅ Update Case Status
#[tauri::command]
pub fn update_case_status(
    state: State<AppState>,
    case_id: i32,
    new_status: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE cases SET status = ?1 WHERE case_id = ?2",
        params![new_status, case_id],
    ) {
        Ok(_) => Ok("Case status updated successfully".to_string()),
        Err(e) => Err(format!("Failed to update case status: {}", e)),
    }
}

// ✅ Assign Staff to Case
#[tauri::command]
pub fn assign_staff_to_case(
    state: State<AppState>,
    case_id: i32,
    staff_id: Option<i32>,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE cases SET assigned_staff_id = ?1 WHERE case_id = ?2",
        params![staff_id, case_id],
    ) {
        Ok(_) => Ok("Staff assigned to case successfully".to_string()),
        Err(e) => Err(format!("Failed to assign staff to case: {}", e)),
    }
}

// ✅ Delete Case
#[tauri::command]
pub fn delete_case(state: State<AppState>, case_id: i32) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute("DELETE FROM cases WHERE case_id = ?1", params![case_id]) {
        Ok(_) => Ok("Case deleted successfully".to_string()),
        Err(e) => Err(format!("Failed to delete case: {}", e)),
    }
}
