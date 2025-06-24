DROP TABLE IF EXISTS summaries;
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS reports_analytics;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS offenders;

-- Enable foreign key support for SQLite
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    role          TEXT CHECK(role IN ('Super Admin', 'Court Admin', 'Staff')) NOT NULL,
    email         TEXT,
    phone_number  TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status        TEXT CHECK(status IN ('Active', 'Inactive')) NOT NULL DEFAULT 'Active'
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    staff_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL,
    role           TEXT NOT NULL,
    contact_number TEXT,
    status        TEXT CHECK(status IN ('Active', 'Absent')) NOT NULL DEFAULT 'Active',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE

);
-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id       INTEGER NOT NULL,
    date          DATE NOT NULL,
    status        TEXT CHECK(status IN ('Present', 'Absent')) NOT NULL,
    reason        TEXT,
    half_day      BOOLEAN NOT NULL DEFAULT 0,
    comments      TEXT,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
    case_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title            TEXT NOT NULL,
    status          TEXT CHECK(status IN ('Open', 'In Progress', 'Closed')) NOT NULL DEFAULT 'Open',
    assigned_staff_id INTEGER,
    priority        TEXT CHECK(priority IN ('Low', 'Medium', 'High')) NOT NULL DEFAULT 'Medium',
    date_created   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS files(
    file_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_number TEXT NOT NULL,
    case_type TEXT CHECK(case_type IN ('Civil', 'Criminal','Succession','Children','Other')) NOT NULL, -- type of case
    purpose TEXT CHECK(purpose IN ('Ruling', 'Judgement', 'Hearing','Mention','Other')) NOT NULL, -- for
    uploaded_by INTEGER, -- ID of the user who uploaded the file
    current_location TEXT NOT NULL, -- Current location of the file (e.g., court, archive, etc.)
    notes TEXT NOT NULL, -- Notes or comments about the file
    date_recieved TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date the file was recorded/uploaded
    required_on TIMESTAMP NOT NULL, -- Date the file is needed by
    required_on_signature TEXT, -- Signature of the person who recorded the file
    date_returned TIMESTAMP, -- Date the file was returned
    date_returned_signature TEXT, -- Signature of the person who returned the file
    deleted INT DEFAULT 0 -- 1 for true, 0 for false
);

-- Indexes for faster searching and filtering on the files table
CREATE INDEX IF NOT EXISTS idx_files_case_number ON files(case_number);
CREATE INDEX IF NOT EXISTS idx_files_purpose ON files(purpose);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_current_location ON files(current_location);
CREATE INDEX IF NOT EXISTS idx_files_date_recieved ON files(date_recieved);
CREATE INDEX IF NOT EXISTS idx_files_required_on ON files(required_on);
CREATE INDEX IF NOT EXISTS idx_files_date_returned ON files(date_returned);
CREATE INDEX IF NOT EXISTS idx_files_deleted ON files(deleted);



-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    message        TEXT NOT NULL,
    type          TEXT CHECK(type IN ('Info', 'Warning', 'Error', 'Success')) NOT NULL,
    date_created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_status   BOOLEAN NOT NULL DEFAULT 0,
    user_id       INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    contact_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    role         TEXT CHECK(role IN ('Court Admin', 'Super Admin')) NOT NULL,
    phone_number TEXT NOT NULL
);

-- Reports & Analytics Table
CREATE TABLE IF NOT EXISTS reports_analytics (
    report_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT CHECK(type IN ('Attendance', 'Cases', 'Files Processed')) NOT NULL,
    data_json   TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News Table
CREATE TABLE IF NOT EXISTS news (
    news_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    content       TEXT NOT NULL,
    published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Themes Table
CREATE TABLE IF NOT EXISTS themes (
    theme_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    config_json TEXT NOT NULL,
    user_id     INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Summaries Table
CREATE TABLE IF NOT EXISTS summaries (
    summary_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    category    TEXT CHECK(category IN ('Cases', 'Files', 'Attendance', 'Notifications', 'Overall')) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by TEXT NOT NULL
);

-- Offenders Table
CREATE TABLE IF NOT EXISTS offenders (
    offender_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    national_id TEXT,
    date_of_birth DATE,
    gender TEXT,
    photo_path TEXT, -- Path to photo file stored on disk
    notes TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_id INTEGER,
    penalty TEXT, -- e.g. Fine, Locked Up, Community Service, etc.
    penalty_notes TEXT, -- additional notes on penalty
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE SET NULL
);

-- Offender History Table
CREATE TABLE IF NOT EXISTS offender_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    offender_id INTEGER NOT NULL,
    file_id INTEGER,
    case_id INTEGER,
    offense_date DATE,
    penalty TEXT,
    penalty_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offender_id) REFERENCES offenders(offender_id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE SET NULL
);

-- HISTORY ( Activated By Triggers )
-- Tracks history of when the file is required on
CREATE TABLE IF NOT EXISTS history_required_on_in_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    required_on TIMESTAMP NOT NULL,
    note TEXT, -- optional: why the change happened
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE
);

-- Tracks history of the current location of files
CREATE TABLE IF NOT EXISTS history_notes_in_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);


