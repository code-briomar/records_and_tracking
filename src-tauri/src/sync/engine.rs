use std::sync::{Arc, Mutex, RwLock};

use chrono::Utc;
use rusqlite::{params, Connection};

use crate::config::firebase::{
    CollectionSelector, Filter, FirestoreClient,
    FirestoreValue, OrderBy, StructuredQuery, extract_document_id,
};

pub struct SyncEngine {
    firestore: FirestoreClient,
    conn: Arc<Mutex<Connection>>,
    court_id: Arc<RwLock<Option<String>>>,
}

impl SyncEngine {
    pub fn new(
        firestore: FirestoreClient,
        conn: Arc<Mutex<Connection>>,
        court_id: Arc<RwLock<Option<String>>>,
    ) -> Self {
        SyncEngine {
            firestore,
            conn,
            court_id,
        }
    }

    pub async fn sync_all(&self) -> Result<String, String> {
        let court_id = {
            let guard = self.court_id.read().map_err(|e| e.to_string())?;
            guard
                .clone()
                .ok_or_else(|| "No court_id set. Please log in first.".to_string())?
        };

        let last_sync = self.get_last_sync_time();

        // Phase 1: Push local pending changes to Firestore
        let pushed_offenders = self.push_pending_offenders(&court_id).await?;
        let pushed_cases = self.push_pending_cases(&court_id).await?;

        // Phase 2: Pull remote changes from Firestore
        let pulled_offenders = self
            .pull_remote_offenders(&court_id, &last_sync)
            .await?;
        let pulled_cases = self
            .pull_remote_cases(&court_id, &last_sync)
            .await?;

        // Phase 3: Update last sync time
        self.update_last_sync_time()?;

        Ok(format!(
            "Pushed: {} offenders, {} cases. Pulled: {} offenders, {} cases.",
            pushed_offenders, pushed_cases, pulled_offenders, pulled_cases
        ))
    }

