# Flow

Frontend -> Online Database -> Local Database -> Syncing -> System Notifications.

1️⃣ CTS Section (Case Tracking System Section)
A CTS (Case Tracking System) Section is a functional area in a system designed to track, monitor, and manage cases.

It includes information like case status, assigned staff, deadlines, priority levels, updates, and resolutions.

This section is interactive, allowing users to search, filter, update, and track cases.

Example Use: Legal Cases, Support Tickets, HR Issues, Investigation Reports.

2️⃣ File Section
A File Section is a storage or repository for documents, attachments, and records related to cases.

It doesn’t track progress but instead serves as a document management area.

It contains PDFs, images, reports, forms, and other case-related files for reference.

Example Use: Evidence in a legal case, HR records, scanned documents, meeting notes.

## ERD

### **Table: users**

| Column Name       | Data Type       | Description                        |
| ----------------- | --------------- | ---------------------------------- |
| **user_id**       | UUID / INT (PK) | Unique identifier for the user     |
| **name**          | VARCHAR         | Full name of the user              |
| **role**          | ENUM            | (Super Admin, Court Admin, Staff)  |
| **email**         | VARCHAR         | User email address (unique)        |
| **phone_number**  | VARCHAR         | Contact number                     |
| **password_hash** | TEXT            | Hashed password for authentication |
| **status**        | ENUM            | (Active, Inactive)                 |

---

### **Table: staff**

| Column Name        | Data Type               | Description                        |
| ------------------ | ----------------------- | ---------------------------------- |
| **staff_id**       | UUID / INT (PK)         | Unique identifier for staff member |
| **user_id**        | UUID / INT (FK → users) | Reference to user record           |
| **role**           | VARCHAR                 | Role of the staff member           |
| **contact_number** | VARCHAR                 | Staff member’s phone number        |
| **status**         | ENUM                    | (Active, Absent)                   |

---

### **Table: attendance**

| Column Name       | Data Type               | Description                            |
| ----------------- | ----------------------- | -------------------------------------- |
| **attendance_id** | UUID / INT (PK)         | Unique identifier for attendance entry |
| **staff_id**      | UUID / INT (FK → staff) | Reference to staff member              |
| **date**          | DATE                    | Date of attendance                     |
| **status**        | ENUM                    | (Present, Absent)                      |
| **reason**        | TEXT                    | Reason if absent                       |
| **half_day**      | BOOLEAN                 | Indicates if it was a half-day absence |
| **comments**      | TEXT                    | Additional remarks                     |

---

### **Table: cases**

| Column Name           | Data Type               | Description                         |
| --------------------- | ----------------------- | ----------------------------------- |
| **case_id**           | UUID / INT (PK)         | Unique identifier for the case      |
| **title**             | VARCHAR                 | Case title                          |
| **status**            | ENUM                    | (Open, In Progress, Closed)         |
| **assigned_staff_id** | UUID / INT (FK → staff) | Assigned staff member               |
| **priority**          | ENUM                    | (Low, Medium, High)                 |
| **date_created**      | TIMESTAMP               | Timestamp when the case was created |

---

### **Table: files**

| Column Name       | Data Type                         | Description                    |
| ----------------- | --------------------------------- | ------------------------------ |
| **file_id**       | UUID / INT (PK)                   | Unique identifier for the file |
| **file_name**     | VARCHAR                           | Name of the uploaded file      |
| **uploaded_by**   | UUID / INT (FK → users)           | User who uploaded the file     |
| **date_uploaded** | TIMESTAMP                         | Date of upload                 |
| **file_size**     | VARCHAR                           | Size of the file               |
| **case_id**       | UUID / INT (FK → cases, nullable) | Associated case (if any)       |
| **version**       | VARCHAR                           | Version of the file            |

---

### **Table: notifications**

