-- Migration v2: Add Firebase Firestore sync columns for offenders and cases
-- This migration runs on existing databases that already have the base schema

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Only run if not already applied
INSERT OR IGNORE INTO schema_version (version) VALUES (2);

-- Offenders: Add Firebase and mobile-aligned columns
ALTER TABLE offenders ADD COLUMN firestore_id TEXT UNIQUE;
ALTER TABLE offenders ADD COLUMN court_id TEXT;
ALTER TABLE offenders ADD COLUMN alias TEXT;
ALTER TABLE offenders ADD COLUMN nationality TEXT;
ALTER TABLE offenders ADD COLUMN marital_status TEXT;
ALTER TABLE offenders ADD COLUMN occupation TEXT;
ALTER TABLE offenders ADD COLUMN address TEXT;
ALTER TABLE offenders ADD COLUMN first_offender BOOLEAN;
ALTER TABLE offenders ADD COLUMN criminal_history TEXT;
ALTER TABLE offenders ADD COLUMN known_associates TEXT;
ALTER TABLE offenders ADD COLUMN arresting_officer TEXT;
ALTER TABLE offenders ADD COLUMN place_of_arrest TEXT;
ALTER TABLE offenders ADD COLUMN arrest_date TEXT;
ALTER TABLE offenders ADD COLUMN case_number TEXT;
ALTER TABLE offenders ADD COLUMN eye_color TEXT;
ALTER TABLE offenders ADD COLUMN hair_color TEXT;
ALTER TABLE offenders ADD COLUMN phone_number TEXT;
ALTER TABLE offenders ADD COLUMN emergency_contact_name TEXT;
ALTER TABLE offenders ADD COLUMN emergency_contact_phone TEXT;
ALTER TABLE offenders ADD COLUMN emergency_contact_relationship TEXT;
ALTER TABLE offenders ADD COLUMN legal_representation TEXT;
ALTER TABLE offenders ADD COLUMN medical_conditions TEXT;
ALTER TABLE offenders ADD COLUMN risk_level TEXT;
ALTER TABLE offenders ADD COLUMN distinguishing_marks TEXT;
ALTER TABLE offenders ADD COLUMN type TEXT;
ALTER TABLE offenders ADD COLUMN status TEXT DEFAULT 'Active';
ALTER TABLE offenders ADD COLUMN facility TEXT;
ALTER TABLE offenders ADD COLUMN offense_type TEXT;
ALTER TABLE offenders ADD COLUMN uploaded_by_id TEXT;
ALTER TABLE offenders ADD COLUMN photo_storage_url TEXT;
ALTER TABLE offenders ADD COLUMN is_new BOOLEAN DEFAULT 0;
ALTER TABLE offenders ADD COLUMN has_changes BOOLEAN DEFAULT 0;
ALTER TABLE offenders ADD COLUMN last_synced_at INTEGER;
ALTER TABLE offenders ADD COLUMN sync_retry_count INTEGER DEFAULT 0;
ALTER TABLE offenders ADD COLUMN version INTEGER DEFAULT 1;

-- Cases: Add Firebase and mobile-aligned columns
ALTER TABLE cases ADD COLUMN firestore_id TEXT UNIQUE;
ALTER TABLE cases ADD COLUMN court_id TEXT;
ALTER TABLE cases ADD COLUMN case_number TEXT;
ALTER TABLE cases ADD COLUMN case_type TEXT;
ALTER TABLE cases ADD COLUMN description TEXT;
ALTER TABLE cases ADD COLUMN court_name TEXT;
ALTER TABLE cases ADD COLUMN date_filed TEXT;
ALTER TABLE cases ADD COLUMN date_of_judgment TEXT;
ALTER TABLE cases ADD COLUMN judge_name TEXT;
ALTER TABLE cases ADD COLUMN complainant_name TEXT;
ALTER TABLE cases ADD COLUMN accused_name TEXT;
ALTER TABLE cases ADD COLUMN charge_description TEXT;
ALTER TABLE cases ADD COLUMN applicable_law TEXT;
ALTER TABLE cases ADD COLUMN verdict TEXT;
ALTER TABLE cases ADD COLUMN sentence TEXT;
ALTER TABLE cases ADD COLUMN mitigation_notes TEXT;
ALTER TABLE cases ADD COLUMN prosecution_counsel TEXT;
ALTER TABLE cases ADD COLUMN defense_witnesses TEXT;
ALTER TABLE cases ADD COLUMN prosecution_witnesses TEXT;
ALTER TABLE cases ADD COLUMN evidence_summary TEXT;
ALTER TABLE cases ADD COLUMN appeal_status TEXT;
ALTER TABLE cases ADD COLUMN location_of_offence TEXT;
ALTER TABLE cases ADD COLUMN hearing_dates TEXT;
ALTER TABLE cases ADD COLUMN court_assistant TEXT;
ALTER TABLE cases ADD COLUMN uploaded_by_id TEXT;
ALTER TABLE cases ADD COLUMN is_new BOOLEAN DEFAULT 0;
ALTER TABLE cases ADD COLUMN has_changes BOOLEAN DEFAULT 0;
ALTER TABLE cases ADD COLUMN last_synced_at INTEGER;
ALTER TABLE cases ADD COLUMN version INTEGER DEFAULT 1;

-- Rename supabase_id to firestore_id where it exists
-- SQLite doesn't support RENAME COLUMN before 3.25, so we skip if already migrated

-- Users: Add professional_title column
ALTER TABLE users ADD COLUMN professional_title TEXT;

-- Indexes for Firestore sync
CREATE INDEX IF NOT EXISTS idx_offenders_firestore_id ON offenders(firestore_id);
CREATE INDEX IF NOT EXISTS idx_offenders_court_id ON offenders(court_id);
CREATE INDEX IF NOT EXISTS idx_cases_firestore_id ON cases(firestore_id);
CREATE INDEX IF NOT EXISTS idx_cases_court_id ON cases(court_id);
