-- Quick Timetable Demo Data
-- Simple INSERT statements for immediate testing
-- Instructions: Replace 'PUT_YOUR_USER_ID_HERE' with actual user UUID from auth.users

-- Computer Science Student Weekly Schedule
-- Monday (weekday = 1)
INSERT INTO timetables (owner, weekday, period, subject, location, start_time, end_time) VALUES
('PUT_YOUR_USER_ID_HERE', 1, 1, 'Data Structures', 'Lab A', '09:00', '10:00'),
('PUT_YOUR_USER_ID_HERE', 1, 2, 'Computer Networks', 'Room 301', '10:00', '11:00'),
('PUT_YOUR_USER_ID_HERE', 1, 3, 'Mathematics', 'Room 205', '11:30', '12:30'),
('PUT_YOUR_USER_ID_HERE', 1, 4, 'Software Engineering', 'Room 402', '12:30', '13:30');

-- Tuesday (weekday = 2) 
INSERT INTO timetables (owner, weekday, period, subject, location, start_time, end_time) VALUES
('PUT_YOUR_USER_ID_HERE', 2, 1, 'Operating Systems', 'Room 203', '09:00', '10:00'),
('PUT_YOUR_USER_ID_HERE', 2, 2, 'Web Development', 'Lab A', '10:00', '11:00'),
('PUT_YOUR_USER_ID_HERE', 2, 3, 'Compiler Design', 'Room 304', '11:30', '12:30'),
('PUT_YOUR_USER_ID_HERE', 2, 5, 'Machine Learning', 'AI Lab', '13:30', '14:30');

-- Wednesday (weekday = 3)
INSERT INTO timetables (owner, weekday, period, subject, location, start_time, end_time) VALUES
('PUT_YOUR_USER_ID_HERE', 3, 1, 'Algorithms', 'Lab A', '09:00', '10:00'),
('PUT_YOUR_USER_ID_HERE', 3, 2, 'Computer Graphics', 'Graphics Lab', '10:00', '11:00'),
('PUT_YOUR_USER_ID_HERE', 3, 4, 'Software Testing', 'Room 305', '12:30', '13:30'),
('PUT_YOUR_USER_ID_HERE', 3, 6, 'Seminar', 'Seminar Hall', '14:30', '15:30');

-- Thursday (weekday = 4)
INSERT INTO timetables (owner, weekday, period, subject, location, start_time, end_time) VALUES
('PUT_YOUR_USER_ID_HERE', 4, 1, 'Artificial Intelligence', 'AI Lab', '09:00', '10:00'),
('PUT_YOUR_USER_ID_HERE', 4, 2, 'Networks Lab', 'Network Lab', '10:00', '11:00'),
('PUT_YOUR_USER_ID_HERE', 4, 3, 'Statistics', 'Room 205', '11:30', '12:30'),
('PUT_YOUR_USER_ID_HERE', 4, 6, 'Competitive Programming', 'Lab C', '14:30', '16:30');

-- Friday (weekday = 5)
INSERT INTO timetables (owner, weekday, period, subject, location, start_time, end_time) VALUES
('PUT_YOUR_USER_ID_HERE', 5, 1, 'Cloud Computing', 'Cloud Lab', '09:00', '10:00'),
('PUT_YOUR_USER_ID_HERE', 5, 2, 'Cybersecurity', 'Security Lab', '10:00', '11:00'),
('PUT_YOUR_USER_ID_HERE', 5, 3, 'Software Engineering', 'Room 402', '11:30', '12:30'),
('PUT_YOUR_USER_ID_HERE', 5, 5, 'Project Work', 'Project Lab', '13:30', '14:30');

-- To use this data:
-- 1. Get your user ID from auth.users table or Supabase dashboard
-- 2. Replace 'PUT_YOUR_USER_ID_HERE' with your actual UUID
-- 3. Run these INSERT statements in Supabase SQL editor
-- 4. The timetable will show up in your application