    fn get_last_sync_time(&self) -> String {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT last_sync FROM sync_metadata WHERE id = 1",
            [],
            |row| row.get::<_, String>(0),
        )
        .unwrap_or_else(|_| "1970-01-01T00:00:00Z".to_string())
    }

    fn update_last_sync_time(&self) -> Result<(), String> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO sync_metadata (id, last_sync) VALUES (1, ?)",
            params![Utc::now().to_rfc3339()],
        )
        .map_err(|e| format!("Failed to update sync time: {}", e))?;
        Ok(())
    }

    // ========================================================================
    // Offender Sync
    // ========================================================================

    async fn push_pending_offenders(
        &self,
        court_id: &str,
    ) -> Result<usize, String> {
        let pending = {
            let conn = self.conn.lock().unwrap();
            let mut stmt = conn
                .prepare(
                    "SELECT offender_id, firestore_id, full_name, national_id, date_of_birth,
                            gender, photo_path, notes, date_created, file_id, penalty, penalty_notes,
                            alias, nationality, marital_status, occupation, address,
                            first_offender, criminal_history, known_associates,
                            arresting_officer, place_of_arrest, arrest_date,
                            case_number, eye_color, hair_color, phone_number,
                            emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                            legal_representation, medical_conditions, risk_level, distinguishing_marks,
                            type, status, facility, offense_type, uploaded_by_id, photo_storage_url,
                            is_deleted, version, court_id
                     FROM offenders
                     WHERE sync_status = 'pending' OR is_new = 1 OR has_changes = 1",
                )
                .map_err(|e| format!("Failed to query pending offenders: {}", e))?;

            let rows = stmt
                .query_map([], |row| {
                    Ok(OffenderRow {
                        offender_id: row.get(0)?,
                        firestore_id: row.get(1)?,
                        full_name: row.get(2)?,
                        national_id: row.get(3)?,
                        date_of_birth: row.get(4)?,
                        gender: row.get(5)?,
                        photo_path: row.get(6)?,
                        notes: row.get(7)?,
                        date_created: row.get(8)?,
                        file_id: row.get(9)?,
                        penalty: row.get(10)?,
                        penalty_notes: row.get(11)?,
                        alias: row.get(12)?,
                        nationality: row.get(13)?,
                        marital_status: row.get(14)?,
                        occupation: row.get(15)?,
                        address: row.get(16)?,
                        first_offender: row.get(17)?,
                        criminal_history: row.get(18)?,
                        known_associates: row.get(19)?,
                        arresting_officer: row.get(20)?,
                        place_of_arrest: row.get(21)?,
                        arrest_date: row.get(22)?,
                        case_number: row.get(23)?,
                        eye_color: row.get(24)?,
                        hair_color: row.get(25)?,
                        phone_number: row.get(26)?,
                        emergency_contact_name: row.get(27)?,
                        emergency_contact_phone: row.get(28)?,
                        emergency_contact_relationship: row.get(29)?,
                        legal_representation: row.get(30)?,
                        medical_conditions: row.get(31)?,
                        risk_level: row.get(32)?,
                        distinguishing_marks: row.get(33)?,
                        offender_type: row.get(34)?,
                        status: row.get(35)?,
                        facility: row.get(36)?,
                        offense_type: row.get(37)?,
                        uploaded_by_id: row.get(38)?,
                        photo_storage_url: row.get(39)?,
                        is_deleted: row.get(40)?,
                        version: row.get(41)?,
                        court_id: row.get(42)?,
                    })
                })
                .map_err(|e| format!("Failed to map offender rows: {}", e))?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| format!("Failed to collect offender rows: {}", e))?;
            rows
        };

        let count = pending.len();

        for offender in &pending {
            let fields = offender_to_firestore_fields(offender, court_id);

            let firestore_id = match &offender.firestore_id {
                Some(id) => id.clone(),
                None => {
                    let new_id = uuid::Uuid::new_v4().to_string();
                    // Update local record with generated firestore_id
                    let conn = self.conn.lock().unwrap();
                    conn.execute(
                        "UPDATE offenders SET firestore_id = ? WHERE offender_id = ?",
                        params![new_id, offender.offender_id],
                    )
                    .map_err(|e| format!("Failed to set firestore_id: {}", e))?;
                    new_id
                }
            };

            let collection = format!("courts/{}/offenders", court_id);
            let doc_path = format!("courts/{}/offenders/{}", court_id, firestore_id);

            if offender.is_deleted.unwrap_or(false) {
                // Soft-deleted: delete from Firestore, then purge locally
                match self.firestore.delete_document(&doc_path).await {
                    Ok(_) => {
                        let conn = self.conn.lock().unwrap();
                        conn.execute(
                            "DELETE FROM offenders WHERE offender_id = ?",
                            params![offender.offender_id],
                        )
                        .map_err(|e| format!("Failed to purge deleted offender: {}", e))?;
                    }
                    Err(e) => {
                        eprintln!("Failed to delete offender from Firestore: {}", e);
                    }
                }
            } else {
                // Create or update
                let result = self
                    .firestore
                    .update_document(&doc_path, &fields)
                    .await;

                match result {
                    Ok(_) => {}
                    Err(_) => {
                        // Document might not exist yet, try creating
                        self.firestore
                            .create_document(&collection, &firestore_id, &fields)
                            .await
                            .map_err(|e| {
                                format!("Failed to push offender {}: {}", firestore_id, e)
                            })?;
                    }
                }

                // Mark as synced
                let conn = self.conn.lock().unwrap();
                conn.execute(
                    "UPDATE offenders SET sync_status = 'synced', is_new = 0, has_changes = 0,
                     last_synced_at = strftime('%s','now'), version = COALESCE(version, 0) + 1
                     WHERE offender_id = ?",
                    params![offender.offender_id],
                )
                .map_err(|e| format!("Failed to mark offender as synced: {}", e))?;
            }
        }

        Ok(count)
    }

    async fn pull_remote_offenders(
        &self,
        court_id: &str,
        last_sync: &str,
    ) -> Result<usize, String> {
        let parent = format!("courts/{}", court_id);

        let query = StructuredQuery {
            from: vec![CollectionSelector {
                collection_id: "offenders".to_string(),
            }],
            r#where: Some(Filter::field(
                "updatedAt",
                "GREATER_THAN",
                FirestoreValue::timestamp(last_sync),
            )),
            order_by: Some(vec![OrderBy::asc("updatedAt")]),
            limit: Some(500),
            offset: None,
        };

        let remote_docs = self
            .firestore
            .run_query(&parent, query)
            .await
            .unwrap_or_else(|e| {
                eprintln!("Failed to query remote offenders: {}", e);
                vec![]
            });

        let count = remote_docs.len();
        let conn = self.conn.lock().unwrap();

        for doc in &remote_docs {
            let firestore_id = extract_document_id(&doc.name);
            if firestore_id.is_empty() {
                continue;
            }

            let fields = &doc.fields;

            // Check if exists locally
            let local_sync_status: Option<String> = conn
                .query_row(
                    "SELECT sync_status FROM offenders WHERE firestore_id = ?",
                    params![firestore_id],
                    |row| row.get(0),
                )
                .ok();

            // Skip if local has pending changes (conflict - local wins for now)
            if local_sync_status.as_deref() == Some("pending") {
                continue;
            }

            let full_name = get_str(fields, "fullName").unwrap_or_default();
            let national_id = get_str(fields, "nationalId");
            let date_of_birth = get_str(fields, "dateOfBirth");
            let gender = get_str(fields, "gender");
            let notes = get_str(fields, "notes");
            let penalty = get_str(fields, "penalty");
            let penalty_notes = get_str(fields, "penaltyNotes");
            let alias = get_str(fields, "alias");
            let nationality = get_str(fields, "nationality");
            let marital_status = get_str(fields, "maritalStatus");
            let occupation = get_str(fields, "occupation");
            let address = get_str(fields, "address");
            let first_offender = get_bool(fields, "firstOffender");
            let criminal_history = get_str(fields, "criminalHistory");
            let known_associates = get_str(fields, "knownAssociates");
            let arresting_officer = get_str(fields, "arrestingOfficer");
            let place_of_arrest = get_str(fields, "placeOfArrest");
            let arrest_date = get_str(fields, "arrestDate");
            let case_number = get_str(fields, "caseNumber");
            let eye_color = get_str(fields, "eyeColor");
            let hair_color = get_str(fields, "hairColor");
            let phone_number = get_str(fields, "phoneNumber");
            let emergency_contact_name = get_str(fields, "emergencyContactName");
            let emergency_contact_phone = get_str(fields, "emergencyContactPhone");
            let emergency_contact_relationship = get_str(fields, "emergencyContactRelationship");
            let legal_representation = get_str(fields, "legalRepresentation");
            let medical_conditions = get_str(fields, "medicalConditions");
            let risk_level = get_str(fields, "riskLevel");
            let distinguishing_marks = get_str(fields, "distinguishingMarks");
            let offender_type = get_str(fields, "type");
            let status = get_str(fields, "status");
            let facility = get_str(fields, "facility");
            let offense_type = get_str(fields, "offenseType");
            let uploaded_by_id = get_str(fields, "uploadedById");
            let photo_storage_url = get_str(fields, "photoStorageUrl");
            let is_deleted = get_bool(fields, "isDeleted").unwrap_or(false);
            let version = get_int(fields, "version").unwrap_or(1);

            if is_deleted {
                // Remote was deleted - delete locally too
                conn.execute(
                    "DELETE FROM offenders WHERE firestore_id = ?",
                    params![firestore_id],
                )
                .ok();
                continue;
            }

            conn.execute(
                "INSERT INTO offenders (
                    firestore_id, court_id, full_name, national_id, date_of_birth, gender,
                    notes, penalty, penalty_notes, alias, nationality, marital_status,
                    occupation, address, first_offender, criminal_history, known_associates,
                    arresting_officer, place_of_arrest, arrest_date, case_number,
                    eye_color, hair_color, phone_number,
                    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                    legal_representation, medical_conditions, risk_level, distinguishing_marks,
                    type, status, facility, offense_type, uploaded_by_id, photo_storage_url,
                    is_deleted, version, sync_status, is_new, has_changes,
                    last_synced_at, date_created
                ) VALUES (
                    ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17,
                    ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30, ?31, ?32,
                    ?33, ?34, ?35, ?36, ?37, ?38, ?39, 'synced', 0, 0, strftime('%s','now'),
                    datetime('now')
                )
                ON CONFLICT(firestore_id) DO UPDATE SET
                    full_name = excluded.full_name,
                    national_id = excluded.national_id,
                    date_of_birth = excluded.date_of_birth,
                    gender = excluded.gender,
                    notes = excluded.notes,
                    penalty = excluded.penalty,
                    penalty_notes = excluded.penalty_notes,
                    alias = excluded.alias,
                    nationality = excluded.nationality,
                    marital_status = excluded.marital_status,
                    occupation = excluded.occupation,
                    address = excluded.address,
                    first_offender = excluded.first_offender,
                    criminal_history = excluded.criminal_history,
                    known_associates = excluded.known_associates,
                    arresting_officer = excluded.arresting_officer,
                    place_of_arrest = excluded.place_of_arrest,
                    arrest_date = excluded.arrest_date,
                    case_number = excluded.case_number,
                    eye_color = excluded.eye_color,
                    hair_color = excluded.hair_color,
                    phone_number = excluded.phone_number,
                    emergency_contact_name = excluded.emergency_contact_name,
                    emergency_contact_phone = excluded.emergency_contact_phone,
                    emergency_contact_relationship = excluded.emergency_contact_relationship,
                    legal_representation = excluded.legal_representation,
                    medical_conditions = excluded.medical_conditions,
                    risk_level = excluded.risk_level,
                    distinguishing_marks = excluded.distinguishing_marks,
                    type = excluded.type,
                    status = excluded.status,
                    facility = excluded.facility,
                    offense_type = excluded.offense_type,
                    uploaded_by_id = excluded.uploaded_by_id,
                    photo_storage_url = excluded.photo_storage_url,
                    version = excluded.version,
                    sync_status = 'synced',
                    is_new = 0,
                    has_changes = 0,
                    last_synced_at = strftime('%s','now')",
                params![
                    firestore_id, court_id, full_name, national_id, date_of_birth, gender,
                    notes, penalty, penalty_notes, alias, nationality, marital_status,
                    occupation, address, first_offender, criminal_history, known_associates,
                    arresting_officer, place_of_arrest, arrest_date, case_number,
                    eye_color, hair_color, phone_number,
                    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                    legal_representation, medical_conditions, risk_level, distinguishing_marks,
                    offender_type, status, facility, offense_type, uploaded_by_id, photo_storage_url,
                    is_deleted, version
                ],
            )
            .map_err(|e| format!("Failed to upsert remote offender: {}", e))?;
        }

        Ok(count)
    }

    // ========================================================================
    // Case Sync
    // ========================================================================

    async fn push_pending_cases(
        &self,
        court_id: &str,
    ) -> Result<usize, String> {
        let pending = {
            let conn = self.conn.lock().unwrap();
            let mut stmt = conn
                .prepare(
                    "SELECT case_id, firestore_id, title, case_number, status, priority,
                            date_created, case_type, description, court_name, date_filed,
                            date_of_judgment, judge_name, complainant_name, accused_name,
                            charge_description, applicable_law, verdict, sentence,
                            mitigation_notes, prosecution_counsel, defense_witnesses,
                            prosecution_witnesses, evidence_summary, appeal_status,
                            location_of_offence, hearing_dates, court_assistant,
                            uploaded_by_id, is_deleted, version, court_id
                     FROM cases
                     WHERE sync_status = 'pending' OR is_new = 1 OR has_changes = 1",
                )
                .map_err(|e| format!("Failed to query pending cases: {}", e))?;

            let rows = stmt
                .query_map([], |row| {
                    Ok(CaseRow {
                        case_id: row.get(0)?,
                        firestore_id: row.get(1)?,
                        title: row.get(2)?,
                        case_number: row.get(3)?,
                        status: row.get(4)?,
                        priority: row.get(5)?,
                        date_created: row.get(6)?,
                        case_type: row.get(7)?,
                        description: row.get(8)?,
                        court_name: row.get(9)?,
                        date_filed: row.get(10)?,
                        date_of_judgment: row.get(11)?,
                        judge_name: row.get(12)?,
                        complainant_name: row.get(13)?,
                        accused_name: row.get(14)?,
                        charge_description: row.get(15)?,
                        applicable_law: row.get(16)?,
                        verdict: row.get(17)?,
                        sentence: row.get(18)?,
                        mitigation_notes: row.get(19)?,
                        prosecution_counsel: row.get(20)?,
                        defense_witnesses: row.get(21)?,
                        prosecution_witnesses: row.get(22)?,
                        evidence_summary: row.get(23)?,
                        appeal_status: row.get(24)?,
                        location_of_offence: row.get(25)?,
                        hearing_dates: row.get(26)?,
                        court_assistant: row.get(27)?,
                        uploaded_by_id: row.get(28)?,
                        is_deleted: row.get(29)?,
                        version: row.get(30)?,
                        court_id: row.get(31)?,
                    })
                })
                .map_err(|e| format!("Failed to map case rows: {}", e))?
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| format!("Failed to collect case rows: {}", e))?;
            rows
        };

        let count = pending.len();

        for case in &pending {
            let fields = case_to_firestore_fields(case, court_id);

            let firestore_id = match &case.firestore_id {
                Some(id) => id.clone(),
                None => {
                    let new_id = uuid::Uuid::new_v4().to_string();
                    let conn = self.conn.lock().unwrap();
                    conn.execute(
                        "UPDATE cases SET firestore_id = ? WHERE case_id = ?",
                        params![new_id, case.case_id],
                    )
                    .map_err(|e| format!("Failed to set case firestore_id: {}", e))?;
                    new_id
                }
            };

            let collection = format!("courts/{}/cases", court_id);
            let doc_path = format!("courts/{}/cases/{}", court_id, firestore_id);

            if case.is_deleted.unwrap_or(false) {
                match self.firestore.delete_document(&doc_path).await {
                    Ok(_) => {
                        let conn = self.conn.lock().unwrap();
                        conn.execute(
                            "DELETE FROM cases WHERE case_id = ?",
                            params![case.case_id],
                        )
                        .ok();
                    }
                    Err(e) => {
                        eprintln!("Failed to delete case from Firestore: {}", e);
                    }
                }
            } else {
                let result = self
                    .firestore
                    .update_document(&doc_path, &fields)
                    .await;

                match result {
                    Ok(_) => {}
                    Err(_) => {
                        self.firestore
                            .create_document(&collection, &firestore_id, &fields)
                            .await
                            .map_err(|e| {
                                format!("Failed to push case {}: {}", firestore_id, e)
                            })?;
                    }
                }

                let conn = self.conn.lock().unwrap();
                conn.execute(
                    "UPDATE cases SET sync_status = 'synced', is_new = 0, has_changes = 0,
                     last_synced_at = strftime('%s','now'), version = COALESCE(version, 0) + 1
                     WHERE case_id = ?",
                    params![case.case_id],
                )
                .map_err(|e| format!("Failed to mark case as synced: {}", e))?;
            }
        }

        Ok(count)
    }

    async fn pull_remote_cases(
        &self,
        court_id: &str,
        last_sync: &str,
    ) -> Result<usize, String> {
        let parent = format!("courts/{}", court_id);

        let query = StructuredQuery {
            from: vec![CollectionSelector {
                collection_id: "cases".to_string(),
            }],
            r#where: Some(Filter::field(
                "updatedAt",
                "GREATER_THAN",
                FirestoreValue::timestamp(last_sync),
            )),
            order_by: Some(vec![OrderBy::asc("updatedAt")]),
            limit: Some(500),
            offset: None,
        };

        let remote_docs = self
            .firestore
            .run_query(&parent, query)
            .await
            .unwrap_or_else(|e| {
                eprintln!("Failed to query remote cases: {}", e);
                vec![]
            });

        let count = remote_docs.len();
        let conn = self.conn.lock().unwrap();

        for doc in &remote_docs {
            let firestore_id = extract_document_id(&doc.name);
            if firestore_id.is_empty() {
                continue;
            }

            let fields = &doc.fields;

            let local_sync_status: Option<String> = conn
                .query_row(
                    "SELECT sync_status FROM cases WHERE firestore_id = ?",
                    params![firestore_id],
                    |row| row.get(0),
                )
                .ok();

            if local_sync_status.as_deref() == Some("pending") {
                continue;
            }

            let title = get_str(fields, "title").unwrap_or_default();
            let case_number = get_str(fields, "caseNumber");
            let status = get_str(fields, "status").unwrap_or_else(|| "Open".to_string());
            let priority = get_str(fields, "priority").unwrap_or_else(|| "Medium".to_string());
            let case_type = get_str(fields, "CaseType");
            let description = get_str(fields, "description");
            let court_name = get_str(fields, "courtName");
            let date_filed = get_str(fields, "dateFiled");
            let date_of_judgment = get_str(fields, "dateOfJudgment");
            let judge_name = get_str(fields, "judgeName");
            let complainant_name = get_str(fields, "complainantName");
            let accused_name = get_str(fields, "accusedName");
            let charge_description = get_str(fields, "chargeDescription");
            let applicable_law = get_str(fields, "applicableLaw");
            let verdict = get_str(fields, "verdict");
            let sentence = get_str(fields, "sentence");
            let mitigation_notes = get_str(fields, "mitigationNotes");
            let prosecution_counsel = get_str(fields, "prosecutionCounsel");
            let defense_witnesses = get_str(fields, "defenseWitnesses");
            let prosecution_witnesses = get_str(fields, "prosecutionWitnesses");
            let evidence_summary = get_str(fields, "evidenceSummary");
            let appeal_status = get_str(fields, "appealStatus");
            let location_of_offence = get_str(fields, "locationOfOffence");
            let hearing_dates = get_str(fields, "hearingDates");
            let court_assistant = get_str(fields, "courtAssistant");
            let uploaded_by_id = get_str(fields, "uploadedById");
            let is_deleted = get_bool(fields, "isDeleted").unwrap_or(false);
            let version = get_int(fields, "version").unwrap_or(1);

            if is_deleted {
                conn.execute(
                    "DELETE FROM cases WHERE firestore_id = ?",
                    params![firestore_id],
                )
                .ok();
                continue;
            }

            conn.execute(
                "INSERT INTO cases (
                    firestore_id, court_id, title, case_number, status, priority,
                    date_created, case_type, description, court_name, date_filed,
                    date_of_judgment, judge_name, complainant_name, accused_name,
                    charge_description, applicable_law, verdict, sentence,
                    mitigation_notes, prosecution_counsel, defense_witnesses,
                    prosecution_witnesses, evidence_summary, appeal_status,
                    location_of_offence, hearing_dates, court_assistant,
                    uploaded_by_id, is_deleted, version,
                    sync_status, is_new, has_changes, last_synced_at
                ) VALUES (
                    ?1, ?2, ?3, ?4, ?5, ?6, datetime('now'), ?7, ?8, ?9, ?10, ?11, ?12,
                    ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25,
                    ?26, ?27, ?28, ?29, ?30, 'synced', 0, 0, strftime('%s','now')
                )
                ON CONFLICT(firestore_id) DO UPDATE SET
                    title = excluded.title,
                    case_number = excluded.case_number,
                    status = excluded.status,
                    priority = excluded.priority,
                    case_type = excluded.case_type,
                    description = excluded.description,
                    court_name = excluded.court_name,
                    date_filed = excluded.date_filed,
                    date_of_judgment = excluded.date_of_judgment,
                    judge_name = excluded.judge_name,
                    complainant_name = excluded.complainant_name,
                    accused_name = excluded.accused_name,
                    charge_description = excluded.charge_description,
                    applicable_law = excluded.applicable_law,
                    verdict = excluded.verdict,
                    sentence = excluded.sentence,
                    mitigation_notes = excluded.mitigation_notes,
                    prosecution_counsel = excluded.prosecution_counsel,
                    defense_witnesses = excluded.defense_witnesses,
                    prosecution_witnesses = excluded.prosecution_witnesses,
                    evidence_summary = excluded.evidence_summary,
                    appeal_status = excluded.appeal_status,
                    location_of_offence = excluded.location_of_offence,
                    hearing_dates = excluded.hearing_dates,
                    court_assistant = excluded.court_assistant,
                    uploaded_by_id = excluded.uploaded_by_id,
                    version = excluded.version,
                    sync_status = 'synced',
                    is_new = 0,
                    has_changes = 0,
                    last_synced_at = strftime('%s','now')",
                params![
                    firestore_id, court_id, title, case_number, status, priority,
                    case_type, description, court_name, date_filed, date_of_judgment,
                    judge_name, complainant_name, accused_name, charge_description,
                    applicable_law, verdict, sentence, mitigation_notes,
                    prosecution_counsel, defense_witnesses, prosecution_witnesses,
                    evidence_summary, appeal_status, location_of_offence,
                    hearing_dates, court_assistant, uploaded_by_id, is_deleted, version
                ],
            )
            .map_err(|e| format!("Failed to upsert remote case: {}", e))?;
        }

        Ok(count)
    }
}

