-- Insert Users
INSERT INTO users (name, role, email, phone_number, password_hash, status) VALUES
('Admin User', 'Super Admin', 'admin@example.com', '1234567890', 'hashed_password_1', 'Active'),
('Court Manager', 'Court Admin', 'courtadmin@example.com', '0987654321', 'hashed_password_2', 'Active'),
('Staff Member', 'Staff', 'staff@example.com', '1122334455', 'hashed_password_3', 'Active');

-- Insert Staff (Link to Users)
INSERT INTO staff (user_id, role, contact_number, status) VALUES
(3, 'Clerk', '1122334455', 'Active');

-- Insert Attendance Records
INSERT INTO attendance (staff_id, date, status, reason, half_day, comments) VALUES
(1, '2025-03-28', 'Present', NULL, 0, 'On time'),
(1, '2025-03-27', 'Absent', 'Sick leave', 0, 'Doctor’s note provided');

-- Insert Cases
INSERT INTO cases (title, status, assigned_staff_id, priority, date_created) VALUES
('Property Dispute Case', 'Open', 1, 'High', CURRENT_TIMESTAMP),
('Contract Violation', 'In Progress', 1, 'Medium', CURRENT_TIMESTAMP);

-- Insert Files
INSERT INTO files (file_name, uploaded_by, date_uploaded, file_size, case_id, version) VALUES
('contract_violation.pdf', 1, CURRENT_TIMESTAMP, '2MB', 1, '1.0'),
('property_dispute_evidence.jpg', 2, CURRENT_TIMESTAMP, '500KB', 2, '1.0');

-- Insert Notifications
INSERT INTO notifications (message, type, date_created, read_status, user_id) VALUES
('New case assigned to you.', 'Info', CURRENT_TIMESTAMP, 0, 1),
('Upcoming court session on Monday.', 'Warning', CURRENT_TIMESTAMP, 0, 2);

-- Insert Contacts
INSERT INTO contacts (name, role, phone_number) VALUES
('Judge Smith', 'Court Admin', '555-1234'),
('Legal Advisor John', 'Super Admin', '555-5678');

-- Insert Reports
INSERT INTO reports_analytics (type, data_json, generated_at) VALUES
('Attendance', '{"total_present": 20, "total_absent": 5}', CURRENT_TIMESTAMP),
('Cases', '{"open_cases": 15, "closed_cases": 5}', CURRENT_TIMESTAMP);

-- Insert News
INSERT INTO news (title, content, published_date) VALUES
('New Legal Policies Announced', 'The court has released new legal guidelines for 2025.', CURRENT_TIMESTAMP),
('Holiday Schedule Update', 'The court will be closed on national holidays.', CURRENT_TIMESTAMP);

-- Insert Themes
INSERT INTO themes (name, config_json, user_id) VALUES
('Dark Mode', '{"background": "#000000", "text": "#FFFFFF"}', NULL),
('Light Mode', '{"background": "#FFFFFF", "text": "#000000"}', NULL);

-- Insert Summaries
INSERT INTO summaries (title, content, category, generated_at, generated_by) VALUES
('Weekly Case Summary', '10 new cases filed this week.', 'Cases', CURRENT_TIMESTAMP, 'System'),
('Attendance Analysis', 'Attendance rate for the month is 85%.', 'Attendance', CURRENT_TIMESTAMP, 'System');
