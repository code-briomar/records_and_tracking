use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================================================
// Firestore Value Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FirestoreValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub string_value: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub integer_value: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub double_value: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub boolean_value: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timestamp_value: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub null_value: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map_value: Option<MapValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapValue {
    pub fields: HashMap<String, FirestoreValue>,
}

impl FirestoreValue {
    pub fn string(val: &str) -> Self {
        FirestoreValue {
            string_value: Some(val.to_string()),
            ..Default::default()
        }
    }

    pub fn integer(val: i64) -> Self {
        FirestoreValue {
            integer_value: Some(val.to_string()),
            ..Default::default()
        }
    }

    pub fn double(val: f64) -> Self {
        FirestoreValue {
            double_value: Some(val),
            ..Default::default()
        }
    }

    pub fn boolean(val: bool) -> Self {
        FirestoreValue {
            boolean_value: Some(val),
            ..Default::default()
        }
    }

    pub fn timestamp(val: &str) -> Self {
        FirestoreValue {
            timestamp_value: Some(val.to_string()),
            ..Default::default()
        }
    }

    pub fn null() -> Self {
        FirestoreValue {
            null_value: Some("NULL_VALUE".to_string()),
            ..Default::default()
        }
    }

    pub fn as_string(&self) -> Option<&str> {
        self.string_value.as_deref()
    }

    pub fn as_integer(&self) -> Option<i64> {
        self.integer_value.as_ref().and_then(|v| v.parse().ok())
    }

    pub fn as_boolean(&self) -> Option<bool> {
        self.boolean_value
    }

    pub fn as_timestamp(&self) -> Option<&str> {
        self.timestamp_value.as_deref()
    }