// ============================================================================
// Internal data types for sync rows
// ============================================================================

struct OffenderRow {
    offender_id: i64,
    firestore_id: Option<String>,
    full_name: String,
    national_id: Option<String>,
    date_of_birth: Option<String>,
    gender: Option<String>,
    photo_path: Option<String>,
    notes: Option<String>,
    date_created: Option<String>,
    file_id: Option<i64>,
    penalty: Option<String>,
    penalty_notes: Option<String>,
    alias: Option<String>,
    nationality: Option<String>,
    marital_status: Option<String>,
    occupation: Option<String>,
    address: Option<String>,
    first_offender: Option<bool>,
    criminal_history: Option<String>,
    known_associates: Option<String>,
    arresting_officer: Option<String>,
    place_of_arrest: Option<String>,
    arrest_date: Option<String>,
    case_number: Option<String>,
    eye_color: Option<String>,
    hair_color: Option<String>,
    phone_number: Option<String>,
    emergency_contact_name: Option<String>,
    emergency_contact_phone: Option<String>,
    emergency_contact_relationship: Option<String>,
    legal_representation: Option<String>,
    medical_conditions: Option<String>,
    risk_level: Option<String>,
    distinguishing_marks: Option<String>,
    offender_type: Option<String>,
    status: Option<String>,
    facility: Option<String>,
    offense_type: Option<String>,
    uploaded_by_id: Option<String>,
    photo_storage_url: Option<String>,
    is_deleted: Option<bool>,
    version: Option<i64>,
    court_id: Option<String>,
}