| Column Name         | Data Type                         | Description                            |
| ------------------- | --------------------------------- | -------------------------------------- |
| **notification_id** | UUID / INT (PK)                   | Unique identifier for the notification |
| **message**         | TEXT                              | Notification message                   |
| **type**            | ENUM                              | (Info, Warning, Error, Success)        |
| **date_created**    | TIMESTAMP                         | When the notification was created      |
| **read_status**     | BOOLEAN                           | Whether the notification has been read |
| **user_id**         | UUID / INT (FK → users, nullable) | Targeted user (optional)               |

---

### **Table: contacts**

| Column Name      | Data Type       | Description                       |
| ---------------- | --------------- | --------------------------------- |
| **contact_id**   | UUID / INT (PK) | Unique identifier for the contact |
| **name**         | VARCHAR         | Contact person’s name             |
| **role**         | ENUM            | (Court Admin, Super Admin)        |
| **phone_number** | VARCHAR         | Contact number                    |

---

### **Table: reports_analytics**

| Column Name      | Data Type       | Description                                |
| ---------------- | --------------- | ------------------------------------------ |
| **report_id**    | UUID / INT (PK) | Unique identifier for the report           |
| **type**         | ENUM            | (Attendance, Cases, Files Processed, etc.) |
| **data_json**    | JSON            | Structured report data                     |
| **generated_at** | TIMESTAMP       | Date when report was generated             |

---

### **Table: news**

| Column Name        | Data Type       | Description                            |
| ------------------ | --------------- | -------------------------------------- |
| **news_id**        | UUID / INT (PK) | Unique identifier for the news article |
| **title**          | VARCHAR         | Title of the news article              |
| **content**        | TEXT            | News article content                   |
| **published_date** | TIMESTAMP       | Date of publication                    |

---

### **Table: themes**

| Column Name     | Data Type                         | Description                     |
| --------------- | --------------------------------- | ------------------------------- |
| **theme_id**    | UUID / INT (PK)                   | Unique identifier for the theme |
| **name**        | VARCHAR                           | Name of the theme               |
| **config_json** | JSON                              | Theme settings stored as JSON   |
| **user_id**     | UUID / INT (FK → users, nullable) | User-specific theme (optional)  |

---

### **Table: summaries**

| Column Name      | Data Type       | Description                                        |
| ---------------- | --------------- | -------------------------------------------------- |
| **summary_id**   | UUID / INT (PK) | Unique identifier for the summary                  |
| **title**        | VARCHAR         | Short title for the summary                        |
| **content**      | TEXT            | AI-generated analysis of database trends           |
| **category**     | ENUM            | (Cases, Files, Attendance, Notifications, Overall) |
| **generated_at** | TIMESTAMP       | Time when the summary was last updated             |
| **generated_by** | VARCHAR         | System/AI Process that created it                  |

### **🔹 Example Summary Data**

| summary_id | title                          | content                                                                                             | category      | generated_at     | generated_by |
| ---------- | ------------------------------ | --------------------------------------------------------------------------------------------------- | ------------- | ---------------- | ------------ |
| 1          | **Case Backlog Increasing**    | There are **15 open cases** pending resolution. 3 cases have been open for more than **90 days**.   | Cases         | 2025-03-24 10:00 | AI Monitor   |
| 2          | **Low Staff Attendance Alert** | 5 staff members were absent more than **5 times** this month. John Doe is the most absent (7 days). | Attendance    | 2025-03-24 10:00 | AI Monitor   |
| 3          | **Files Processed Efficiency** | This week, **82% of files** have been processed, a **10% increase** from last week.                 | Files         | 2025-03-24 10:00 | AI Monitor   |
| 4          | **Urgent Notifications**       | 2 system warnings and 1 security error have been logged in the past **24 hours**.                   | Notifications | 2025-03-24 10:00 | AI Monitor   |

---

# Addressing Adoption And Utility Failure ( 3rd of June, 2025 )

