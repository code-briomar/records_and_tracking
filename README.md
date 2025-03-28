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
