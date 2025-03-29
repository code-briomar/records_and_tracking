// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::Connection;
use std::fs;
use std::sync::{Arc, Mutex};

mod methods;
use methods::attendance::*;
use methods::cases::*;
use methods::staff::*;
use methods::users::*;

struct AppState {
    conn: Arc<Mutex<Connection>>,
}

// Initialize Database
fn init_db() -> Result<Arc<Mutex<Connection>>, rusqlite::Error> {
    let package_name = env!("CARGO_PKG_NAME");
    let db_path = format!("{}.db", package_name);

    // Delete the database file if it exists
    // if Path::new(&db_path).exists() {
    //     fs::remove_file(&db_path).expect("Failed to delete existing database file");
    // }

    let conn = Connection::open(&db_path)?;

    // Read and execute schema.sql
    let schema = fs::read_to_string("./schema.sql").expect("Failed to read schema.sql");
    let _ = conn.execute_batch(&schema)?;

    // Read and execute seed.sql
    let seed = fs::read_to_string("./seed.sql").expect("Failed to read seed.sql");
    let __ = conn.execute_batch(&seed)?;

    Ok(Arc::new(Mutex::new(conn))) // Return Arc<Mutex<Connection>>
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let conn = init_db().expect("Failed to initialize database");
    let app_state = AppState { conn };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            create_user,
            get_user,
            get_all_users,
            update_user_status,
            delete_user,
            create_staff,
            get_staff,
            get_all_staff,
            update_staff_status,
            delete_staff,
            get_all_attendance,
            add_attendance,
            get_attendance,
            update_attendance,
            delete_attendance,
            get_attendance_by_staff,
            get_all_cases,
            create_case,
            get_case,
            update_case_status,
            assign_staff_to_case,
            delete_case
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