struct CaseRow {
    case_id: i64,
    firestore_id: Option<String>,
    title: String,
    case_number: Option<String>,
    status: String,
    priority: String,
    date_created: Option<String>,
    case_type: Option<String>,
    description: Option<String>,
    court_name: Option<String>,
    date_filed: Option<String>,
    date_of_judgment: Option<String>,
    judge_name: Option<String>,
    complainant_name: Option<String>,
    accused_name: Option<String>,
    charge_description: Option<String>,
    applicable_law: Option<String>,
    verdict: Option<String>,
    sentence: Option<String>,
    mitigation_notes: Option<String>,
    prosecution_counsel: Option<String>,
    defense_witnesses: Option<String>,
    prosecution_witnesses: Option<String>,
    evidence_summary: Option<String>,
    appeal_status: Option<String>,
    location_of_offence: Option<String>,
    hearing_dates: Option<String>,
    court_assistant: Option<String>,
    uploaded_by_id: Option<String>,
    is_deleted: Option<bool>,
    version: Option<i64>,
    court_id: Option<String>,
}

// ============================================================================
// Firestore field mapping helpers
// ============================================================================

use std::collections::HashMap;

fn set_str(fields: &mut HashMap<String, FirestoreValue>, key: &str, val: &Option<String>) {
    if let Some(v) = val {
        fields.insert(key.to_string(), FirestoreValue::string(v));
    }
}

