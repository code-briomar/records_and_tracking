use chrono::{DateTime, Utc};
use rusqlite::params;
use rusqlite::Connection;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;

use crate::AppState; // Import AppState

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
#[serde(default)]
pub struct File {
    pub file_id: i32,
    pub case_number: String,
    pub case_type: String,
    pub purpose: String,
    pub uploaded_by: i32,
    pub current_location: String,
    pub notes: Option<String>,
    pub date_recieved: Option<String>,
    pub required_on: Option<String>,
    pub required_on_signature: Option<String>,
    pub date_returned: Option<String>,
    pub date_returned_signature: Option<String>,
    pub deleted: Option<i32>, // ensure type matches Supabase: 0

    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_deleted: Option<bool>,
}

#[tauri::command]
pub async fn sync_files(state: tauri::State<'_, AppState>) -> Result<serde_json::Value, String> {
    use chrono::Utc;
    use rusqlite::params;
    use serde_json::json;

    println!("Starting sync_files");

    // 1. Get pending changes from DB
    let pending_changes = {
        println!("Fetching pending local files from database...");
        let conn = state.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT * FROM files WHERE sync_status = 'pending'")
            .map_err(|e| format!("DB prepare error: {}", e))?;

        let rows = stmt
            .query_map([], |row| {
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
                    is_deleted: None,
                })
            })
            .map_err(|e| format!("DB query_map error: {}", e))?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| format!("DB collect error: {}", e))?;

        println!("Found {} pending files to sync.", rows.len());
        rows
    };

    // 2. Push to Supabase and mark as synced
    for file in &pending_changes {
        println!("Pushing file ID {} to Supabase...", file.file_id);
        let file_data =
            serde_json::to_value(file).map_err(|e| format!("Serialization error: {}", e))?;

        print!("File data: {:?}", file_data); // Log the file data for debugging

        let result = state.supabase.insert("files", &file_data).await;

        eprintln!(" Result: {:?}", &result);
        match result {
            Ok(response) => {
                println!("✅ Insert successful: {:?}", response);
            }
            Err(e) => {
                // Just print the error string directly
                eprintln!("❌ Supabase insert failed: {}", e);
            }
        }

        // println!(
        //     "Successfully pushed file ID {}, marking as synced.",
        //     file.file_id
        // );

        {
            let conn = state.conn.lock().unwrap();
            conn.execute(
                "UPDATE files SET sync_status = 'synced' WHERE file_id = ?",
                params![file.file_id],
            )
            .map_err(|e| format!("DB update sync_status error: {}", e))?;
        }
    }

    // 3. Get last sync time
    println!("Fetching last sync time...");
    let last_sync = {
        let conn = state.conn.lock().unwrap();
        get_last_sync_time(&conn).unwrap_or_else(|_| {
            println!("No last sync time found, using current timestamp.");
            Utc::now()
        })
    };

    // 4. Format timestamp for Supabase (PostgreSQL expects this format)
    let formatted_last_sync = last_sync.format("%Y-%m-%d %H:%M:%S%.6f+00").to_string();
    let last_sync_param = format!("gt.{}", formatted_last_sync);
    println!("Last sync param: {}", last_sync_param);

    // 5. Fetch updated files from Supabase
    println!("Fetching updated files from Supabase...");
    let remote_files = state
        .supabase
        .select::<File>("files", &[("last_modified", &last_sync_param)])
        .await
        .map_err(|e| format!("Supabase select error: {}", e))?;

    println!(
        "✅ Successfully deserialized {} remote files",
        remote_files.len()
    );

    println!("Fetched {} files from Supabase.", remote_files.len());

    // 6. Save remote files locally
    {
        // let conn = state.conn.lock().unwrap();

        let conn = state.conn.lock().unwrap();

        for file in &remote_files {
            println!("\n-- Attempting to save file ID: {} --", file.file_id);
            // println!("Data: {:?}", file); // Log full file for debugging

            // let affected = conn
            //     .execute(
            //         "INSERT INTO files (
            //     file_id, case_number, case_type, purpose, uploaded_by, current_location,
            //     notes, date_recieved, required_on, required_on_signature,
            //     date_returned, date_returned_signature, deleted, sync_status
            // ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'synced')",
            //         params![
            //             file.file_id,
            //             file.case_number,
            //             file.case_type,
            //             file.purpose,
            //             file.uploaded_by,
            //             file.current_location,
            //             file.notes,
            //             file.date_recieved,
            //             file.required_on,
            //             file.required_on_signature,
            //             file.date_returned,
            //             file.date_returned_signature,
            //             file.deleted
            //         ],
            //     )
            //     .map_err(|e| format!("DB insert error for file {}: {}", file.file_id, e))?;

            // println!(
            //     "Inserted/Updated file ID {}. Rows affected: {}",
            //     file.file_id, affected
            // );

            // println!(
            //     "✔️ Saved file {}, rows affected: {}",
            //     file.file_id, affected
            // );

            match conn.execute(
                "INSERT OR REPLACE INTO files (
                file_id, case_number, case_type, purpose, uploaded_by, current_location,
                notes, date_recieved, required_on, required_on_signature,
                date_returned, date_returned_signature, deleted, is_deleted
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
                params![
                    file.file_id,
                    file.case_number,
                    file.case_type,
                    file.purpose,
                    file.uploaded_by,
                    file.current_location,
                    file.notes,
                    file.date_recieved,
                    file.required_on,
                    file.required_on_signature,
                    file.date_returned,
                    file.date_returned_signature,
                    file.deleted,
                    file.is_deleted,
                ],
            ) {
                Ok(rows_affected) => {
                    println!(
                        "Inserted/Updated file ID {}. Rows affected: {}",
                        file.file_id, rows_affected
                    );
                }
                Err(e) => {
                    eprintln!("Failed to insert/update file ID {}: {}", file.file_id, e);
                }
            }
        }
    }

    // 7. Update last sync timestamp
    println!("Updating last sync time...");
    {
        let now = Utc::now();
        let conn = state.conn.lock().unwrap();
        update_last_sync_time(&conn, now)
            .map_err(|e| format!("DB update_last_sync_time error: {}", e))?;
    }

    println!("Sync complete.");
    Ok(json!({ "synced": true }))
}

