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
    purpose TEXT CHECK(purpose IN ('Ruling', 'Judgement', 'Other')) NOT NULL, -- for
    uploaded_by INTEGER NOT NULL, -- ID of the user who uploaded the file
    current_location TEXT NOT NULL, -- Current location of the file (e.g., court, archive, etc.)
    notes TEXT NOT NULL, -- Notes or comments about the file
    date_recieved TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date the file was recorded/uploaded
    required_on TIMESTAMP NOT NULL, -- Date the file is needed by
    required_on_signature TEXT NOT NULL, -- Signature of the person who recorded the file
    date_returned TIMESTAMP, -- Date the file was returned
    date_returned_signature TEXT, -- Signature of the person who returned the file
    deleted INT DEFAULT 0, -- 1 for true, 0 for false
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE
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


-- INDEXES
CREATE INDEX IF NOT EXISTS idx_history_required_on_file_id ON history_required_on_in_files(file_id);
CREATE INDEX IF NOT EXISTS idx_history_notes_file_id ON history_notes_in_files(file_id);

