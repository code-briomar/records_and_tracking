-- DROP TABLE IF EXISTS summaries;
-- DROP TABLE IF EXISTS themes;
-- DROP TABLE IF EXISTS news;
-- DROP TABLE IF EXISTS reports_analytics;
-- DROP TABLE IF EXISTS contacts;
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS files;
-- DROP TABLE IF EXISTS cases;
-- DROP TABLE IF EXISTS attendance;
-- DROP TABLE IF EXISTS staff;
-- DROP TABLE IF EXISTS users;

-- Enable foreign key support for SQLite
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    role          TEXT CHECK(role IN ('Super Admin', 'Court Admin', 'Staff')) NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone_number  TEXT,
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

-- Files Table
CREATE TABLE IF NOT EXISTS files (
    file_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name     TEXT NOT NULL,
    uploaded_by   INTEGER NOT NULL,
    date_uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size     TEXT NOT NULL,
    case_id       INTEGER,
    version       TEXT DEFAULT '1.0',
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE SET NULL
);

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
