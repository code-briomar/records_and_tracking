use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Offender {
    pub offender_id: Option<i64>,
    pub full_name: String,
    pub national_id: Option<String>,
    pub date_of_birth: Option<String>,
    pub gender: Option<String>,
    pub photo_path: Option<String>,
    pub notes: Option<String>,
    pub date_created: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OffenderCase {
    pub id: Option<i64>,
    pub offender_id: i64,
    pub case_id: i64,
}
