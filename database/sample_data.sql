-- Sample Data for Bash Hub Database
-- Run this after setting up the main schema to populate with test data
-- This data is for development and testing purposes only

-- Insert sample profiles (you'll need real user IDs from auth.users)
-- Note: Replace these UUIDs with actual user IDs from your auth.users table

-- Sample colleges
INSERT INTO public.college_rankings (college_name, total_students, average_problems_solved, total_problems_solved, rank_position)
VALUES 
    ('Government Engineering College, Thiruvananthapuram', 45, 125.5, 5647, 1),
    ('LBS College of Engineering', 38, 98.2, 3731, 2),
    ('College of Engineering, Trivandrum', 52, 87.3, 4539, 3),
    ('Noorul Islam Centre for Higher Education', 29, 76.8, 2227, 4),
    ('Francis Xavier Engineering College', 33, 72.1, 2379, 5)
ON CONFLICT (college_name) DO UPDATE SET
    total_students = EXCLUDED.total_students,
    average_problems_solved = EXCLUDED.average_problems_solved,
    total_problems_solved = EXCLUDED.total_problems_solved,
    rank_position = EXCLUDED.rank_position;

-- Sample certificate categories
-- These will be created automatically when certificates are inserted

-- Sample study groups (requires real user IDs)
-- INSERT INTO public.study_groups (creator_id, name, description, subject, college_name, max_members)
-- VALUES 
--     ('user-uuid-1', 'Data Structures Study Group', 'Weekly sessions on DSA concepts and problem solving', 'Computer Science', 'Government Engineering College, Thiruvananthapuram', 15),
--     ('user-uuid-2', 'Web Development Bootcamp', 'Learn MERN stack development together', 'Web Development', 'LBS College of Engineering', 20),
--     ('user-uuid-3', 'Competitive Programming Club', 'Daily LeetCode and contest preparation', 'Algorithms', 'College of Engineering, Trivandrum', 25);

-- Sample events (requires real user IDs)
-- INSERT INTO public.events (creator_id, title, description, event_type, start_date, end_date, location, college_specific, registration_required, max_participants)
-- VALUES 
--     ('user-uuid-1', 'Tech Talk: AI in Healthcare', 'Guest lecture by industry expert on AI applications in healthcare', 'workshop', '2024-02-15 14:00:00+00', '2024-02-15 16:00:00+00', 'Main Auditorium', 'Government Engineering College, Thiruvananthapuram', true, 200),
--     ('user-uuid-2', 'Hackathon 2024', '48-hour coding marathon with exciting prizes', 'contest', '2024-03-01 09:00:00+00', '2024-03-03 18:00:00+00', 'Computer Lab', null, true, 100),
--     ('user-uuid-3', 'Career Guidance Workshop', 'Resume building and interview preparation session', 'placement', '2024-02-20 10:00:00+00', '2024-02-20 15:00:00+00', 'Seminar Hall', 'LBS College of Engineering', true, 150);

-- Function to generate sample timetable data
CREATE OR REPLACE FUNCTION generate_sample_timetable(user_id UUID)
RETURNS VOID AS $$
DECLARE
    subjects TEXT[] := ARRAY['Mathematics', 'Physics', 'Computer Science', 'English', 'Chemistry', 'Electronics', 'Engineering Graphics', 'Workshop'];
    locations TEXT[] := ARRAY['Room 101', 'Room 102', 'Lab A', 'Lab B', 'Auditorium', 'Workshop', 'Library'];
    weekday INT;
    period INT;
    subject_idx INT;
    location_idx INT;
BEGIN
    -- Generate timetable for weekdays (1-5, Monday to Friday)
    FOR weekday IN 1..5 LOOP
        -- Generate 6 periods per day
        FOR period IN 1..6 LOOP
            -- Randomly skip some periods (free periods)
            IF random() > 0.2 THEN
                subject_idx := floor(random() * array_length(subjects, 1)) + 1;
                location_idx := floor(random() * array_length(locations, 1)) + 1;
                
                INSERT INTO public.timetables (owner, weekday, period, subject, location, start_time, end_time)
                VALUES (
                    user_id,
                    weekday,
                    period,
                    subjects[subject_idx],
                    locations[location_idx],
                    (period + 8) || ':00:00',  -- Start times from 9:00 AM
                    (period + 9) || ':00:00'   -- End times (1 hour later)
                )
                ON CONFLICT (owner, weekday, period) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate sample store products
CREATE OR REPLACE FUNCTION generate_sample_products(seller_id UUID)
RETURNS VOID AS $$
DECLARE
    product_titles TEXT[] := ARRAY[
        'Data Structures and Algorithms in Java',
        'Computer Networks - Tanenbaum',
        'Yamaha Acoustic Guitar F310',
        'Scientific Calculator - Casio FX-991ES',
        'Operating Systems Concepts',
        'Linear Algebra and Its Applications',
        'Arduino Uno R3 Development Board',
        'Digital Electronics - Morris Mano',
        'Engineering Mechanics Textbook',
        'Programming in C - Kernighan'
    ];
    categories TEXT[] := ARRAY['Books', 'Electronics', 'Instruments', 'Stationery', 'Lab Equipment'];
    conditions TEXT[] := ARRAY['new', 'like_new', 'good', 'fair'];
    descriptions TEXT[] := ARRAY[
        'Excellent condition, well maintained',
        'Barely used, like new condition',
        'Good condition with minor wear',
        'Functional but shows usage signs',
        'Perfect for students, great value'
    ];
    i INT;
    title_idx INT;
    category_idx INT;
    condition_idx INT;
    desc_idx INT;
    base_price DECIMAL;
BEGIN
    FOR i IN 1..5 LOOP
        title_idx := floor(random() * array_length(product_titles, 1)) + 1;
        category_idx := floor(random() * array_length(categories, 1)) + 1;
        condition_idx := floor(random() * array_length(conditions, 1)) + 1;
        desc_idx := floor(random() * array_length(descriptions, 1)) + 1;
        base_price := (random() * 500 + 100)::DECIMAL(10,2);
        
        INSERT INTO public.store_products (
            seller_id, title, description, price, original_price, category, 
            condition, location, is_available, is_negotiable
        ) VALUES (
            seller_id,
            product_titles[title_idx],
            descriptions[desc_idx],
            base_price,
            (base_price * (1.2 + random() * 0.5))::DECIMAL(10,2),
            categories[category_idx],
            conditions[condition_idx],
            'College Campus',
            true,
            random() > 0.5
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update user's LeetCode stats
CREATE OR REPLACE FUNCTION update_sample_leetcode_stats(user_id UUID, username TEXT)
RETURNS VOID AS $$
DECLARE
    total_problems INT := floor(random() * 300 + 50);
    easy_count INT := floor(total_problems * 0.5);
    medium_count INT := floor(total_problems * 0.35);
    hard_count INT := total_problems - easy_count - medium_count;
    rating INT := floor(random() * 1000 + 1200);
    streak INT := floor(random() * 30);
BEGIN
    INSERT INTO public.leetcode_stats (
        user_id, leetcode_username, total_solved, easy_solved, medium_solved, hard_solved,
        contest_rating, acceptance_rate, streak_count, max_streak, last_solved_date
    ) VALUES (
        user_id,
        username,
        total_problems,
        easy_count,
        medium_count,
        hard_count,
        rating,
        (random() * 40 + 60)::DECIMAL(5,2),
        streak,
        streak + floor(random() * 20),
        CURRENT_DATE - floor(random() * 7)::INT
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_solved = EXCLUDED.total_solved,
        easy_solved = EXCLUDED.easy_solved,
        medium_solved = EXCLUDED.medium_solved,
        hard_solved = EXCLUDED.hard_solved,
        contest_rating = EXCLUDED.contest_rating,
        acceptance_rate = EXCLUDED.acceptance_rate,
        streak_count = EXCLUDED.streak_count,
        max_streak = EXCLUDED.max_streak,
        last_solved_date = EXCLUDED.last_solved_date;
END;
$$ LANGUAGE plpgsql;

-- Instructions for adding sample data:
-- 
-- 1. First, create some users through your application's signup process
-- 2. Get their user IDs from auth.users table
-- 3. Use the helper functions above to generate sample data:
--
-- Example usage (replace with actual user IDs):
-- SELECT generate_sample_timetable('actual-user-uuid-here');
-- SELECT generate_sample_products('actual-user-uuid-here');
-- SELECT update_sample_leetcode_stats('actual-user-uuid-here', 'sample_username');
--
-- 4. You can also manually insert profile updates:
-- UPDATE public.profiles SET 
--     college_name = 'Government Engineering College, Thiruvananthapuram',
--     leetcode_username = 'sample_user',
--     year_of_study = 3,
--     branch = 'Computer Science'
-- WHERE id = 'actual-user-uuid-here';

-- Clean up functions (run these after generating sample data)
-- DROP FUNCTION IF EXISTS generate_sample_timetable(UUID);
-- DROP FUNCTION IF EXISTS generate_sample_products(UUID);
-- DROP FUNCTION IF EXISTS update_sample_leetcode_stats(UUID, TEXT);