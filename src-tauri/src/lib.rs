// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
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
use methods::offenders::*;
use methods::staff::*;
use methods::users::*;

use std::path::Path;

use chrono::Local;
use dirs::data_dir;
use std::fs::OpenOptions;
use std::io::Write;

use tauri::utils::platform::resource_dir;
use tauri::{generate_context, Env};
// use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_updater::UpdaterExt;

// extern crate embed_resource;
struct AppState {
    conn: Arc<Mutex<Connection>>,
    // supabase: Option<SupabaseClient>,
    supabase: SupabaseClient,
}

// fn embed_resources() {
//     #[cfg(windows)]
//     {
//         let host = std::env::var("HOST").unwrap_or_else(|_| {
//             let fallback = "x86_64-pc-windows-msvc".to_string();
//             println!("⚠️ HOST not set, using fallback: {}", &fallback);
//             std::env::set_var("HOST", &fallback);
//             fallback
//         });

//         let target = std::env::var("TARGET").unwrap_or_else(|_| {
//             let fallback = "x86_64-pc-windows-msvc".to_string();
//             println!("⚠️ TARGET not set, using fallback: {}", &fallback);
//             std::env::set_var("TARGET", &fallback);
//             fallback
//         });

//         println!("HOST is: {}", host);
//         println!("TARGET is: {}", target);
//         println!("cargo:rerun-if-changed=records_and_tracking_manifest.rc");
//         embed_resource::compile("records_and_tracking_manifest.rc", embed_resource::NONE)
//             .manifest_optional()
//             .unwrap();
//     }
// }

fn log_startup(message: &str) {
    let log_path = Path::new("app.log");
    if let Ok(mut log_file) = OpenOptions::new().create(true).append(true).open(log_path) {
        let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S");
        writeln!(log_file, "[INFO {}] {}", timestamp, message).ok();
    }
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

    let is_new_db = !db_path.exists();

    println!("📂 Database path: {}", db_path.display());
    log_startup(&format!("📂 Database path: {}", db_path.display()));

    println!("📂 Is new DB: {}", is_new_db);
    log_startup(&format!("📂 Is new DB: {}", is_new_db));

    println!("📂 App directory: {}", app_dir.display());
    log_startup(&format!("📂 App directory: {}", app_dir.display()));

    if is_new_db {
        let context: tauri::Context<tauri::Wry> = generate_context!();
        let env = Env::default();
        let res_dir =
            resource_dir(context.package_info(), &env).expect("❌ Failed to get resource dir");
        let schema_path = res_dir.join("schema.sql");

        log_startup(&format!(
            "📄 Reading schema from: {}",
            schema_path.display()
        ));

        let schema =
            fs::read_to_string(&schema_path).expect("❌ Failed to read bundled schema.sql");

        let conn = Connection::open(&db_path)?;
        conn.execute_batch(&schema)?;
        log_startup("✅ New DB created and initialized");
        Ok(Arc::new(Mutex::new(conn)))
    } else {
        let conn = Connection::open(&db_path)?;
        log_startup("✅ Opened existing DB");
        Ok(Arc::new(Mutex::new(conn)))
    }
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

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        // alternatively we could also call update.download() and update.install() separately
        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                    log_startup(&format!("downloaded {downloaded} from {content_length:?}"));
                },
                || {
                    println!("download finished");
                    log_startup("download finished");
                },
            )
            .await?;

        println!("update installed");
        log_startup("update installed");
        app.restart();
    } else {
        println!("no update available");
        log_startup("no update available");
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    log_startup("🔄 Application starting...");

    let conn = init_db().expect("❌ Failed to initialize database");
    log_startup("✅ Database initialization complete.");

    // IT WEIDLY STOPS LOGGING AFTER THIS POINT

    // Load .env
    // dotenv::dotenv().expect("❌ Failed to load .env file");
    // log_startup("📦 Loaded .env configuration");

    // Configure Supabase
    let supabase = SupabaseClient::new();
    log_startup("✅ Supabase client configured");

    let app_state = AppState { conn, supabase };

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        // .plugin(
        //     tauri_plugin_log::Builder::new()
        //         .targets([
        //             Target::new(TargetKind::Stdout),
        //             Target::new(TargetKind::LogDir { file_name: None }),
        //             Target::new(TargetKind::Webview),
        //         ])
        //         .build(),
        // )
        .manage(app_state)
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                // Start the synchronization loop
                start_sync_loop(handle.clone()).await;

                // Proceed to update after the sync loop completes
                if let Err(e) = update(handle).await {
                    log_startup(&format!("Update failed: {:?}", e));
                    eprintln!("Update failed: {:?}", e);
                }
            });

            log_startup("🔁 Sync loop started");
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
            restore_file,
            create_notification,
            get_all_notifications,
            get_notification,
            mark_notification_as_read,
            delete_notification,
            list_offenders,
            get_offender,
            create_offender,
            update_offender,
            delete_offender,
            get_offender_photo,
            list_offender_history,
            add_offender_history,
            update_offender_history,
            delete_offender_history,
        ])
        // link_offender_case,
        //     unlink_offender_case,
        .run(tauri::generate_context!())
        .expect("❌ Error while running Tauri application");

    log_startup("🚀 Application run completed.");
}