    pub fn as_double(&self) -> Option<f64> {
        self.double_value
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FirestoreDocument {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub fields: HashMap<String, FirestoreValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub create_time: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub update_time: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListDocumentsResponse {
    #[serde(default)]
    pub documents: Vec<FirestoreDocument>,
    pub next_page_token: Option<String>,
}

// Structured query types for Firestore
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StructuredQuery {
    pub from: Vec<CollectionSelector>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#where: Option<Filter>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order_by: Option<Vec<OrderBy>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub offset: Option<i32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionSelector {
    pub collection_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Filter {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field_filter: Option<FieldFilter>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub composite_filter: Option<CompositeFilter>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldFilter {
    pub field: FieldReference,
    pub op: String,
    pub value: FirestoreValue,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompositeFilter {
    pub op: String,
    pub filters: Vec<Filter>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldReference {
    pub field_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderBy {
    pub field: FieldReference,
    pub direction: String,
}

impl Filter {
    pub fn field(field_path: &str, op: &str, value: FirestoreValue) -> Self {
        Filter {
            field_filter: Some(FieldFilter {
                field: FieldReference {
                    field_path: field_path.to_string(),
                },
                op: op.to_string(),
                value,
            }),
            composite_filter: None,
        }
    }

    pub fn and(filters: Vec<Filter>) -> Self {
        Filter {
            field_filter: None,
            composite_filter: Some(CompositeFilter {
                op: "AND".to_string(),
                filters,
            }),
        }
    }
}

impl OrderBy {
    pub fn asc(field_path: &str) -> Self {
        OrderBy {
            field: FieldReference {
                field_path: field_path.to_string(),
            },
            direction: "ASCENDING".to_string(),
        }
    }
}

// Query response types
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RunQueryResponseItem {
    pub document: Option<FirestoreDocument>,
}

// ============================================================================
// Firestore Client (API-key-only, no bearer tokens)
// ============================================================================

#[derive(Clone)]
pub struct FirestoreClient {
    client: Client,
    project_id: String,
    api_key: String,
}

impl FirestoreClient {
    pub fn new(project_id: &str, api_key: &str) -> Self {
        FirestoreClient {
            client: Client::new(),
            project_id: project_id.to_string(),
            api_key: api_key.to_string(),
        }
    }

    fn base_url(&self) -> String {
        format!(
            "https://firestore.googleapis.com/v1/projects/{}/databases/(default)/documents",
            self.project_id
        )
    }

    fn url_with_key(&self, path: &str) -> String {
        format!("{}/{}?key={}", self.base_url(), path, self.api_key)
    }

    pub async fn get_document(
        &self,
        path: &str,
    ) -> Result<FirestoreDocument, String> {
        let url = self.url_with_key(path);

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Firestore GET failed: {}", e))?;

        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if !status.is_success() {
            return Err(format!("Firestore GET error (HTTP {}): {}", status, text));
        }

        serde_json::from_str(&text)
            .map_err(|e| format!("Failed to parse Firestore document: {}", e))
    }

    pub async fn create_document(
        &self,
        collection_path: &str,
        document_id: &str,
        fields: &HashMap<String, FirestoreValue>,
    ) -> Result<FirestoreDocument, String> {
        let url = format!(
            "{}/{}?documentId={}&key={}",
            self.base_url(),
            collection_path,
            document_id,
            self.api_key
        );

        let body = serde_json::json!({ "fields": fields });

        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Firestore CREATE failed: {}", e))?;

        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if !status.is_success() {
            return Err(format!(
                "Firestore CREATE error (HTTP {}): {}",
                status, text
            ));
        }

        serde_json::from_str(&text)
            .map_err(|e| format!("Failed to parse Firestore response: {}", e))
    }

    pub async fn update_document(
        &self,
        path: &str,
        fields: &HashMap<String, FirestoreValue>,
    ) -> Result<FirestoreDocument, String> {
        let url = self.url_with_key(path);

        let body = serde_json::json!({ "fields": fields });

        let response = self
            .client
            .patch(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Firestore UPDATE failed: {}", e))?;

        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if !status.is_success() {
            return Err(format!(
                "Firestore UPDATE error (HTTP {}): {}",
                status, text
            ));
        }

        serde_json::from_str(&text)
            .map_err(|e| format!("Failed to parse Firestore response: {}", e))
    }

    pub async fn delete_document(&self, path: &str) -> Result<(), String> {
        let url = self.url_with_key(path);

        let response = self
            .client
            .delete(&url)
            .send()
            .await
            .map_err(|e| format!("Firestore DELETE failed: {}", e))?;

        let status = response.status();
        if !status.is_success() {
            let text = response.text().await.map_err(|e| e.to_string())?;
            return Err(format!(
                "Firestore DELETE error (HTTP {}): {}",
                status, text
            ));
        }

        Ok(())
    }

    pub async fn list_documents(
        &self,
        collection_path: &str,
        page_size: Option<i32>,
        page_token: Option<&str>,
    ) -> Result<ListDocumentsResponse, String> {
        let mut url = format!(
            "{}/{}?key={}",
            self.base_url(),
            collection_path,
            self.api_key
        );

        if let Some(size) = page_size {
            url = format!("{}&pageSize={}", url, size);
        }
        if let Some(pt) = page_token {
            url = format!("{}&pageToken={}", url, pt);
        }

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Firestore LIST failed: {}", e))?;

        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if !status.is_success() {
            return Err(format!(
                "Firestore LIST error (HTTP {}): {}",
                status, text
            ));
        }

        serde_json::from_str(&text)
            .map_err(|e| format!("Failed to parse Firestore list response: {}", e))
    }

    pub async fn run_query(
        &self,
        parent_path: &str,
        query: StructuredQuery,
    ) -> Result<Vec<FirestoreDocument>, String> {
        let url = format!(
            "{}/{}:runQuery?key={}",
            self.base_url(),
            parent_path,
            self.api_key
        );

        let body = serde_json::json!({
            "structuredQuery": query
        });

        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Firestore query failed: {}", e))?;

        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if !status.is_success() {
            return Err(format!(
                "Firestore query error (HTTP {}): {}",
                status, text
            ));
        }

        let items: Vec<RunQueryResponseItem> = serde_json::from_str(&text)
            .map_err(|e| format!("Failed to parse query response: {}", e))?;

        Ok(items
            .into_iter()
            .filter_map(|item| item.document)
            .collect())
    }
}

/// Extract document ID from a full Firestore resource name
/// e.g., "projects/foo/databases/(default)/documents/courts/X/offenders/ABC" -> "ABC"
pub fn extract_document_id(name: &str) -> String {
    name.rsplit('/').next().unwrap_or("").to_string()
}
