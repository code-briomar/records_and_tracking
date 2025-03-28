// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::Connection;
use std::fs;
use std::sync::{Arc, Mutex};

// Import the methods module
mod methods;
use methods::users::*; // Import everything from users.rs

struct AppState {
    conn: Arc<Mutex<Connection>>, // Change to Arc<Mutex<Connection>>
}

// User Model
// #[derive(Serialize, Deserialize)]
// struct User {
//     user_id: i32,
//     name: String,
//     role: String,
//     email: String,
//     phone_number: Option<String>,
//     password_hash: String,
//     status: String,
// }

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

// Main Function
fn main() {
    let conn = init_db().expect("Failed to initialize database");
    let app_state = AppState { conn };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            create_user,
            get_user,
            get_all_users,
            update_user_status,
            delete_user
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