-- Add to users table
ALTER TABLE users ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN supabase_id TEXT; -- Will store UUID strings

-- Add to staff table
ALTER TABLE staff ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE staff ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE staff ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE staff ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE staff ADD COLUMN supabase_id TEXT;

-- Add to attendance table
ALTER TABLE attendance ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE attendance ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE attendance ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE attendance ADD COLUMN supabase_id TEXT;

-- Add to cases table
ALTER TABLE cases ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE cases ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE cases ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE cases ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE cases ADD COLUMN supabase_id TEXT;

-- Add to files table
ALTER TABLE files ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE files ADD COLUMN sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE files ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE files ADD COLUMN supabase_id TEXT;

-- Add to notifications table
ALTER TABLE notifications ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE notifications ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE notifications ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE notifications ADD COLUMN supabase_id TEXT;

-- Add to contacts table
ALTER TABLE contacts ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE contacts ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE contacts ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE contacts ADD COLUMN supabase_id TEXT;

-- Add to reports_analytics table
ALTER TABLE reports_analytics ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE reports_analytics ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE reports_analytics ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE reports_analytics ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE reports_analytics ADD COLUMN supabase_id TEXT;

-- Add to news table
ALTER TABLE news ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE news ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE news ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE news ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE news ADD COLUMN supabase_id TEXT;

-- Add to themes table
ALTER TABLE themes ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE themes ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE themes ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE themes ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE themes ADD COLUMN supabase_id TEXT;

-- Add to summaries table
ALTER TABLE summaries ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE summaries ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE summaries ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE summaries ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE summaries ADD COLUMN supabase_id TEXT;

-- Add to offenders table
ALTER TABLE offenders ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE offenders ADD COLUMN sync_status TEXT DEFAULT 'synced' CHECK(sync_status IN ('synced', 'pending', 'conflict'));
ALTER TABLE offenders ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE offenders ADD COLUMN sync_version INTEGER DEFAULT 1;
ALTER TABLE offenders ADD COLUMN supabase_id TEXT;


-- Track sync sessions
CREATE TABLE IF NOT EXISTS sync_sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    direction TEXT NOT NULL CHECK(direction IN ('upload', 'download')),
    records_processed INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('in-progress', 'completed', 'failed')),
    error_message TEXT
);

-- Track conflicts that need manual resolution
CREATE TABLE IF NOT EXISTS sync_conflicts (
    conflict_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    online_data TEXT,
    local_data TEXT,
    conflict_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution TEXT CHECK(resolution IN ('keep_online', 'keep_local', 'merged')),
    resolved_by INTEGER REFERENCES users(user_id)
);

-- Track last sync times
CREATE TABLE IF NOT EXISTS sync_metadata (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_sync TIMESTAMP,
    CONSTRAINT one_row CHECK (id = 1)
);


-- TRIGGERS
-- Trigger to insert into history_required_on_in_files when required_on is updated
-- Trigger to insert into history_notes_in_files when notes are updated
CREATE TRIGGER history_of_files
AFTER UPDATE ON files
FOR EACH ROW
BEGIN
    -- Record changes to required_on
    INSERT INTO history_required_on_in_files (file_id, required_on, note)
    SELECT NEW.file_id, NEW.required_on, 'required_on changed'
    WHERE NEW.required_on IS NOT NULL
      AND (OLD.required_on IS NULL OR NEW.required_on <> OLD.required_on);

    -- Record changes to notes
    INSERT INTO history_notes_in_files (file_id, note, created_at, created_by)
    SELECT NEW.file_id, NEW.notes, CURRENT_TIMESTAMP, NEW.uploaded_by
    WHERE NEW.notes IS NOT NULL
      AND NEW.notes <> OLD.notes;
END;

-- Update the history_of_files trigger to handle sync fields
DROP TRIGGER IF EXISTS history_of_files;

