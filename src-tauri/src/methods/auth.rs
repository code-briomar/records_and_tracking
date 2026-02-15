use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use serde_json::json;
use sha2::{Digest, Sha256};
use tauri::AppHandle;
use tauri::Manager;

use crate::AppState;
use crate::config::firebase::{
    CollectionSelector, Filter, FirestoreValue, StructuredQuery,
};

/// Hash a password with salt using SHA-256, matching the mobile app's AuthRepository.hashPassword()
fn hash_password(password: &str, salt: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(salt);
    hasher.update(password.as_bytes());
    let result = hasher.finalize();
    BASE64.encode(result)
}

#[tauri::command]
pub async fn firebase_login(
    app: AppHandle,
    email: String,
    password: String,
    court_id: Option<String>,
) -> Result<serde_json::Value, String> {
    let state = app.state::<AppState>();

    let court_id = court_id.ok_or_else(|| "Court ID is required.".to_string())?;

    // Query Firestore for user by email in courts/{courtId}/users
    let parent = format!("courts/{}", court_id);
    let query = StructuredQuery {
        from: vec![CollectionSelector {
            collection_id: "users".to_string(),
        }],
        r#where: Some(Filter::field(
            "email",
            "EQUAL",
            FirestoreValue::string(&email),
        )),
        order_by: None,
        limit: Some(1),
        offset: None,
    };

    let docs = state
        .firestore
        .run_query(&parent, query)
        .await
        .map_err(|e| format!("Failed to query users: {}", e))?;

    let doc = docs
        .first()
        .ok_or_else(|| "No account found with that email in this court.".to_string())?;

    let fields = &doc.fields;

    // Extract passwordHash and salt
    let stored_hash = fields
        .get("passwordHash")
        .and_then(|v| v.as_string())
        .ok_or_else(|| "User record missing password hash.".to_string())?;

    let salt_b64 = fields
        .get("salt")
        .and_then(|v| v.as_string())
        .ok_or_else(|| "User record missing salt.".to_string())?;

    let salt_bytes = BASE64
        .decode(salt_b64)
        .map_err(|e| format!("Invalid salt encoding: {}", e))?;

    // Hash the provided password and compare
    let computed_hash = hash_password(&password, &salt_bytes);

    if computed_hash != stored_hash {
        return Err("Invalid password.".to_string());
    }

    // Check user status
    let status = fields
        .get("status")
        .and_then(|v| v.as_string())
        .unwrap_or("ACTIVE");

    if status != "ACTIVE" {
        return Err("Account is not active. Please contact administrator.".to_string());
    }

    // Authentication successful — store court_id and user_email
    {
        let mut court = state.court_id.write().map_err(|e| e.to_string())?;
        *court = Some(court_id.clone());
    }
    {
        let mut user = state.user_email.write().map_err(|e| e.to_string())?;
        *user = Some(email.clone());
    }

    let full_name = fields
        .get("fullName")
        .and_then(|v| v.as_string())
        .unwrap_or("");
    let role = fields
        .get("role")
        .and_then(|v| v.as_string())
        .unwrap_or("");

    println!("Login successful: {} (court: {})", email, court_id);

    Ok(json!({
        "success": true,
        "court_id": court_id,
        "full_name": full_name,
        "role": role,
        "message": "Login successful"
    }))
}

#[tauri::command]
pub async fn firebase_logout(app: AppHandle) -> Result<serde_json::Value, String> {
    let state = app.state::<AppState>();
    {
        let mut court = state.court_id.write().map_err(|e| e.to_string())?;
        *court = None;
    }
    {
        let mut user = state.user_email.write().map_err(|e| e.to_string())?;
        *user = None;
    }

    Ok(json!({
        "success": true,
        "message": "Logged out successfully"
    }))
}

#[tauri::command]
pub async fn set_court_id(app: AppHandle, court_id: String) -> Result<serde_json::Value, String> {
    let state = app.state::<AppState>();
    {
        let mut court = state.court_id.write().map_err(|e| e.to_string())?;
        *court = Some(court_id.clone());
    }

    Ok(json!({
        "success": true,
        "court_id": court_id,
        "message": "Court ID set successfully"
    }))
}

#[tauri::command]
pub async fn get_courts(app: AppHandle) -> Result<serde_json::Value, String> {
    let state = app.state::<AppState>();

    let list_resp = state
        .firestore
        .list_documents("courts", Some(100), None)
        .await?;

    let courts: Vec<serde_json::Value> = list_resp
        .documents
        .iter()
        .map(|doc| {
            let court_id = crate::config::firebase::extract_document_id(&doc.name);
            let name = doc
                .fields
                .get("name")
                .and_then(|v| v.as_string())
                .unwrap_or("Unknown");
            let location = doc
                .fields
                .get("location")
                .and_then(|v| v.as_string())
                .unwrap_or("");
            let is_active = doc
                .fields
                .get("isActive")
                .and_then(|v| v.as_boolean())
                .unwrap_or(true);

            json!({
                "court_id": court_id,
                "name": name,
                "location": location,
                "is_active": is_active,
            })
        })
        .collect();

    Ok(json!({ "courts": courts }))
}

#[tauri::command]
pub async fn trigger_sync(app: AppHandle) -> Result<serde_json::Value, String> {
    let state = app.state::<AppState>();

    let has_auth = state
        .user_email
        .read()
        .map(|guard| guard.is_some())
        .unwrap_or(false);

    if !has_auth {
        return Err("Not authenticated. Please log in first.".to_string());
    }

    let engine = crate::sync::engine::SyncEngine::new(
        state.firestore.clone(),
        state.conn.clone(),
        state.court_id.clone(),
    );

    let result = engine.sync_all().await?;

    Ok(json!({
        "success": true,
        "message": result
    }))
}
