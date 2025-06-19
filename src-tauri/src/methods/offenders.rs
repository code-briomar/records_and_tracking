use rusqlite::{params, Connection};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;
use tauri::{AppHandle, State, Window};

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Offender {
    pub offender_id: Option<i64>,
    pub full_name: String,
    pub national_id: Option<String>,
    pub date_of_birth: Option<String>,
    pub gender: Option<String>,
    pub photo_path: Option<String>,
    pub notes: Option<String>,
    pub date_created: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OffenderCase {
    pub id: Option<i64>,
    pub offender_id: i64,
    pub case_id: i64,
}

// Helper: get photo storage dir
fn get_photo_dir(_app: &tauri::AppHandle) -> PathBuf {
    // Use the same logic as get_app_dir in lib.rs
    let app_name = env!("CARGO_PKG_NAME");
    let mut dir = dirs::data_dir().expect("No app data dir");
    dir.push(app_name);
    dir.push("offender_photos");
    std::fs::create_dir_all(&dir).ok();
    dir
}

// List all offenders
#[tauri::command]
pub async fn list_offenders(app: AppHandle) -> Result<Vec<Offender>, String> {
    let db = app.state::<crate::AppState>();
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT offender_id, full_name, national_id, date_of_birth, gender, photo_path, notes, date_created FROM offenders",
        )
        .map_err(|e| e.to_string())?;
    let offenders = stmt
        .query_map([], |row| {
            Ok(Offender {
                offender_id: row.get(0).ok(),
                full_name: row.get(1).unwrap_or_default(),
                national_id: row.get(2).ok(),
                date_of_birth: row.get(3).ok(),
                gender: row.get(4).ok(),
                photo_path: row.get(5).ok(),
                notes: row.get(6).ok(),
                date_created: row.get(7).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(offenders)
}

// Get single offender
#[tauri::command]
pub async fn get_offender(app: AppHandle, offender_id: i64) -> Result<Offender, String> {
    let db = app.state::<crate::AppState>();
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT offender_id, full_name, national_id, date_of_birth, gender, photo_path, notes, date_created FROM offenders WHERE offender_id = ?1",
        )
        .map_err(|e| e.to_string())?;
    let offender = stmt
        .query_row(params![offender_id], |row| {
            Ok(Offender {
                offender_id: row.get(0).ok(),
                full_name: row.get(1).unwrap_or_default(),
                national_id: row.get(2).ok(),
                date_of_birth: row.get(3).ok(),
                gender: row.get(4).ok(),
                photo_path: row.get(5).ok(),
                notes: row.get(6).ok(),
                date_created: row.get(7).ok(),
            })
        })
        .map_err(|e| e.to_string())?;
    Ok(offender)
}

// Create offender (with photo upload)
#[tauri::command]
pub async fn create_offender(
    app: AppHandle,
    full_name: String,
    national_id: Option<String>,
    date_of_birth: Option<String>,
    gender: Option<String>,
    notes: Option<String>,
    photo: Option<Vec<u8>>, // photo as bytes
    photo_filename: Option<String>,
) -> Result<Offender, String> {
    let db = app.state::<crate::AppState>();
    let conn = db.conn.lock().unwrap();
    let mut photo_path: Option<String> = None;
    if let (Some(bytes), Some(filename)) = (photo, photo_filename) {
        let dir = get_photo_dir(&app);
        let mut path = dir.clone();
        path.push(format!("{}_{}", chrono::Utc::now().timestamp(), filename));
        fs::write(&path, &bytes).map_err(|e| e.to_string())?;
        photo_path = Some(path.to_string_lossy().to_string());
    }
    conn.execute(
        "INSERT INTO offenders (full_name, national_id, date_of_birth, gender, photo_path, notes) VALUES (?, ?, ?, ?, ?, ?)",
        params![full_name, national_id, date_of_birth, gender, photo_path, notes],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(Offender {
        offender_id: Some(id),
        full_name,
        national_id,
        date_of_birth,
        gender,
        photo_path,
        notes,
        date_created: None,
    })
}

// Update offender (with optional photo update)
#[tauri::command]
pub async fn update_offender(
    app: AppHandle,
    offender_id: i64,
    full_name: Option<String>,
    national_id: Option<String>,
    date_of_birth: Option<String>,
    gender: Option<String>,
    notes: Option<String>,
    photo: Option<Vec<u8>>, // photo as bytes
    photo_filename: Option<String>,
) -> Result<Offender, String> {
    let db = app.state::<crate::AppState>();
    let conn = db.conn.lock().unwrap();
    let mut photo_path: Option<String> = None;
    if let (Some(bytes), Some(filename)) = (photo, photo_filename) {
        let dir = get_photo_dir(&app);
        let mut path = dir.clone();
        path.push(format!("{}_{}", chrono::Utc::now().timestamp(), filename));
        std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;
        photo_path = Some(path.to_string_lossy().to_string());
        // Remove old photo
        let mut stmt = conn
            .prepare("SELECT photo_path FROM offenders WHERE offender_id = ?1")
            .map_err(|e| e.to_string())?;
        let old_path: Option<String> = stmt.query_row(params![offender_id], |row| row.get(0)).ok();
        if let Some(old) = old_path {
            let _ = std::fs::remove_file(old);
        }
    }

    conn.execute(
        "UPDATE offenders SET full_name = COALESCE(?2, full_name), national_id = COALESCE(?3, national_id), date_of_birth = COALESCE(?4, date_of_birth), gender = COALESCE(?5, gender), notes = COALESCE(?6, notes), photo_path = COALESCE(?7, photo_path) WHERE offender_id = ?1",
        params![offender_id, full_name, national_id, date_of_birth, gender, notes, photo_path],
    ).map_err(|e| e.to_string())?;
    drop(conn); // Explicitly drop the lock before await
                // Instead of calling get_offender (which is async), re-query synchronously here
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT offender_id, full_name, national_id, date_of_birth, gender, photo_path, notes, date_created FROM offenders WHERE offender_id = ?1"
    ).map_err(|e| e.to_string())?;
    let offender = stmt
        .query_row(rusqlite::params![offender_id], |row| {
            Ok(Offender {
                offender_id: row.get(0).ok(),
                full_name: row.get(1).unwrap_or_default(),
                national_id: row.get(2).ok(),
                date_of_birth: row.get(3).ok(),
                gender: row.get(4).ok(),
                photo_path: row.get(5).ok(),
                notes: row.get(6).ok(),
                date_created: row.get(7).ok(),
            })
        })
        .map_err(|e| e.to_string())?;
    Ok(offender)
}

// Delete offender
#[tauri::command]
pub async fn delete_offender(app: AppHandle, offender_id: i64) -> Result<(), String> {
    let db = app.state::<crate::AppState>();
    let conn = db.conn.lock().unwrap();
    // Remove photo file if exists
    let mut stmt = conn
        .prepare("SELECT photo_path FROM offenders WHERE offender_id = ?1")
        .map_err(|e| e.to_string())?;
    let photo_path: Option<String> = stmt.query_row(params![offender_id], |row| row.get(0)).ok();
    if let Some(path) = photo_path {
        let _ = std::fs::remove_file(path);
    }
    conn.execute(
        "DELETE FROM offenders WHERE offender_id = ?1",
        params![offender_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// Download offender photo
#[tauri::command]
pub async fn get_offender_photo(app: AppHandle, offender_id: i64) -> Result<Vec<u8>, String> {
    let db = app.state::<crate::AppState>();
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT photo_path FROM offenders WHERE offender_id = ?1")
        .map_err(|e| e.to_string())?;
    let photo_path: Option<String> = stmt.query_row(params![offender_id], |row| row.get(0)).ok();
    if let Some(path) = photo_path {
        let bytes = std::fs::read(path).map_err(|e| e.to_string())?;
        Ok(bytes)
    } else {
        Err("No photo found".into())
    }
}

// Link offender to case
#[tauri::command]
pub async fn link_offender_case(
    app: AppHandle,
    offender_id: i64,
    case_id: i64,
) -> Result<(), String> {
    let db = app.state::<crate::AppState>();
    let conn = db.conn.lock().unwrap();
    conn.execute(
        "INSERT OR IGNORE INTO offender_cases (offender_id, case_id) VALUES (?1, ?2)",
        params![offender_id, case_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// Unlink offender from case
#[tauri::command]
pub async fn unlink_offender_case(
    app: AppHandle,
    offender_id: i64,
    case_id: i64,
) -> Result<(), String> {
    let db = app.state::<crate::AppState>();
    let conn = db.conn.lock().unwrap();
    conn.execute(
        "DELETE FROM offender_cases WHERE offender_id = ?1 AND case_id = ?2",
        params![offender_id, case_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