CREATE TRIGGER history_of_files
AFTER UPDATE ON files
FOR EACH ROW
BEGIN
    -- Record changes to required_on
    INSERT INTO history_required_on_in_files (file_id, required_on, note)
    SELECT NEW.file_id, NEW.required_on, 'required_on changed'
    WHERE NEW.required_on IS NOT NULL
      AND (OLD.required_on IS NULL OR NEW.required_on <> OLD.required_on);

    -- Record changes to notes
    INSERT INTO history_notes_in_files (file_id, note, created_at, created_by)
    SELECT NEW.file_id, NEW.notes, CURRENT_TIMESTAMP, NEW.uploaded_by
    WHERE NEW.notes IS NOT NULL
      AND NEW.notes <> OLD.notes;
      
    -- Update last_modified when relevant fields change
    UPDATE files SET last_modified = CURRENT_TIMESTAMP
    WHERE file_id = NEW.file_id AND (
        OLD.case_number <> NEW.case_number OR
        OLD.case_type <> NEW.case_type OR
        OLD.purpose <> NEW.purpose OR
        OLD.current_location <> NEW.current_location OR
        OLD.notes <> NEW.notes OR
        OLD.required_on <> NEW.required_on OR
        OLD.deleted <> NEW.deleted
    );
END;

-- Create triggers for other tables to update last_modified
CREATE TRIGGER IF NOT EXISTS update_user_modtime
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET last_modified = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id AND (
        OLD.name <> NEW.name OR
        OLD.role <> NEW.role OR
        OLD.email <> NEW.email OR
        OLD.phone_number <> NEW.phone_number OR
        OLD.status <> NEW.status OR
        OLD.is_deleted <> NEW.is_deleted
    );
END;

CREATE TRIGGER IF NOT EXISTS update_staff_modtime
AFTER UPDATE ON staff
FOR EACH ROW
BEGIN
    UPDATE staff SET last_modified = CURRENT_TIMESTAMP
    WHERE staff_id = NEW.staff_id AND (
        OLD.role <> NEW.role OR
        OLD.contact_number <> NEW.contact_number OR
        OLD.status <> NEW.status OR
        OLD.is_deleted <> NEW.is_deleted
    );
END;

CREATE TRIGGER IF NOT EXISTS update_attendance_modtime
AFTER UPDATE ON attendance
FOR EACH ROW
BEGIN
    UPDATE attendance SET last_modified = CURRENT_TIMESTAMP
    WHERE attendance_id = NEW.attendance_id AND (
        OLD.staff_id <> NEW.staff_id OR
        OLD.date <> NEW.date OR
        OLD.status <> NEW.status OR
        OLD.reason <> NEW.reason OR
        OLD.half_day <> NEW.half_day OR
        OLD.comments <> NEW.comments
    );
END;

CREATE TRIGGER IF NOT EXISTS update_cases_modtime
AFTER UPDATE ON cases
FOR EACH ROW
BEGIN
    UPDATE cases SET last_modified = CURRENT_TIMESTAMP
    WHERE case_id = NEW.case_id AND (
        OLD.title <> NEW.title OR
        OLD.status <> NEW.status OR
        OLD.assigned_staff_id <> NEW.assigned_staff_id OR
        OLD.priority <> NEW.priority
    );
END;

CREATE TRIGGER IF NOT EXISTS update_files_modtime
AFTER UPDATE ON files
FOR EACH ROW
BEGIN
    UPDATE files SET last_modified = CURRENT_TIMESTAMP
    WHERE file_id = NEW.file_id AND (
        OLD.case_number <> NEW.case_number OR
        OLD.case_type <> NEW.case_type OR
        OLD.purpose <> NEW.purpose OR
        OLD.current_location <> NEW.current_location OR
        OLD.notes <> NEW.notes OR
        OLD.required_on <> NEW.required_on OR
        OLD.deleted <> NEW.deleted
    );
END;

CREATE TRIGGER IF NOT EXISTS update_notifications_modtime
AFTER UPDATE ON notifications
FOR EACH ROW
BEGIN
    UPDATE notifications SET last_modified = CURRENT_TIMESTAMP
    WHERE notification_id = NEW.notification_id AND (
        OLD.message <> NEW.message OR
        OLD.type <> NEW.type OR
        OLD.read_status <> NEW.read_status
    );
END;

