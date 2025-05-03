// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::Connection;
use std::fs;
use std::sync::{Arc, Mutex};
use tauri::AppHandle;
use tauri::Manager;
use tokio::time::{sleep, Duration}; // ✅ Explicitly use tokio::sleep

mod config;
mod methods;
use config::supabase::SupabaseClient;
use methods::attendance::*;
use methods::cases::*;
use methods::files::*;
use methods::notifications::*;
use methods::staff::*;
use methods::users::*;

struct AppState {
    conn: Arc<Mutex<Connection>>,
    // supabase: Option<SupabaseClient>,
    supabase: SupabaseClient,
}

use std::path::Path;

fn init_db() -> Result<Arc<Mutex<Connection>>, rusqlite::Error> {
    let package_name = env!("CARGO_PKG_NAME");
    let db_path = format!("{}.db", package_name);
    let is_new_db = !Path::new(&db_path).exists();

    let conn = Connection::open(&db_path)?;

    if is_new_db {
        // Initialize schema only if DB doesn't exist
        let schema = fs::read_to_string("./schema.sql").expect("Failed to read schema.sql");
        conn.execute_batch(&schema)?;

        // Optionally seed initial data
        let seed = fs::read_to_string("./seed.sql").expect("Failed to read seed.sql");
        conn.execute_batch(&seed)?;
    }

    Ok(Arc::new(Mutex::new(conn)))
}

// Data Syncing
async fn is_online() -> bool {
    reqwest::get("https://www.google.com")
        .await
        .map(|res| res.status().is_success())
        .unwrap_or(false)
}

async fn start_sync_loop(app_handle: AppHandle) {
    loop {
        if is_online().await {
            let state = app_handle.state::<AppState>().clone();
            if let Err(e) = sync_files(state).await {
                eprintln!("Sync failed: {}", e);
            }
        } else {
            println!("Offline, skipping sync.");
        }

        sleep(Duration::from_secs(300)).await;
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load .env
    dotenv::dotenv().expect("Failed to load .env file");

    // Configure Supabase
    let supabase = SupabaseClient::new(
        &std::env::var("SUPABASE_URL").expect("SUPABASE_URL not set"),
        &std::env::var("SUPABASE_KEY").expect("SUPABASE_KEY not set"),
        &std::env::var("SUPABASE_TOKEN").expect("SUPABASE_TOKEN not set"),
    );

    let conn = init_db().expect("Failed to initialize database");
    let app_state = AppState { conn, supabase };

    tauri::Builder::default()
        .manage(app_state)
        .setup(|app| {
            let handle = app.handle().clone();

            tauri::async_runtime::spawn(start_sync_loop(handle.clone()));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_user,
            get_user,
            get_user_by_email,
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
            delete_case,
            sync_files,
            get_all_files,
            add_new_file,
            update_file,
            update_file_date,
            get_file_by_id,
            delete_file,
            create_notification,
            get_all_notifications,
            get_notification,
            mark_notification_as_read,
            delete_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
