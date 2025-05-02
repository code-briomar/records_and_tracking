use rusqlite::params;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;

use crate::AppState; // Import AppState

#[derive(Debug, Serialize, Deserialize)]
pub struct File {
    pub file_id: i32,
    pub case_number: Option<String>,
    pub case_type: Option<String>,
    pub purpose: Option<String>,
    pub uploaded_by: Option<i32>,
    pub current_location: Option<String>,
    pub notes: Option<String>,
    pub date_recieved: Option<String>,
    pub required_on: Option<String>,
    pub required_on_signature: Option<String>,
    pub date_returned: Option<String>,
    pub date_returned_signature: Option<String>,
    pub deleted: Option<bool>,
}

//  Get All Files
#[tauri::command]
pub fn get_all_files(state: State<AppState>) -> Result<Vec<File>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT file_id, case_number, case_type, purpose, uploaded_by, current_location, notes,
             date_recieved, required_on, required_on_signature, date_returned,
             date_returned_signature, deleted FROM files",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let file_iter = stmt
        .query_map([], |row| {
            let file_result = File {
                file_id: row.get(0)?,
                case_number: row.get(1)?,
                case_type: row.get(2)?,
                purpose: row.get(3)?,
                uploaded_by: row.get(4)?,
                current_location: row.get(5)?,
                notes: row.get(6)?,
                date_recieved: row.get(7)?,
                required_on: row.get(8)?,
                required_on_signature: row.get(9)?,
                date_returned: row.get(10)?,
                date_returned_signature: row.get(11)?,
                deleted: row.get(12)?,
            };
            Ok(file_result)
        })
        .map_err(|e| format!("Failed to fetch files: {}", e))?;

    let mut files = Vec::new();
    for file in file_iter {
        match file {
            Ok(f) => files.push(f),
            Err(e) => eprintln!("Failed to parse row: {:?}", e), // Log the exact error
        }
    }

    Ok(files)
}

//  Add a new File Record
#[tauri::command]
pub fn add_new_file(
    state: State<AppState>,
    case_number: String,
    case_type: String,
    purpose: String,
    uploaded_by: i32,
    current_location: String,
    notes: String,
    required_on: String,
) -> Result<serde_json::Value, String> {
    let conn = state.conn.lock().unwrap();

    match conn.execute(
        "INSERT INTO files (
            case_number, case_type, purpose, uploaded_by, current_location, notes,
            required_on 
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            case_number,
            case_type,
            purpose,
            uploaded_by,
            current_location,
            notes,
            required_on
        ],
    ) {
        Ok(_) => {
            let new_file_id = conn.last_insert_rowid();
            Ok(json!({
                "message": "File uploaded successfully",
                "status": "success",
                "file_id": new_file_id
            }))
        }
        Err(e) => Err(format!("Failed to upload file: {}", e)),
    }
}

//  Get File by ID
#[tauri::command]
pub fn get_file_by_id(state: State<AppState>, file_id: i32) -> Result<Option<File>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT file_id, case_number, case_type, purpose, uploaded_by, current_location, notes,
         date_recieved, required_on, required_on_signature, date_returned,
         date_returned_signature, deleted FROM files WHERE file_id = ?1",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let file = stmt
        .query_row(params![file_id], |row| {
            Ok(File {
                file_id: row.get(0)?,
                case_number: row.get(1)?,
                case_type: row.get(2)?,
                purpose: row.get(3)?,
                uploaded_by: row.get(4)?,
                current_location: row.get(5)?,
                notes: row.get(6)?,
                date_recieved: row.get(7)?,
                required_on: row.get(8)?,
                required_on_signature: row.get(9)?,
                date_returned: row.get(10)?,
                date_returned_signature: row.get(11)?,
                deleted: row.get(12)?,
            })
        })
        .optional()
        .map_err(|e| format!("Failed to fetch file: {}", e))?;

    Ok(file)
}

//  Update File Date :
// "required_on"
// "date_returned"
// "date_recieved"
// TODO::Test
#[tauri::command]
pub fn update_file_date(
    state: State<AppState>,
    file_id: i32,
    date_type: String, // start_date, needed_by_date or closed_date
    new_date: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    let query = format!("UPDATE files SET {} = ?1 WHERE file_id = ?2", date_type);
    match conn.execute(&query, params![new_date, file_id]) {
        Ok(_) => Ok("Updated successfully".to_string()),
        Err(e) => Err(format!("Failed to update : {}", e)),
    }
}

// Update file
#[tauri::command]
pub fn update_file(
    state: State<AppState>,
    file_id: i64,
    case_number: String,
    case_type: String,
    purpose: String,
    current_location: String,
    notes: String,
    required_on: String,
) -> Result<serde_json::Value, String> {
    let conn = state.conn.lock().unwrap();

    match conn.execute(
        "UPDATE files 
         SET case_number = ?1,
                case_type = ?2,
                purpose = ?3,
                current_location = ?4,
                notes = ?5,
                required_on = ?6

         WHERE file_id = ?7",
        params![
            case_number,
            case_type,
            purpose,
            current_location,
            notes,
            required_on,
            file_id
        ],
    ) {
        Ok(rows_updated) => {
            if rows_updated == 0 {
                Err("No file found with the provided ID.".into())
            } else {
                Ok(json!({
                    "message": "File updated successfully",
                    "status": "success",
                    "file_id": file_id
                }))
            }
        }
        Err(e) => Err(format!("Failed to update file: {}", e)),
    }
}

//  Update File Notes
#[tauri::command]
pub fn update_file_notes(
    state: State<AppState>,
    file_id: i32,
    new_notes: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE files SET notes = ?1 WHERE file_id = ?2",
        params![new_notes, file_id],
    ) {
        Ok(_) => Ok("Notes updated successfully".to_string()),
        Err(e) => Err(format!("Failed to update notes: {}", e)),
    }
}

