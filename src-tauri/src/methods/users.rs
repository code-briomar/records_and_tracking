use rusqlite::params;
use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};

use tauri::State;

use crate::AppState; // Import AppState

#[derive(Serialize, Deserialize)]
pub struct User {
    pub user_id: i32,
    pub name: String,
    pub role: String,
    pub email: String,
    pub phone_number: Option<String>,
    pub password_hash: String,
    pub status: String,
}

// Get All Users
#[tauri::command]
pub fn get_all_users(state: State<AppState>) -> Result<Vec<User>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT user_id, name, role, email, phone_number, password_hash, status FROM users",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let user_iter = stmt
        .query_map([], |row| {
            Ok(User {
                user_id: row.get(0)?,
                name: row.get(1)?,
                role: row.get(2)?,
                email: row.get(3)?,
                phone_number: row.get(4)?,
                password_hash: row.get(5)?,
                status: row.get(6)?,
            })
        })
        .map_err(|e| format!("Failed to fetch users: {}", e))?;

    let users: Vec<User> = user_iter.filter_map(Result::ok).collect();

    Ok(users)
}

// Create User & Return user_id
#[tauri::command]
pub fn create_user(
    state: State<AppState>,
    name: String,
    role: String,
    email: String,
    phone_number: Option<String>,
    password_hash: String,
    professional_title: Option<String>,
) -> Result<i64, String> {
    let conn = state.conn.lock().unwrap();

    match conn.execute(
        "INSERT INTO users (name, role, email, phone_number, password_hash, professional_title, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'Active')",
        params![name, role, email, phone_number, password_hash, professional_title],
    ) {
        Ok(_) => {
            let user_id = conn.last_insert_rowid();
            Ok(user_id)
        }
        Err(e) => Err(format!("Failed to create user: {}", e)),
    }
}

// Get User by ID
#[tauri::command]
pub fn get_user(state: State<AppState>, user_id: i32) -> Result<Option<User>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT user_id, name, role, email, phone_number, password_hash, status FROM users WHERE user_id = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let user = stmt
        .query_row(params![user_id], |row| {
            Ok(User {
                user_id: row.get(0)?,
                name: row.get(1)?,
                role: row.get(2)?,
                email: row.get(3)?,
                phone_number: row.get(4)?,
                password_hash: row.get(5)?,
                status: row.get(6)?,
            })
        })
        .optional()
        .map_err(|e| format!("Failed to fetch user: {}", e))?;

    Ok(user)
}

// Get User by Email
#[tauri::command]
pub fn get_user_by_email(state: State<AppState>, email: String) -> Result<Option<User>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT user_id, name, role, email, phone_number, password_hash, status FROM users WHERE email = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let user = stmt
        .query_row(params![email], |row| {
            Ok(User {
                user_id: row.get(0)?,
                name: row.get(1)?,
                role: row.get(2)?,
                email: row.get(3)?,
                phone_number: row.get(4)?,
                password_hash: row.get(5)?,
                status: row.get(6)?,
            })
        })
        .optional()
        .map_err(|e| format!("Failed to fetch user: {}", e))?;

    Ok(user)
}
// Update User Status
#[tauri::command]
pub fn update_user_status(
    state: State<AppState>,
    user_id: i32,
    new_status: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "UPDATE users SET status = ?1 WHERE user_id = ?2",
        params![new_status, user_id],
    ) {
        Ok(_) => Ok("User status updated".to_string()),
        Err(e) => Err(format!("Failed to update user status: {}", e)),
    }
}

// Delete User
#[tauri::command]
pub fn delete_user(state: State<AppState>, user_id: i32) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute("DELETE FROM users WHERE user_id = ?1", params![user_id]) {
        Ok(_) => Ok("User deleted successfully".to_string()),
        Err(e) => Err(format!("Failed to delete user: {}", e)),
    }
}