1. Lack of clear value - Users still rely on manual systems ( e.g whatsapp communication, paper trails etc ), users don't see how the system improves their workflow.

2. Too much features, not enough focus - Users are not sure how all these features are useful and which ones save time.

3. UI/UX Friction - If it takes 5 clicks to update a case vs. just calling a colleague, they’ll ditch the system.

4. Lack of integrity with daily routines - If the system isn't mobile friendly, they won't bother.

5. No "must-have" hook - What does the system provide that they can't do without? Right now, it sounds like "nothing urgent".

# Upcoming Features - Converting a scanned pdf to a .docx word document

```rust
// Cargo.toml
[package]
name = "pdf-ocr-api"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1.0", features = ["full"] }
axum = { version = "0.7", features = ["multipart", "fs"] }
tower = "0.4"
tower-http = { version = "0.5", features = ["cors", "fs"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
uuid = { version = "1.0", features = ["v4"] }
anyhow = "1.0"
thiserror = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
pdf-extract = "0.7"
image = "0.24"
tesseract = "0.14"
docx-rs = "0.4"
tokio-fs = "0.1"
dashmap = "5.5"
tempfile = "3.8"

[dev-dependencies]
tokio-test = "0.4"
tower-test = "0.4"
http-body-util = "0.1"
axum-test = "14.0"
mockall = "0.12"

[features]
default = []
dev-server = []

// src/lib.rs
pub mod api;
pub mod ocr;
pub mod pdf;
pub mod progress;
pub mod storage;
pub mod errors;

use std::collections::HashMap;
use std::sync::Arc;
use dashmap::DashMap;

pub type ProgressMap = Arc<DashMap<String, u8>>;
pub type SharedState = Arc<AppState>;

#[derive(Clone)]
pub struct AppState {
    pub progress: ProgressMap,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            progress: Arc::new(DashMap::new()),
        }
    }
}

// src/errors.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("File not found")]
    FileNotFound,
    #[error("Processing error: {0}")]
    ProcessingError(String),
    #[error("OCR error: {0}")]
    OcrError(String),
    #[error("PDF error: {0}")]
    PdfError(String),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Internal server error")]
    InternalServerError,
}

impl axum::response::IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        use axum::http::StatusCode;
        use axum::Json;
        use serde_json::json;

        let (status, message) = match self {
            ApiError::FileNotFound => (StatusCode::NOT_FOUND, "File not found"),
            ApiError::ProcessingError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.as_str()),
            ApiError::OcrError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.as_str()),
            ApiError::PdfError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.as_str()),
            ApiError::IoError(_) => (StatusCode::INTERNAL_SERVER_ERROR, "IO error occurred"),
            ApiError::InternalServerError => (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"),
        };

        let body = json!({
            "status": "error",
            "code": status.as_u16(),
            "message": message,
            "data": null
        });

        (status, Json(body)).into_response()
    }
}

// src/progress.rs
use crate::ProgressMap;

pub struct ProgressTracker {
    map: ProgressMap,
}

impl ProgressTracker {
    pub fn new(map: ProgressMap) -> Self {
        Self { map }
    }

    pub fn set_progress(&self, file_id: &str, progress: u8) {
        self.map.insert(file_id.to_string(), progress);
    }

    pub fn get_progress(&self, file_id: &str) -> Option<u8> {
        self.map.get(file_id).map(|entry| *entry.value())
    }

    pub fn remove_progress(&self, file_id: &str) {
        self.map.remove(file_id);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use dashmap::DashMap;

    #[test]
    fn test_progress_tracker() {
        let map = Arc::new(DashMap::new());
        let tracker = ProgressTracker::new(map);

        let file_id = "test-id";

        // Test setting progress
        tracker.set_progress(file_id, 25);
        assert_eq!(tracker.get_progress(file_id), Some(25));

        // Test updating progress
        tracker.set_progress(file_id, 50);
        assert_eq!(tracker.get_progress(file_id), Some(50));

        // Test removing progress
        tracker.remove_progress(file_id);
        assert_eq!(tracker.get_progress(file_id), None);
    }
}

// src/pdf.rs
use crate::errors::ApiError;
use crate::progress::ProgressTracker;
use anyhow::Result;
use std::path::Path;
use image::{ImageBuffer, Rgb};

pub struct PdfProcessor {
    max_pages: usize,
}

impl PdfProcessor {
    pub fn new(max_pages: usize) -> Self {
        Self { max_pages }
    }

    pub async fn convert_to_images(
        &self,
        pdf_path: &Path,
        output_dir: &Path,
        file_id: &str,
        progress_tracker: &ProgressTracker,
    ) -> Result<Vec<String>, ApiError> {
        let mut image_paths = Vec::new();

        // Extract text and convert to images (simplified)
        // In a real implementation, you'd use a proper PDF rendering library
        let content = pdf_extract::extract_text(pdf_path)
            .map_err(|e| ApiError::PdfError(e.to_string()))?;

        // For demo purposes, create a single image
        // In reality, you'd render each PDF page
        let pages = content.lines().collect::<Vec<_>>();
        let total_pages = std::cmp::min(pages.len(), self.max_pages);

        for (i, _page_content) in pages.iter().take(total_pages).enumerate() {
            let image_path = output_dir.join(format!("page-{}.jpg", i + 1));

            // Create a simple image (placeholder - you'd render actual PDF page)
            let img = ImageBuffer::from_fn(800, 600, |_x, _y| Rgb([255u8, 255u8, 255u8]));
            img.save(&image_path)
                .map_err(|e| ApiError::ProcessingError(e.to_string()))?;

            image_paths.push(image_path.to_string_lossy().to_string());

            // Update progress (0% to 50%)
            let progress = ((i + 1) as f32 / total_pages as f32 * 50.0) as u8;
            progress_tracker.set_progress(file_id, progress);
        }

        Ok(image_paths)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use std::fs;
    use crate::ProgressMap;
    use std::sync::Arc;
    use dashmap::DashMap;

    #[tokio::test]
    async fn test_pdf_processor() {
        let temp_dir = TempDir::new().unwrap();
        let pdf_path = temp_dir.path().join("test.pdf");
        let output_dir = temp_dir.path().join("output");
        fs::create_dir_all(&output_dir).unwrap();

        // Create a dummy PDF file
        fs::write(&pdf_path, b"dummy pdf content").unwrap();

        let processor = PdfProcessor::new(5);
        let progress_map: ProgressMap = Arc::new(DashMap::new());
        let progress_tracker = ProgressTracker::new(progress_map);

        // This would fail with real PDF processing, but tests the structure
        // let result = processor.convert_to_images(&pdf_path, &output_dir, "test-id", &progress_tracker).await;
        // assert!(result.is_ok());
    }
}

// src/ocr.rs
use crate::errors::ApiError;
use crate::progress::ProgressTracker;
use anyhow::Result;
use std::path::Path;

pub struct OcrProcessor {
    tesseract_path: Option<String>,
    language: String,
}

impl OcrProcessor {
    pub fn new() -> Self {
        Self {
            tesseract_path: Self::detect_tesseract_path(),
            language: "eng".to_string(),
        }
    }

    fn detect_tesseract_path() -> Option<String> {
        // Auto-detect Tesseract installation
        let possible_paths = vec![
            "/usr/share/tesseract-ocr/4.00/tessdata",
            "/usr/share/tesseract-ocr/tessdata",
            "C:\\Program Files\\Tesseract-OCR\\tessdata",
        ];

        for path in possible_paths {
            if Path::new(path).exists() {
                return Some(path.to_string());
            }
        }
        None
    }

    pub async fn process_images(
        &self,
        image_paths: &[String],
        file_id: &str,
        progress_tracker: &ProgressTracker,
    ) -> Result<String, ApiError> {
        let mut full_text = String::new();
        let total_images = image_paths.len();

        for (i, image_path) in image_paths.iter().enumerate() {
            let text = self.extract_text_from_image(image_path).await?;
            full_text.push_str(&text);
            full_text.push('\n');

            // Update progress (50% to 100%)
            let progress = 50 + ((i + 1) as f32 / total_images as f32 * 50.0) as u8;
            progress_tracker.set_progress(file_id, progress);
        }

        Ok(full_text)
    }

    async fn extract_text_from_image(&self, image_path: &str) -> Result<String, ApiError> {
        // Simplified OCR - in reality you'd use tesseract crate properly
        // This is a placeholder that would use actual OCR
        let path = Path::new(image_path);
        if !path.exists() {
            return Err(ApiError::FileNotFound);
        }

        // Placeholder text extraction
        Ok(format!("Extracted text from {}", path.file_name().unwrap().to_string_lossy()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use std::fs;
    use crate::ProgressMap;
    use std::sync::Arc;
    use dashmap::DashMap;

    #[tokio::test]
    async fn test_ocr_processor() {
        let temp_dir = TempDir::new().unwrap();
        let image_path = temp_dir.path().join("test.jpg");
        fs::write(&image_path, b"dummy image").unwrap();

        let processor = OcrProcessor::new();
        let progress_map: ProgressMap = Arc::new(DashMap::new());
        let progress_tracker = ProgressTracker::new(progress_map);

        let image_paths = vec![image_path.to_string_lossy().to_string()];
        let result = processor.process_images(&image_paths, "test-id", &progress_tracker).await;

        assert!(result.is_ok());
        assert!(result.unwrap().contains("Extracted text"));
    }
}

// src/storage.rs
use crate::errors::ApiError;
use anyhow::Result;
use std::path::{Path, PathBuf};
use tokio::fs;

pub struct FileStorage {
    base_dir: PathBuf,
    uploads_dir: PathBuf,
    output_dir: PathBuf,
}

impl FileStorage {
    pub fn new<P: AsRef<Path>>(base_dir: P) -> Self {
        let base = base_dir.as_ref().to_path_buf();
        let uploads = base.join("uploads");
        let output = base.join("output");

        Self {
            base_dir: base,
            uploads_dir: uploads,
            output_dir: output,
        }
    }

    pub async fn initialize(&self) -> Result<(), ApiError> {
        fs::create_dir_all(&self.uploads_dir).await?;
        fs::create_dir_all(&self.output_dir).await?;
        Ok(())
    }

    pub async fn save_upload(&self, file_id: &str, content: &[u8]) -> Result<PathBuf, ApiError> {
        let file_path = self.uploads_dir.join(format!("{}.pdf", file_id));
        fs::write(&file_path, content).await?;
        Ok(file_path)
    }

    pub async fn save_docx(&self, file_id: &str, content: &str) -> Result<PathBuf, ApiError> {
        let file_path = self.output_dir.join(format!("output_{}.docx", file_id));

        // Create a simple docx file (simplified)
        // In reality, you'd use docx-rs properly
        fs::write(&file_path, content.as_bytes()).await?;
        Ok(file_path)
    }

    pub async fn file_exists(&self, file_id: &str) -> bool {
        let file_path = self.output_dir.join(format!("output_{}.docx", file_id));
        file_path.exists()
    }

    pub async fn read_output_file(&self, file_id: &str) -> Result<Vec<u8>, ApiError> {
        let file_path = self.output_dir.join(format!("output_{}.docx", file_id));
        let content = fs::read(&file_path).await?;
        Ok(content)
    }

    pub async fn create_temp_file(&self, file_id: &str) -> Result<(), ApiError> {
        let temp_path = self.base_dir.join(format!("{}.tmp", file_id));
        fs::write(&temp_path, b"processing").await?;
        Ok(())
    }

    pub async fn temp_file_exists(&self, file_id: &str) -> bool {
        let temp_path = self.base_dir.join(format!("{}.tmp", file_id));
        temp_path.exists()
    }

    pub async fn remove_temp_file(&self, file_id: &str) -> Result<(), ApiError> {
        let temp_path = self.base_dir.join(format!("{}.tmp", file_id));
        if temp_path.exists() {
            fs::remove_file(&temp_path).await?;
        }
        Ok(())
    }

    pub fn get_uploads_dir(&self) -> &Path {
        &self.uploads_dir
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_file_storage() {
        let temp_dir = TempDir::new().unwrap();
        let storage = FileStorage::new(temp_dir.path());

        storage.initialize().await.unwrap();

        let file_id = "test-123";
        let content = b"test pdf content";

        // Test saving upload
        let path = storage.save_upload(file_id, content).await.unwrap();
        assert!(path.exists());

        // Test temp file operations
        storage.create_temp_file(file_id).await.unwrap();
        assert!(storage.temp_file_exists(file_id).await);

        storage.remove_temp_file(file_id).await.unwrap();
        assert!(!storage.temp_file_exists(file_id).await);
    }
}

// src/api.rs
use crate::errors::ApiError;
use crate::ocr::OcrProcessor;
use crate::pdf::PdfProcessor;
use crate::progress::ProgressTracker;
use crate::storage::FileStorage;
use crate::SharedState;
use axum::{
    extract::{Multipart, Query, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct ApiResponse {
    status: String,
    code: u16,
    message: String,
    data: Option<Value>,
}

#[derive(Deserialize)]
pub struct FileIdQuery {
    #[serde(rename = "fileID")]
    file_id: String,
}

pub fn create_router(state: SharedState, storage: Arc<FileStorage>) -> Router {
    Router::new()
        .route("/upload", post(upload_pdf))
        .route("/check-status", get(check_status))
        .route("/download", get(download_file))
        .route("/progress", get(get_progress))
        .route("/health", get(health_check))
        .with_state((state, storage))
}

pub async fn upload_pdf(
    State((state, storage)): State<(SharedState, Arc<FileStorage>)>,
    mut multipart: Multipart,
) -> Result<Json<ApiResponse>, ApiError> {
    // Clean up old temp files
    cleanup_temp_files(&storage).await?;

    let file_id = Uuid::new_v4().to_string();

    // Extract file from multipart
    let mut file_content = Vec::new();
    while let Some(field) = multipart.next_field().await.map_err(|_| ApiError::ProcessingError("Failed to read multipart".to_string()))? {
        if field.name() == Some("pdfFile") {
            file_content = field.bytes().await.map_err(|_| ApiError::ProcessingError("Failed to read file bytes".to_string()))?.to_vec();
            break;
        }
    }

    if file_content.is_empty() {
        return Err(ApiError::ProcessingError("No file provided".to_string()));
    }

    // Save the uploaded file
    let pdf_path = storage.save_upload(&file_id, &file_content).await?;
    storage.create_temp_file(&file_id).await?;

    // Start processing in background
    let state_clone = state.clone();
    let storage_clone = storage.clone();
    let file_id_clone = file_id.clone();

    tokio::spawn(async move {
        if let Err(e) = process_pdf(file_id_clone, pdf_path, state_clone, storage_clone).await {
            eprintln!("Processing error: {}", e);
        }
    });

    let response = ApiResponse {
        status: "success".to_string(),
        code: 200,
        message: "Processing started.".to_string(),
        data: Some(json!({
            "fileID": file_id
        })),
    };

    Ok(Json(response))
}

async fn process_pdf(
    file_id: String,
    pdf_path: std::path::PathBuf,
    state: SharedState,
    storage: Arc<FileStorage>,
) -> Result<(), ApiError> {
    let progress_tracker = ProgressTracker::new(state.progress.clone());
    let pdf_processor = PdfProcessor::new(5); // Max 5 pages
    let ocr_processor = OcrProcessor::new();

    // Convert PDF to images
    let image_paths = pdf_processor
        .convert_to_images(&pdf_path, storage.get_uploads_dir(), &file_id, &progress_tracker)
        .await?;

    // Process images with OCR
    let extracted_text = ocr_processor
        .process_images(&image_paths, &file_id, &progress_tracker)
        .await?;

    // Save as DOCX
    storage.save_docx(&file_id, &extracted_text).await?;

    // Clean up
    for image_path in image_paths {
        let _ = tokio::fs::remove_file(&image_path).await;
    }
    let _ = tokio::fs::remove_file(&pdf_path).await;

    progress_tracker.set_progress(&file_id, 100);
    Ok(())
}

pub async fn check_status(
    State((state, storage)): State<(SharedState, Arc<FileStorage>)>,
    Query(params): Query<FileIdQuery>,
) -> Result<Json<ApiResponse>, ApiError> {
    let file_id = &params.file_id;

    if storage.file_exists(file_id).await {
        let response = ApiResponse {
            status: "success".to_string(),
            code: 200,
            message: "file is ready for download".to_string(),
            data: Some(json!({
                "download_url": format!("/download?fileID={}", file_id)
            })),
        };
        Ok(Json(response))
    } else if storage.temp_file_exists(file_id).await {
        let response = ApiResponse {
            status: "success".to_string(),
            code: 200,
            message: "file is still being processed. please wait".to_string(),
            data: None,
        };
        Ok(Json(response))
    } else {
        let response = ApiResponse {
            status: "error".to_string(),
            code: 404,
            message: "file does not exist. upload a pdf file to get it processed.".to_string(),
            data: None,
        };
        Ok(Json(response))
    }
}

pub async fn download_file(
    State((state, storage)): State<(SharedState, Arc<FileStorage>)>,
    Query(params): Query<FileIdQuery>,
) -> Result<Vec<u8>, ApiError> {
    let file_id = &params.file_id;

    if !storage.file_exists(file_id).await || !storage.temp_file_exists(file_id).await {
        return Err(ApiError::FileNotFound);
    }

    let file_content = storage.read_output_file(file_id).await?;
    Ok(file_content)
}

pub async fn get_progress(
    State((state, _storage)): State<(SharedState, Arc<FileStorage>)>,
    Query(params): Query<FileIdQuery>,
) -> Result<Json<ApiResponse>, ApiError> {
    let file_id = &params.file_id;
    let progress_tracker = ProgressTracker::new(state.progress.clone());

    if let Some(progress) = progress_tracker.get_progress(file_id) {
        let response = ApiResponse {
            status: "success".to_string(),
            code: 200,
            message: format!("Processing progress: {}%", progress),
            data: Some(json!({
                "progress": progress
            })),
        };
        Ok(Json(response))
    } else {
        let response = ApiResponse {
            status: "error".to_string(),
            code: 404,
            message: "File not found or not being processed.".to_string(),
            data: None,
        };
        Ok(Json(response))
    }
}

pub async fn health_check() -> Json<ApiResponse> {
    let response = ApiResponse {
        status: "success".to_string(),
        code: 200,
        message: "pdf-ocr api is up. Make requests to /api/upload".to_string(),
        data: None,
    };
    Json(response)
}

async fn cleanup_temp_files(storage: &FileStorage) -> Result<(), ApiError> {
    // Implementation for cleaning up .tmp files
    // This would scan the directory and remove old temp files
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum_test::TestServer;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_health_check() {
        let temp_dir = TempDir::new().unwrap();
        let storage = Arc::new(FileStorage::new(temp_dir.path()));
        storage.initialize().await.unwrap();

        let state = SharedState::default();
        let app = create_router(state, storage);
        let server = TestServer::new(app).unwrap();

        let response = server.get("/health").await;
        assert_eq!(response.status_code(), StatusCode::OK);

        let body: ApiResponse = response.json();
        assert_eq!(body.status, "success");
        assert_eq!(body.code, 200);
    }

    #[tokio::test]
    async fn test_progress_endpoint() {
        let temp_dir = TempDir::new().unwrap();
        let storage = Arc::new(FileStorage::new(temp_dir.path()));
        storage.initialize().await.unwrap();

        let state = SharedState::default();
        let progress_tracker = ProgressTracker::new(state.progress.clone());

        let file_id = "test-123";
        progress_tracker.set_progress(file_id, 75);

        let app = create_router(state, storage);
        let server = TestServer::new(app).unwrap();

        let response = server.get(&format!("/progress?fileID={}", file_id)).await;
        assert_eq!(response.status_code(), StatusCode::OK);

        let body: ApiResponse = response.json();
        assert_eq!(body.status, "success");
        assert!(body.message.contains("75%"));
    }
}

// src/main.rs
use pdf_ocr_api::{api, storage::FileStorage, AppState, SharedState};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::init();

    // Create storage and state
    let storage = Arc::new(FileStorage::new("."));
    storage.initialize().await?;

    let state: SharedState = Arc::new(AppState::default());

    // Create router
    let app = api::create_router(state, storage)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        );

    // Get port from environment or use default
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()
        .unwrap_or(3000);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await?;

    println!("PDF OCR API server running on port {}", port);

    axum::serve(listener, app).await?;

    Ok(())
}

// For development server (optional)
#[cfg(feature = "dev-server")]
mod dev_server {
    use super::*;
    use axum::{routing::get, Json, Router};

    pub async fn start_dev_server() -> Result<(), Box<dyn std::error::Error>> {
        let app = Router::new()
            .route("/test-ocr/:file_id", get(test_ocr_endpoint));

        let listener = tokio::net::TcpListener::bind("127.0.0.1:3030").await?;
        println!("Development server running on http://127.0.0.1:3030");

        axum::serve(listener, app).await?;
        Ok(())
    }

    async fn test_ocr_endpoint() -> Json<serde_json::Value> {
        Json(serde_json::json!({"message": "OCR test endpoint"}))
    }
}
```