// Helper Functions
fn get_last_sync_time(conn: &Connection) -> Result<DateTime<Utc>, rusqlite::Error> {
    conn.query_row(
        "SELECT last_sync FROM sync_metadata WHERE id = 1",
        [],
        |row| {
            let timestamp: String = row.get(0)?;
            Ok(DateTime::parse_from_rfc3339(&timestamp)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()))
        },
    )
}

fn update_last_sync_time(conn: &Connection, time: DateTime<Utc>) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT OR REPLACE INTO sync_metadata (id, last_sync) VALUES (1, ?)",
        params![time.to_rfc3339()],
    )?;
    Ok(())
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
                is_deleted: None,
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
            required_on, sync_status
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            case_number,
            case_type,
            purpose,
            uploaded_by,
            current_location,
            notes,
            required_on,
            "pending"
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
                is_deleted: None,
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
                required_on = ?6,
                sync_status = 'pending'

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
        "UPDATE files SET deleted = 1, is_deleted = 1, sync_status='pending' WHERE file_id = ?1",
        params![file_id],
    ) {
        Ok(_) => Ok("File deleted successfully".to_string()),
        Err(e) => Err(format!("Failed to delete file: {}", e)),
    }
}

// Restore File ( Soft Restore )
#[tauri::command]
pub fn restore_file(state: State<AppState>, file_id: i32) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE files SET deleted = 0, is_deleted = 0, sync_status='pending' WHERE file_id = ?1",
        params![file_id],
    ) {
        Ok(_) => Ok("File restored successfully".to_string()),
        Err(e) => Err(format!("Failed to restore file: {}", e)),
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
                is_deleted: None,
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
                is_deleted: None,
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
                is_deleted: None,
            })
        })
        .map_err(|e| format!("Failed to fetch files: {}", e))?;

    Ok(file_iter.filter_map(Result::ok).collect())
}
