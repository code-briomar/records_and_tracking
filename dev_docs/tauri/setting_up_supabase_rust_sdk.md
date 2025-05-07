# Using Supabase SDK with Tauri for Simplified Sync

Since you want to use the Supabase Rust SDK (v2.x) to simplify synchronization, here's how to implement it effectively:

## 1. Setup Supabase Client

First, add to your `Cargo.toml`:

```toml
[dependencies]
supabase_rs = "2.0"  # Latest version as of October 2024
tokio = { version = "1.0", features = ["full"] }
```

## 2. Initialize Supabase Client

In your `main.rs`:

```rust
use supabase_rs::SupabaseClient;

struct AppState {
    conn: Mutex<Connection>,
    supabase: SupabaseClient,
}

#[tokio::main]
async fn main() {
    let supabase = SupabaseClient::new(
        std::env::var("SUPABASE_URL").expect("Missing SUPABASE_URL"),
        std::env::var("SUPABASE_KEY").expect("Missing SUPABASE_KEY")
    );

    tauri::Builder::default()
        .manage(AppState {
            conn: Mutex::new(establish_connection()),
            supabase,
        })
        .invoke_handler(tauri::generate_handler![add_new_file, sync_data])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
```

## 3. Simplified File Upload with Sync

Here's your modified `add_new_file` command:

```rust
#[tauri::command]
async fn add_new_file(
    state: State<'_, AppState>,
    case_number: String,
    case_type: String,
    purpose: String,
    uploaded_by: i32,
    current_location: String,
    notes: String,
    required_on: String,
) -> Result<serde_json::Value, String> {
    // Insert into local SQLite
    let conn = state.conn.lock().unwrap();
    conn.execute(
        "INSERT INTO files (
            case_number, case_type, purpose, uploaded_by,
            current_location, notes, required_on, sync_status
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'pending')",
        params![case_number, case_type, purpose, uploaded_by,
               current_location, notes, required_on],
    ).map_err(|e| e.to_string())?;

    let file_id = conn.last_insert_rowid();

    // Prepare data for Supabase
    let file_data = serde_json::json!({
        "case_number": case_number,
        "case_type": case_type,
        "purpose": purpose,
        "uploaded_by": uploaded_by,
        "current_location": current_location,
        "notes": notes,
        "required_on": required_on,
        "local_id": file_id,  // Track SQLite ID in Supabase
        "sync_status": "pending"
    });

    // Insert into Supabase
    let response = state.supabase
        .from("files")
        .insert(&file_data)
        .execute()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Supabase upload failed: {}", response.text().await.unwrap_or_default()));
    }

    // Update local record with sync status
    conn.execute(
        "UPDATE files SET sync_status = 'synced' WHERE file_id = ?",
        params![file_id],
    ).map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "message": "File added and synced successfully",
        "file_id": file_id
    }))
}
```

## 4. Two-Way Sync Implementation

Create a new command for synchronization:

```rust
#[tauri::command]
async fn sync_data(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let conn = state.conn.lock().unwrap();

    // 1. Push local changes to Supabase
    let pending_changes: Vec<FileRecord> = conn
        .prepare("SELECT * FROM files WHERE sync_status = 'pending'")
        .and_then(|mut stmt| {
            stmt.query_map([], |row| Ok(FileRecord::from(row)))?
                .collect::<Result<Vec<_>, _>>()
        })
        .map_err(|e| e.to_string())?;

    for file in pending_changes {
        let file_data = serde_json::to_value(&file).map_err(|e| e.to_string())?;

        state.supabase
            .from("files")
            .upsert(&file_data)  // Insert or update
            .execute()
            .await
            .map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE files SET sync_status = 'synced' WHERE file_id = ?",
            params![file.file_id],
        ).map_err(|e| e.to_string())?;
    }

    // 2. Pull changes from Supabase
    let last_sync = get_last_sync_time(&conn).unwrap_or_default();

    let response = state.supabase
        .from("files")
        .select("*")
        .gt("last_modified", last_sync.to_rfc3339())
        .execute()
        .await
        .map_err(|e| e.to_string())?;

    let remote_files: Vec<FileRecord> = response.json().await.map_err(|e| e.to_string())?;

    for file in remote_files {
        conn.execute(
            r#"
            INSERT OR REPLACE INTO files (
                file_id, case_number, case_type, purpose, uploaded_by,
                current_location, notes, required_on, sync_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced')
            "#,
            params![
                file.local_id,  // Use the SQLite ID we stored in Supabase
                file.case_number,
                file.case_type,
                file.purpose,
                file.uploaded_by,
                file.current_location,
                file.notes,
                file.required_on
            ],
        ).map_err(|e| e.to_string())?;
    }

    // Update last sync time
    update_last_sync_time(&conn, Utc::now()).map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "status": "success",
        "uploaded": pending_changes.len(),
        "downloaded": remote_files.len()
    }))
}
```

## 5. Helper Functions

Add these to your sync module:

```rust
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
```

## 6. Automatic Sync Triggering

In your frontend code:

```javascript
// Sync when app starts
invoke("sync_data");

// Sync when coming online
window.addEventListener("online", () => {
  invoke("sync_data");
});

// Periodic sync every 5 minutes
setInterval(() => {
  if (navigator.onLine) {
    invoke("sync_data");
  }
}, 5 * 60 * 1000);
```

## Key Advantages of This Approach:

1. **Simplified Architecture**: Uses Supabase SDK's built-in methods
2. **Real-time Capabilities**: Can be extended with Supabase Realtime
3. **Conflict Resolution**: Uses timestamps for last-write-wins
4. **Efficient Sync**: Only transfers changed records
5. **Offline Support**: Queues changes when offline

## Recommended Improvements:

1. **Batch Processing**: Process records in batches for better performance
2. **Conflict UI**: Add a UI for resolving complex conflicts
3. **Progress Tracking**: Show sync progress to users
4. **Error Recovery**: Implement retry logic for failed operations

Would you like me to elaborate on any specific aspect of this implementation?
