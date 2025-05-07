// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

mod methods;
use methods::attendance::*;
use methods::cases::*;
use methods::files::*;
use methods::notifications::*;
use methods::staff::*;
use methods::users::*;

use std::path::Path;

use chrono::Local;
use dirs::data_dir;
use std::fs::OpenOptions;
use std::io::Write;

use tauri::utils::platform::resource_dir;
use tauri::{generate_context, Env};

struct AppState {
    conn: Arc<Mutex<Connection>>,
}

fn log_startup(message: &str) {
    let log_path = Path::new("app.log");
    let mut log_file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
        .expect("❌ Failed to open app.log");

    let timestamp = Local::now();
    writeln!(
        log_file,
        "[{}] {}",
        timestamp.format("%Y-%m-%d %H:%M:%S"),
        message
    )
    .expect("❌ Failed to write to app.log");
}

fn get_app_dir() -> PathBuf {
    let app_name = env!("CARGO_PKG_NAME");
    let mut dir = data_dir().expect("❌ Could not find user data directory");
    dir.push(app_name);
    fs::create_dir_all(&dir).expect("❌ Failed to create app data directory");
    dir
}

fn init_db() -> Result<Arc<Mutex<Connection>>, rusqlite::Error> {
    let app_dir = get_app_dir();

    let db_path = app_dir.join("records_and_tracking.db");
    let log_path = app_dir.join("app.log");

    let mut log = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .expect("❌ Failed to create/open log file");

    let is_new_db = !db_path.exists();

    if is_new_db {
        let context: tauri::Context<tauri::Wry> = generate_context!();
        let env = Env::default();
        let res_dir =
            resource_dir(context.package_info(), &env).expect("❌ Failed to get resource dir");

        let schema_path = res_dir.join("schema.sql");

        writeln!(log, "📄 Reading schema from: {}", schema_path.display()).ok();

        let schema =
            fs::read_to_string(&schema_path).expect("❌ Failed to read bundled schema.sql");

        let conn = Connection::open(&db_path)?;
        conn.execute_batch(&schema)?;
        writeln!(log, "✅ New DB created and initialized").ok();
        Ok(Arc::new(Mutex::new(conn)))
    } else {
        let conn = Connection::open(&db_path)?;
        writeln!(log, "✅ Opened existing DB").ok();
        Ok(Arc::new(Mutex::new(conn)))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    log_startup("🔄 Application starting...");
    let conn = init_db().expect("Failed to initialize database");

    writeln!(
        OpenOptions::new()
            .create(true)
            .append(true)
            .open("app.log")
            .expect("❌ Failed to open app.log"),
        "🔄 Application started successfully."
    )
    .expect("❌ Failed to write to app.log");

    let app_state = AppState { conn };

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(app_state)
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