CREATE TRIGGER IF NOT EXISTS update_contacts_modtime
AFTER UPDATE ON contacts
FOR EACH ROW
BEGIN
    UPDATE contacts SET last_modified = CURRENT_TIMESTAMP
    WHERE contact_id = NEW.contact_id AND (
        OLD.name <> NEW.name OR
        OLD.role <> NEW.role OR
        OLD.phone_number <> NEW.phone_number
    );
END;

CREATE TRIGGER IF NOT EXISTS update_reports_analytics_modtime
AFTER UPDATE ON reports_analytics
FOR EACH ROW
BEGIN
    UPDATE reports_analytics SET last_modified = CURRENT_TIMESTAMP
    WHERE report_id = NEW.report_id AND (
        OLD.type <> NEW.type OR
        OLD.data_json <> NEW.data_json
    );
END;

CREATE TRIGGER IF NOT EXISTS update_news_modtime
AFTER UPDATE ON news
FOR EACH ROW
BEGIN
    UPDATE news SET last_modified = CURRENT_TIMESTAMP
    WHERE news_id = NEW.news_id AND (
        OLD.title <> NEW.title OR
        OLD.content <> NEW.content
    );
END;

CREATE TRIGGER IF NOT EXISTS update_themes_modtime
AFTER UPDATE ON themes
FOR EACH ROW
BEGIN
    UPDATE themes SET last_modified = CURRENT_TIMESTAMP
    WHERE theme_id = NEW.theme_id AND (
        OLD.name <> NEW.name OR
        OLD.config_json <> NEW.config_json
    );
END;

CREATE TRIGGER IF NOT EXISTS update_summaries_modtime
AFTER UPDATE ON summaries
FOR EACH ROW
BEGIN
    UPDATE summaries SET last_modified = CURRENT_TIMESTAMP
    WHERE summary_id = NEW.summary_id AND (
        OLD.title <> NEW.title OR
        OLD.content <> NEW.content OR
        OLD.category <> NEW.category
    );
END;

CREATE TRIGGER IF NOT EXISTS update_offenders_modtime
AFTER UPDATE ON offenders
FOR EACH ROW
BEGIN
    UPDATE offenders SET last_modified = CURRENT_TIMESTAMP
    WHERE offender_id = NEW.offender_id AND (
        OLD.full_name <> NEW.full_name OR
        OLD.national_id <> NEW.national_id OR
        OLD.date_of_birth <> NEW.date_of_birth OR
        OLD.gender <> NEW.gender OR
        OLD.photo_path <> NEW.photo_path OR
        OLD.notes <> NEW.notes
    );
END;


-- INDEXES
CREATE INDEX IF NOT EXISTS idx_history_required_on_file_id ON history_required_on_in_files(file_id);
CREATE INDEX IF NOT EXISTS idx_history_notes_file_id ON history_notes_in_files(file_id);


-- Trigger before inserting into the files table
-- SPECIAL REQUEST: In a day, there should be a maximum of 6 Criminal Cases.
-- If the limit is reached, the trigger will prevent the insertion of new records.
CREATE TRIGGER check_criminal_case_limit
BEFORE INSERT ON files
WHEN NEW.case_type = 'Criminal' AND (
    (SELECT COUNT(*) 
     FROM files 
     WHERE case_type = 'Criminal' 
       AND DATE(required_on) = DATE('now')) >= 6
)
BEGIN
    SELECT RAISE(FAIL, 'Maximum limit of 6 Criminal cases reached for today.');
END;


-- Create indexes for sync performance
CREATE INDEX IF NOT EXISTS idx_users_sync ON users(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_staff_sync ON staff(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_attendance_sync ON attendance(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_cases_sync ON cases(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_files_sync ON files(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_notifications_sync ON notifications(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_contacts_sync ON contacts(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_reports_sync ON reports_analytics(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_news_sync ON news(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_themes_sync ON themes(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_summaries_sync ON summaries(sync_status, last_modified);
CREATE INDEX IF NOT EXISTS idx_offenders_name ON offenders(full_name);

-- Insert initial sync metadata
INSERT OR IGNORE INTO sync_metadata (id, last_sync) VALUES (1, NULL);
ALTER TABLE sync_conflicts ADD COLUMN resolved BOOLEAN DEFAULT FALSE;




-------------------------------------
-- USERS
-------------------------------------
INSERT INTO users (name, role, email, phone_number, password_hash, status) VALUES
                                                                               ('Hon. C Kemei', 'Super Admin', 'cheptoock@gmail.com', '0795056287', '$2b$10$DWlaIIDDTGyPGMaEnZwct.QX5Tq5KrZ8KxHEeOrcSiD51gs9JhZzi', 'Active');
