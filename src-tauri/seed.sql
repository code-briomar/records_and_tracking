-- seed.sql
-- Enable foreign key support for SQLite (if not already set in your schema script)
PRAGMA foreign_keys = ON;

-------------------------------------
-- USERS
-------------------------------------
INSERT INTO users (name, role, email, phone_number, password_hash, status) VALUES
                                                                               ('Juma Mwangi', 'Super Admin', 'juma.mwangi@example.co.ke', '0712345678', 'hashpassword1', 'Active'),
                                                                               ('Achieng Otieno', 'Court Admin', 'achieng.otieno@example.co.ke', '0723456789', 'hashpassword2', 'Active'),
                                                                               ('Kamau Karanja', 'Staff', 'kamau.karanja@example.co.ke', '0734567890', 'hashpassword3', 'Active'),
                                                                               ('Wanjiku Njeri', 'Staff', 'wanjiku.njeri@example.co.ke', '0745678901', 'hashpassword4', 'Active');

-------------------------------------
-- STAFF
-------------------------------------
-- Assuming only staff members (role 'Staff') have entries in the staff table.
INSERT INTO staff (user_id, role, contact_number, status) VALUES
                                                              (3, 'Officer', '0734567890', 'Active'),
                                                              (4, 'Prosecutor', '0745678901', 'Active');

-------------------------------------
-- ATTENDANCE
-------------------------------------
-- Sample attendance records for staff (using staff_id from the above inserts)
INSERT INTO attendance (staff_id, date, status, reason, half_day, comments) VALUES
                                                                                (1, '2025-04-15', 'Present', NULL, 0, 'On duty at the main court complex'),
                                                                                (2, '2025-04-15', 'Absent', 'Medical leave', 0, 'Reported sick in the morning');

-------------------------------------
-- CASES
-------------------------------------
INSERT INTO cases (title, status, assigned_staff_id, priority, date_created) VALUES
                                                                                 ('Corruption Case - Nairobi County', 'In Progress', 1, 'High', '2025-04-10 09:00:00'),
                                                                                 ('Land Dispute - Kisumu Region', 'Open', NULL, 'Medium', '2025-04-12 10:30:00');

-------------------------------------
-- FILES
-------------------------------------
INSERT INTO files (
    case_number,
    case_type,
    purpose,
    uploaded_by,
    current_location,
    notes,
    date_recieved,
    required_on,
    required_on_signature,
    date_returned,
    date_returned_signature,
    deleted
) VALUES
(
    'case_document_03',
    'Criminal',
    'Ruling',
    3,
    'Court Archive',
    'Suspect charged under new ordinance.',
    '2025-05-10 10:00:00',
    DATE('now'),
    'Signed by Clerk C',
    NULL,
    NULL,
    0
),
(
    'case_document_04',
    'Criminal',
    'Judgement',
    4,
    'Evidence Room',
    'Witness statements corroborated.',
    '2025-05-11 14:30:00',
    DATE('now'),
    'Signed by Clerk D',
    NULL,
    NULL,
    0
),
(
    'case_document_05',
    'Criminal',
    'Other',
    2,
    'Court Registry',
    'Surveillance footage submitted.',
    '2025-05-12 09:00:00',
    DATE('now'),
    'Signed by Clerk E',
    NULL,
    NULL,
    0
),
(
    'case_document_06',
    'Criminal',
    'Ruling',
    3,
    'Court Archive',
    'Hearing adjourned.',
    '2025-05-15 16:00:00',
    DATE('now'),
    'Signed by Clerk F',
    NULL,
    NULL,
    0
),
(
    'case_document_07',
    'Criminal',
    'Judgement',
    4,
    'Investigation Unit',
    'Final report received.',
    '2025-05-18 11:45:00',
    DATE('now'),
    'Signed by Clerk G',
    NULL,
    NULL,
    0
);


-------------------------------------
-- NOTIFICATIONS
-------------------------------------
INSERT INTO notifications (message, type, user_id) VALUES
                                                       ('Court hearing scheduled for corruption case in Nairobi.', 'Info', 2),
                                                       ('Additional evidence required for land dispute in Kisumu.', 'Warning', 1);

-------------------------------------
-- CONTACTS
-------------------------------------
INSERT INTO contacts (name, role, phone_number) VALUES
                                                    ('Nairobi Court Registrar', 'Court Admin', '0201234567'),
                                                    ('Head, Legal Department', 'Super Admin', '0207654321');

-------------------------------------
-- REPORTS & ANALYTICS
-------------------------------------
INSERT INTO reports_analytics (type, data_json) VALUES
                                                    ('Cases', '{"total_cases":5, "closed":3, "open":2}'),
                                                    ('Attendance', '{"present":47, "absent":3}');

-------------------------------------
-- NEWS
-------------------------------------
INSERT INTO news (title, content) VALUES
                                      ('New Judicial Reforms Announced', 'The Kenyan government has unveiled reforms to expedite court proceedings nationwide.'),
                                      ('Security Alert in Nairobi', 'Heightened security measures deployed as part of ongoing safety efforts in central Nairobi.');

-------------------------------------
-- THEMES
-------------------------------------
INSERT INTO themes (name, config_json, user_id) VALUES
    ('Kenyan Blue', '{"primaryColor": "#0B3D91", "secondaryColor": "#FFD700"}', 1);

-------------------------------------
-- SUMMARIES
-------------------------------------
INSERT INTO summaries (title, content, category, generated_by) VALUES
                                                                   ('Weekly Case Summary', 'Summary of cases processed in the Nairobi region this week.', 'Cases', 'Juma Mwangi'),
                                                                   ('Monthly Attendance Report', 'Detailed attendance report for April 2025 across all courts.', 'Attendance', 'Kamau Karanja');

-------------------------------------
-- Optionally, you can also add initial data to the HISTORY tables via triggers
-- (Note: the triggers will automatically insert history records upon updates in the "files" table.)
