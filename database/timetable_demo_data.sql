-- Timetable Demo Data for Bash Hub
-- This file contains sample timetable data for testing and demonstration
-- Replace 'your-user-id-here' with actual user UUID from auth.users table

-- Sample Timetable Data for a Computer Science Student
-- Weekday mapping: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday

-- Monday Schedule
INSERT INTO public.timetables (owner, weekday, period, subject, location, notes, start_time, end_time)
VALUES 
    ('your-user-id-here', 1, 1, 'Data Structures & Algorithms', 'Computer Lab A', 'Bring laptop for coding exercises', '09:00:00', '10:00:00'),
    ('your-user-id-here', 1, 2, 'Computer Networks', 'Room 301', 'TCP/IP Protocol discussion', '10:00:00', '11:00:00'),
    ('your-user-id-here', 1, 3, 'Mathematics III', 'Room 205', 'Linear Algebra chapter', '11:30:00', '12:30:00'),
    ('your-user-id-here', 1, 4, 'Software Engineering', 'Room 402', 'SDLC Models', '12:30:00', '13:30:00'),
    ('your-user-id-here', 1, 6, 'Database Systems Lab', 'Computer Lab B', 'SQL Queries practice', '14:30:00', '16:30:00');

-- Tuesday Schedule
INSERT INTO public.timetables (owner, weekday, period, subject, location, notes, start_time, end_time)
VALUES 
    ('your-user-id-here', 2, 1, 'Operating Systems', 'Room 203', 'Process Management', '09:00:00', '10:00:00'),
    ('your-user-id-here', 2, 2, 'Web Development', 'Computer Lab A', 'React.js components', '10:00:00', '11:00:00'),
    ('your-user-id-here', 2, 3, 'Compiler Design', 'Room 304', 'Lexical Analysis', '11:30:00', '12:30:00'),
    ('your-user-id-here', 2, 5, 'Machine Learning', 'AI Lab', 'Python scikit-learn', '13:30:00', '14:30:00'),
    ('your-user-id-here', 2, 6, 'Technical Writing', 'Room 101', 'Documentation standards', '14:30:00', '15:30:00');

-- Wednesday Schedule
INSERT INTO public.timetables (owner, weekday, period, subject, location, notes, start_time, end_time)
VALUES 
    ('your-user-id-here', 3, 1, 'Data Structures & Algorithms', 'Computer Lab A', 'Tree algorithms', '09:00:00', '10:00:00'),
    ('your-user-id-here', 3, 2, 'Computer Graphics', 'Graphics Lab', 'OpenGL programming', '10:00:00', '11:00:00'),
    ('your-user-id-here', 3, 4, 'Software Testing', 'Room 305', 'Unit testing frameworks', '12:30:00', '13:30:00'),
    ('your-user-id-here', 3, 5, 'Project Work', 'Project Lab', 'Team meeting with mentor', '13:30:00', '14:30:00'),
    ('your-user-id-here', 3, 6, 'Seminar', 'Seminar Hall', 'Student presentations', '14:30:00', '15:30:00');

-- Thursday Schedule
INSERT INTO public.timetables (owner, weekday, period, subject, location, notes, start_time, end_time)
VALUES 
    ('your-user-id-here', 4, 1, 'Artificial Intelligence', 'AI Lab', 'Search algorithms', '09:00:00', '10:00:00'),
    ('your-user-id-here', 4, 2, 'Computer Networks', 'Network Lab', 'Wireshark packet analysis', '10:00:00', '11:00:00'),
    ('your-user-id-here', 4, 3, 'Mathematics III', 'Room 205', 'Probability and Statistics', '11:30:00', '12:30:00'),
    ('your-user-id-here', 4, 4, 'Mobile App Development', 'Mobile Dev Lab', 'Flutter development', '12:30:00', '13:30:00'),
    ('your-user-id-here', 4, 6, 'Competitive Programming', 'Computer Lab C', 'LeetCode practice session', '14:30:00', '16:30:00');

-- Friday Schedule
INSERT INTO public.timetables (owner, weekday, period, subject, location, notes, start_time, end_time)
VALUES 
    ('your-user-id-here', 5, 1, 'Cloud Computing', 'Cloud Lab', 'AWS services overview', '09:00:00', '10:00:00'),
    ('your-user-id-here', 5, 2, 'Cybersecurity', 'Security Lab', 'Ethical hacking basics', '10:00:00', '11:00:00'),
    ('your-user-id-here', 5, 3, 'Software Engineering', 'Room 402', 'Agile methodology', '11:30:00', '12:30:00'),
    ('your-user-id-here', 5, 4, 'Industry Interaction', 'Conference Room', 'Guest lecture by tech lead', '12:30:00', '13:30:00'),
    ('your-user-id-here', 5, 5, 'Project Work', 'Project Lab', 'Final year project demo', '13:30:00', '14:30:00');

-- Additional Demo Data for Different Users (uncomment and update user IDs as needed)

-- Sample Schedule for User 2 (Different subjects - Mechanical Engineering)
/*
INSERT INTO public.timetables (owner, weekday, period, subject, location, notes, start_time, end_time)
VALUES 
    ('user-id-2', 1, 1, 'Thermodynamics', 'Room 401', 'Heat transfer concepts', '09:00:00', '10:00:00'),
    ('user-id-2', 1, 2, 'Fluid Mechanics', 'Fluid Lab', 'Bernoulli equation lab', '10:00:00', '11:00:00'),
    ('user-id-2', 1, 3, 'Machine Design', 'Design Studio', 'Gear design project', '11:30:00', '12:30:00'),
    ('user-id-2', 1, 4, 'Manufacturing Processes', 'Workshop', 'CNC machining demo', '12:30:00', '13:30:00'),
    ('user-id-2', 1, 6, 'CAD/CAM Lab', 'CAD Lab', 'SolidWorks modeling', '14:30:00', '16:30:00');
*/