// HISTORY SECTION
// Get History of Required On Dates
#[tauri::command]
pub fn get_required_on_history(
    state: State<AppState>,
    file_id: i32,
) -> Result<Vec<(String, String)>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT required_on, note FROM history_required_on_in_files WHERE file_id = ?1 ORDER BY required_on ASC",
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let rows = stmt
        .query_map(params![file_id], |row| {
            let required_on: String = row.get(0)?;
            let note: String = row.get(1)?;
            Ok((required_on, note))
        })
        .map_err(|e| format!("Failed to fetch history: {}", e))?;

    Ok(rows.filter_map(Result::ok).collect())
}

// Get history of notes on a file
#[tauri::command]
pub fn get_notes_history(
    state: State<AppState>,
    file_id: i32,
) -> Result<Vec<(String, i32)>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT note, created_by FROM history_notes_in_files WHERE file_id = ?1 ORDER BY created_at ASC",
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let rows = stmt
        .query_map(params![file_id], |row| {
            let note: String = row.get(0)?;
            let created_by: i32 = row.get(1)?;
            Ok((note, created_by))
        })
        .map_err(|e| format!("Failed to fetch history: {}", e))?;

    Ok(rows.filter_map(Result::ok).collect())
}

// Mark file as returned
#[tauri::command]
pub fn mark_file_returned(
    state: State<AppState>,
    file_id: i32,
    return_date: String,
    return_signature: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE files SET date_returned = ?1, date_returned_signature = ?2 WHERE file_id = ?3",
        params![return_date, return_signature, file_id],
    ) {
        Ok(_) => Ok("File marked as returned".to_string()),
        Err(e) => Err(format!("Failed to update returned info: {}", e)),
    }
}

//  Delete File ( Soft Delete )
#[tauri::command]
pub fn delete_file(state: State<AppState>, file_id: i32) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE files SET deleted = 1 WHERE file_id = ?1",
        params![file_id],
    ) {
        Ok(_) => Ok("File deleted successfully".to_string()),
        Err(e) => Err(format!("Failed to delete file: {}", e)),
    }
}

// Utilizing Indexes

// Search Files By Case Number
#[tauri::command]
pub fn search_files_by_case_number(
    state: State<AppState>,
    case_number: String,
) -> Result<Vec<File>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT file_id, case_number, case_type, purpose, uploaded_by, current_location, notes, date_recieved, required_on, required_on_signature, date_returned, date_returned_signature, deleted 
         FROM files 
         WHERE case_number = ?1 AND deleted = 0",
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let file_iter = stmt
        .query_map(params![case_number], |row| {
            Ok(File {
                file_id: row.get(0)?,
                case_number: row.get(1)?,
                case_type: row.get(2)?,
                purpose: row.get(3)?,
                uploaded_by: row.get(4)?,
                current_location: row.get(5)?,
                notes: row.get(6)?,
                date_recieved: row.get(7)?,
                required_on: row.get(8)?,
                required_on_signature: row.get(9)?,
                date_returned: row.get(10)?,
                date_returned_signature: row.get(11)?,
                deleted: row.get(12)?,
            })
        })
        .map_err(|e| format!("Failed to fetch files: {}", e))?;

    Ok(file_iter.filter_map(Result::ok).collect())
}

// Search Files By User
#[tauri::command]
pub fn filter_files_by_user(state: State<AppState>, user_id: i32) -> Result<Vec<File>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT file_id, case_number, case_type, purpose, uploaded_by, current_location, notes, date_recieved, required_on, required_on_signature, date_returned, date_returned_signature, deleted 
         FROM files 
         WHERE uploaded_by = ?1 AND deleted = 0",
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let file_iter = stmt
        .query_map(params![user_id], |row| {
            Ok(File {
                file_id: row.get(0)?,
                case_number: row.get(1)?,
                case_type: row.get(2)?,
                purpose: row.get(3)?,
                uploaded_by: row.get(4)?,
                current_location: row.get(5)?,
                notes: row.get(6)?,
                date_recieved: row.get(7)?,
                required_on: row.get(8)?,
                required_on_signature: row.get(9)?,
                date_returned: row.get(10)?,
                date_returned_signature: row.get(11)?,
                deleted: row.get(12)?,
            })
        })
        .map_err(|e| format!("Failed to fetch files: {}", e))?;

    Ok(file_iter.filter_map(Result::ok).collect())
}

// Search Files By Purpose
#[tauri::command]
pub fn get_files_by_purpose(state: State<AppState>, purpose: String) -> Result<Vec<File>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT file_id, case_number, case_type, purpose, uploaded_by, current_location, notes, date_recieved, required_on, required_on_signature, date_returned, date_returned_signature, deleted 
         FROM files 
         WHERE purpose = ?1 AND deleted = 0",
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let file_iter = stmt
        .query_map(params![purpose], |row| {
            Ok(File {
                file_id: row.get(0)?,
                case_number: row.get(1)?,
                case_type: row.get(2)?,
                purpose: row.get(3)?,
                uploaded_by: row.get(4)?,
                current_location: row.get(5)?,
                notes: row.get(6)?,
                date_recieved: row.get(7)?,
                required_on: row.get(8)?,
                required_on_signature: row.get(9)?,
                date_returned: row.get(10)?,
                date_returned_signature: row.get(11)?,
                deleted: row.get(12)?,
            })
        })
        .map_err(|e| format!("Failed to fetch files: {}", e))?;

    Ok(file_iter.filter_map(Result::ok).collect())
}