fn set_str_required(fields: &mut HashMap<String, FirestoreValue>, key: &str, val: &str) {
    fields.insert(key.to_string(), FirestoreValue::string(val));
}

fn set_bool(fields: &mut HashMap<String, FirestoreValue>, key: &str, val: &Option<bool>) {
    if let Some(v) = val {
        fields.insert(key.to_string(), FirestoreValue::boolean(*v));
    }
}

fn set_int(fields: &mut HashMap<String, FirestoreValue>, key: &str, val: &Option<i64>) {
    if let Some(v) = val {
        fields.insert(key.to_string(), FirestoreValue::integer(*v));
    }
}

fn get_str(fields: &HashMap<String, FirestoreValue>, key: &str) -> Option<String> {
    fields
        .get(key)
        .and_then(|v| v.as_string())
        .map(|s| s.to_string())
}

fn get_bool(fields: &HashMap<String, FirestoreValue>, key: &str) -> Option<bool> {
    fields.get(key).and_then(|v| v.as_boolean())
}

fn get_int(fields: &HashMap<String, FirestoreValue>, key: &str) -> Option<i64> {
    fields.get(key).and_then(|v| v.as_integer())
}

/// Map an OffenderRow to Firestore fields using mobile's camelCase naming
fn offender_to_firestore_fields(
    o: &OffenderRow,
    court_id: &str,
) -> HashMap<String, FirestoreValue> {
    let mut fields = HashMap::new();

    set_str_required(&mut fields, "fullName", &o.full_name);
    set_str_required(&mut fields, "courtId", court_id);
    set_str(&mut fields, "nationalId", &o.national_id);
    set_str(&mut fields, "dateOfBirth", &o.date_of_birth);
    set_str(&mut fields, "gender", &o.gender);
    set_str(&mut fields, "notes", &o.notes);
    set_str(&mut fields, "penalty", &o.penalty);
    set_str(&mut fields, "penaltyNotes", &o.penalty_notes);
    set_str(&mut fields, "alias", &o.alias);
    set_str(&mut fields, "nationality", &o.nationality);
    set_str(&mut fields, "maritalStatus", &o.marital_status);
    set_str(&mut fields, "occupation", &o.occupation);
    set_str(&mut fields, "address", &o.address);
    set_bool(&mut fields, "firstOffender", &o.first_offender);
    set_str(&mut fields, "criminalHistory", &o.criminal_history);
    set_str(&mut fields, "knownAssociates", &o.known_associates);
    set_str(&mut fields, "arrestingOfficer", &o.arresting_officer);
    set_str(&mut fields, "placeOfArrest", &o.place_of_arrest);
    set_str(&mut fields, "arrestDate", &o.arrest_date);
    set_str(&mut fields, "caseNumber", &o.case_number);
    set_str(&mut fields, "eyeColor", &o.eye_color);
    set_str(&mut fields, "hairColor", &o.hair_color);
    set_str(&mut fields, "phoneNumber", &o.phone_number);
    set_str(&mut fields, "emergencyContactName", &o.emergency_contact_name);
    set_str(&mut fields, "emergencyContactPhone", &o.emergency_contact_phone);
    set_str(
        &mut fields,
        "emergencyContactRelationship",
        &o.emergency_contact_relationship,
    );
    set_str(&mut fields, "legalRepresentation", &o.legal_representation);
    set_str(&mut fields, "medicalConditions", &o.medical_conditions);
    set_str(&mut fields, "riskLevel", &o.risk_level);
    set_str(&mut fields, "distinguishingMarks", &o.distinguishing_marks);
    set_str(&mut fields, "type", &o.offender_type);
    set_str(&mut fields, "status", &o.status);
    set_str(&mut fields, "facility", &o.facility);
    set_str(&mut fields, "offenseType", &o.offense_type);
    set_str(&mut fields, "uploadedById", &o.uploaded_by_id);
    set_str(&mut fields, "photoStorageUrl", &o.photo_storage_url);
    set_bool(&mut fields, "isDeleted", &o.is_deleted);
    set_int(&mut fields, "version", &o.version);

    // Set updatedAt timestamp for sync queries
    fields.insert(
        "updatedAt".to_string(),
        FirestoreValue::timestamp(&Utc::now().to_rfc3339()),
    );

    fields
}