-- Sample Schedule for User 3 (Electrical Engineering)
/*
INSERT INTO public.timetables (owner, weekday, period, subject, location, notes, start_time, end_time)
VALUES 
    ('user-id-3', 1, 1, 'Circuit Analysis', 'Electronics Lab', 'AC circuit analysis', '09:00:00', '10:00:00'),
    ('user-id-3', 1, 2, 'Digital Electronics', 'Digital Lab', 'Logic gate experiments', '10:00:00', '11:00:00'),
    ('user-id-3', 1, 3, 'Power Systems', 'Room 501', 'Transmission line theory', '11:30:00', '12:30:00'),
    ('user-id-3', 1, 4, 'Control Systems', 'Control Lab', 'PID controller design', '12:30:00', '13:30:00'),
    ('user-id-3', 1, 6, 'Microprocessors Lab', 'Microprocessor Lab', '8085 programming', '14:30:00', '16:30:00');
*/

-- Function to quickly insert demo data for a specific user
CREATE OR REPLACE FUNCTION insert_demo_timetable(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete existing timetable for the user
    DELETE FROM public.timetables WHERE owner = user_uuid;
    
    -- Insert the demo schedule (replace the first parameter with user_uuid)
    UPDATE public.timetables SET owner = user_uuid WHERE owner = 'your-user-id-here';
    
    -- If no rows were updated, insert fresh data
    IF NOT FOUND THEN
        INSERT INTO public.timetables (owner, weekday, period, subject, location, notes, start_time, end_time)
        SELECT 
            user_uuid,
            weekday,
            period,
            subject,
            location,
            notes,
            start_time,
            end_time
        FROM (VALUES
            (1, 1, 'Data Structures & Algorithms', 'Computer Lab A', 'Bring laptop for coding exercises', '09:00:00'::time, '10:00:00'::time),
            (1, 2, 'Computer Networks', 'Room 301', 'TCP/IP Protocol discussion', '10:00:00'::time, '11:00:00'::time),
            (1, 3, 'Mathematics III', 'Room 205', 'Linear Algebra chapter', '11:30:00'::time, '12:30:00'::time),
            (1, 4, 'Software Engineering', 'Room 402', 'SDLC Models', '12:30:00'::time, '13:30:00'::time),
            (1, 6, 'Database Systems Lab', 'Computer Lab B', 'SQL Queries practice', '14:30:00'::time, '16:30:00'::time),
            (2, 1, 'Operating Systems', 'Room 203', 'Process Management', '09:00:00'::time, '10:00:00'::time),
            (2, 2, 'Web Development', 'Computer Lab A', 'React.js components', '10:00:00'::time, '11:00:00'::time),
            (2, 3, 'Compiler Design', 'Room 304', 'Lexical Analysis', '11:30:00'::time, '12:30:00'::time),
            (2, 5, 'Machine Learning', 'AI Lab', 'Python scikit-learn', '13:30:00'::time, '14:30:00'::time),
            (2, 6, 'Technical Writing', 'Room 101', 'Documentation standards', '14:30:00'::time, '15:30:00'::time),
            (3, 1, 'Data Structures & Algorithms', 'Computer Lab A', 'Tree algorithms', '09:00:00'::time, '10:00:00'::time),
            (3, 2, 'Computer Graphics', 'Graphics Lab', 'OpenGL programming', '10:00:00'::time, '11:00:00'::time),
            (3, 4, 'Software Testing', 'Room 305', 'Unit testing frameworks', '12:30:00'::time, '13:30:00'::time),
            (3, 5, 'Project Work', 'Project Lab', 'Team meeting with mentor', '13:30:00'::time, '14:30:00'::time),
            (3, 6, 'Seminar', 'Seminar Hall', 'Student presentations', '14:30:00'::time, '15:30:00'::time),
            (4, 1, 'Artificial Intelligence', 'AI Lab', 'Search algorithms', '09:00:00'::time, '10:00:00'::time),
            (4, 2, 'Computer Networks', 'Network Lab', 'Wireshark packet analysis', '10:00:00'::time, '11:00:00'::time),
            (4, 3, 'Mathematics III', 'Room 205', 'Probability and Statistics', '11:30:00'::time, '12:30:00'::time),
            (4, 4, 'Mobile App Development', 'Mobile Dev Lab', 'Flutter development', '12:30:00'::time, '13:30:00'::time),
            (4, 6, 'Competitive Programming', 'Computer Lab C', 'LeetCode practice session', '14:30:00'::time, '16:30:00'::time),
            (5, 1, 'Cloud Computing', 'Cloud Lab', 'AWS services overview', '09:00:00'::time, '10:00:00'::time),
            (5, 2, 'Cybersecurity', 'Security Lab', 'Ethical hacking basics', '10:00:00'::time, '11:00:00'::time),
            (5, 3, 'Software Engineering', 'Room 402', 'Agile methodology', '11:30:00'::time, '12:30:00'::time),
            (5, 4, 'Industry Interaction', 'Conference Room', 'Guest lecture by tech lead', '12:30:00'::time, '13:30:00'::time),
            (5, 5, 'Project Work', 'Project Lab', 'Final year project demo', '13:30:00'::time, '14:30:00'::time)
        ) AS demo_data(weekday, period, subject, location, notes, start_time, end_time);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Usage Example:
-- To insert demo timetable for a specific user, run:
-- SELECT insert_demo_timetable('actual-user-uuid-here');

-- Quick insert for testing (update with real UUID):
-- SELECT insert_demo_timetable('123e4567-e89b-12d3-a456-426614174000');