use rusqlite::params;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;

use crate::AppState; // Import AppState

#[derive(Serialize, Deserialize)]
pub struct Notification {
    pub notification_id: i32,
    pub message: String,
    pub notification_type: String, // "Info", "Warning", "Error", "Success"
    pub date_created: String,
    pub read_status: bool,
    pub user_id: Option<i32>,
}

// ✅ Create Notification
#[tauri::command]
pub fn create_notification(
    state: State<AppState>,
    message: String,
    notification_type: String,
    user_id: Option<i32>,
) -> Result<serde_json::Value, String> {
    let conn = state.conn.lock().unwrap();

    match conn.execute(
        "INSERT INTO notifications (message, type, user_id) VALUES (?1, ?2, ?3)",
        params![message, notification_type, user_id],
    ) {
        Ok(_) => {
            let new_notification_id = conn.last_insert_rowid();
            Ok(json!({
                "message": "Notification created successfully",
                "status": "success",
                "notification_id": new_notification_id
            }))
        }
        Err(e) => Err(format!("Failed to create notification: {}", e)),
    }
}

// ✅ Get All Notifications
#[tauri::command]
pub fn get_all_notifications(state: State<AppState>) -> Result<Vec<Notification>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT notification_id, message, type, date_created, read_status, user_id FROM notifications ORDER BY date_created DESC",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let notification_iter = stmt
        .query_map([], |row| {
            Ok(Notification {
                notification_id: row.get(0)?,
                message: row.get(1)?,
                notification_type: row.get(2)?,
                date_created: row.get(3)?,
                read_status: row.get(4)?,
                user_id: row.get(5)?,
            })
        })
        .map_err(|e| format!("Failed to fetch notifications: {}", e))?;

    let notifications: Vec<Notification> = notification_iter.filter_map(Result::ok).collect();

    Ok(notifications)
}

// ✅ Get Notification by ID
#[tauri::command]
pub fn get_notification(
    state: State<AppState>,
    notification_id: i32,
) -> Result<Option<Notification>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT notification_id, message, type, date_created, read_status, user_id FROM notifications WHERE notification_id = ?1",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let notification = stmt
        .query_row(params![notification_id], |row| {
            Ok(Notification {
                notification_id: row.get(0)?,
                message: row.get(1)?,
                notification_type: row.get(2)?,
                date_created: row.get(3)?,
                read_status: row.get(4)?,
                user_id: row.get(5)?,
            })
        })
        .optional()
        .map_err(|e| format!("Failed to fetch notification: {}", e))?;

    Ok(notification)
}

// ✅ Mark Notification as Read
#[tauri::command]
pub fn mark_notification_as_read(
    state: State<AppState>,
    notification_id: i32,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE notifications SET read_status = 1 WHERE notification_id = ?1",
        params![notification_id],
    ) {
        Ok(_) => Ok("Notification marked as read".to_string()),
        Err(e) => Err(format!("Failed to mark notification as read: {}", e)),
    }
}

// ✅ Delete Notification
#[tauri::command]
pub fn delete_notification(state: State<AppState>, notification_id: i32) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "DELETE FROM notifications WHERE notification_id = ?1",
        params![notification_id],
    ) {
        Ok(_) => Ok("Notification deleted successfully".to_string()),
        Err(e) => Err(format!("Failed to delete notification: {}", e)),
    }
}