/// Map a CaseRow to Firestore fields using mobile's camelCase naming
fn case_to_firestore_fields(c: &CaseRow, court_id: &str) -> HashMap<String, FirestoreValue> {
    let mut fields = HashMap::new();

    set_str_required(&mut fields, "title", &c.title);
    set_str_required(&mut fields, "courtId", court_id);
    set_str_required(&mut fields, "status", &c.status);
    set_str_required(&mut fields, "priority", &c.priority);
    set_str(&mut fields, "caseNumber", &c.case_number);
    set_str(&mut fields, "CaseType", &c.case_type);
    set_str(&mut fields, "description", &c.description);
    set_str(&mut fields, "courtName", &c.court_name);
    set_str(&mut fields, "dateFiled", &c.date_filed);
    set_str(&mut fields, "dateOfJudgment", &c.date_of_judgment);
    set_str(&mut fields, "judgeName", &c.judge_name);
    set_str(&mut fields, "complainantName", &c.complainant_name);
    set_str(&mut fields, "accusedName", &c.accused_name);
    set_str(&mut fields, "chargeDescription", &c.charge_description);
    set_str(&mut fields, "applicableLaw", &c.applicable_law);
    set_str(&mut fields, "verdict", &c.verdict);
    set_str(&mut fields, "sentence", &c.sentence);
    set_str(&mut fields, "mitigationNotes", &c.mitigation_notes);
    set_str(&mut fields, "prosecutionCounsel", &c.prosecution_counsel);
    set_str(&mut fields, "defenseWitnesses", &c.defense_witnesses);
    set_str(
        &mut fields,
        "prosecutionWitnesses",
        &c.prosecution_witnesses,
    );
    set_str(&mut fields, "evidenceSummary", &c.evidence_summary);
    set_str(&mut fields, "appealStatus", &c.appeal_status);
    set_str(&mut fields, "locationOfOffence", &c.location_of_offence);
    set_str(&mut fields, "hearingDates", &c.hearing_dates);
    set_str(&mut fields, "courtAssistant", &c.court_assistant);
    set_str(&mut fields, "uploadedById", &c.uploaded_by_id);
    set_bool(&mut fields, "isDeleted", &c.is_deleted);
    set_int(&mut fields, "version", &c.version);

    fields.insert(
        "updatedAt".to_string(),
        FirestoreValue::timestamp(&Utc::now().to_rfc3339()),
    );

    fields
}