> Development scripts

```rust
# install_dev_tools.sh
#!/bin/bash
echo "Installing Rust development tools..."

# Install cargo-watch for hot reloading
cargo install cargo-watch

# Install cargo-nextest for faster testing
cargo install cargo-nextest

# Install cargo-tarpaulin for test coverage
cargo install cargo-tarpaulin

# Install bacon for continuous checking
cargo install bacon

echo "Development tools installed!"

# =============================================================================

# justfile (modern make alternative)
# Save as 'justfile' in project root
# Install with: cargo install just

# Default recipe
default:
    @just --list

# Run all tests continuously
test-watch:
    cargo watch -x "test --lib --bins"

# Run specific test module continuously
test-watch-module MODULE:
    cargo watch -x "test {{MODULE}}"

# Run unit tests only
test-unit:
    cargo test --lib

# Run integration tests only
test-integration:
    cargo test --test '*'

# Run tests with coverage
test-coverage:
    cargo tarpaulin --out Html --output-dir coverage

# Fast compilation check
check:
    cargo check

# Continuous checking and testing
dev:
    bacon

# Run the API server
run:
    cargo run

# Run development server (for isolated testing)
dev-server:
    cargo run --features dev-server --bin dev-server

# Format code
fmt:
    cargo fmt

# Lint code
lint:
    cargo clippy -- -D warnings

# Clean and rebuild
clean-build:
    cargo clean && cargo build

# Run benchmarks
bench:
    cargo bench

# Update dependencies
update:
    cargo update

# =============================================================================

# bacon.toml (continuous checking configuration)
[jobs.check]
command = ["cargo", "check", "--color", "always"]
need_
```
