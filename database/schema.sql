-- Bash Hub Database Schema
-- This file contains all table definitions for the Bash Hub application
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    personal_email TEXT,
    college_email TEXT,
    leetcode_username TEXT,
    linkedin_url TEXT,
    college_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    year_of_study INTEGER,
    branch TEXT,
    phone_number TEXT,
    leetcode_points INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    total_problems_solved INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create timetables table
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6), -- 0 = Sunday, 6 = Saturday
    period INTEGER NOT NULL CHECK (period >= 1 AND period <= 10), -- Support up to 10 periods per day
    subject TEXT,
    location TEXT,
    notes TEXT,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(owner, weekday, period)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
    issuer TEXT,
    issue_date DATE,
    expiry_date DATE,
    verification_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create store_products table
CREATE TABLE IF NOT EXISTS public.store_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10,2) CHECK (original_price >= 0),
    category TEXT NOT NULL,
    condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    images TEXT[], -- Array of image URLs
    tags TEXT[],
    location TEXT,
    is_available BOOLEAN DEFAULT true,
    is_negotiable BOOLEAN DEFAULT false,
    contact_preference TEXT DEFAULT 'app' CHECK (contact_preference IN ('app', 'email', 'phone')),
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create store_favorites table (for wishlist functionality)
CREATE TABLE IF NOT EXISTS public.store_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.store_products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Create store_messages table (for buyer-seller communication)
CREATE TABLE IF NOT EXISTS public.store_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.store_products(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create leetcode_stats table (for detailed leaderboard tracking)
CREATE TABLE IF NOT EXISTS public.leetcode_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    leetcode_username TEXT NOT NULL,
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    contest_rating INTEGER DEFAULT 0,
    contest_ranking INTEGER,
    acceptance_rate DECIMAL(5,2) DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_solved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create leetcode_submissions table (for tracking daily progress)
CREATE TABLE IF NOT EXISTS public.leetcode_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    problem_title TEXT NOT NULL,
    problem_difficulty TEXT CHECK (problem_difficulty IN ('Easy', 'Medium', 'Hard')),
    problem_url TEXT,
    submission_date DATE NOT NULL,
    runtime INTEGER, -- in milliseconds
    memory_usage DECIMAL(10,2), -- in MB
    language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create college_rankings table (for college-wise leaderboards)
CREATE TABLE IF NOT EXISTS public.college_rankings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_name TEXT NOT NULL,
    total_students INTEGER DEFAULT 0,
    average_problems_solved DECIMAL(10,2) DEFAULT 0,
    total_problems_solved INTEGER DEFAULT 0,
    rank_position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(college_name)
);

-- Create events table (for college events and notifications)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'general' CHECK (event_type IN ('general', 'workshop', 'contest', 'placement', 'cultural')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    college_specific TEXT, -- If event is specific to a college
    registration_required BOOLEAN DEFAULT false,
    registration_link TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    tags TEXT[],
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    UNIQUE(event_id, user_id)
);

-- Create study_groups table
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    college_name TEXT,
    max_members INTEGER DEFAULT 20,
    current_members INTEGER DEFAULT 1,
    is_private BOOLEAN DEFAULT false,
    invite_code TEXT UNIQUE,
    meeting_schedule TEXT, -- JSON string for flexible scheduling
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create study_group_members table
CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_college_name_idx ON public.profiles(college_name);
CREATE INDEX IF NOT EXISTS profiles_leetcode_points_idx ON public.profiles(leetcode_points DESC);
CREATE INDEX IF NOT EXISTS timetables_owner_weekday_idx ON public.timetables(owner, weekday);
CREATE INDEX IF NOT EXISTS certificates_owner_idx ON public.certificates(owner);
CREATE INDEX IF NOT EXISTS certificates_category_visibility_idx ON public.certificates(category, visibility);
CREATE INDEX IF NOT EXISTS store_products_seller_idx ON public.store_products(seller_id);
CREATE INDEX IF NOT EXISTS store_products_category_available_idx ON public.store_products(category, is_available);
CREATE INDEX IF NOT EXISTS store_products_created_at_idx ON public.store_products(created_at DESC);
CREATE INDEX IF NOT EXISTS leetcode_stats_user_idx ON public.leetcode_stats(user_id);
CREATE INDEX IF NOT EXISTS leetcode_submissions_user_date_idx ON public.leetcode_submissions(user_id, submission_date);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON public.events(start_date);
CREATE INDEX IF NOT EXISTS events_college_active_idx ON public.events(college_specific, is_active);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_timetables
    BEFORE UPDATE ON public.timetables
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_certificates
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_store_products
    BEFORE UPDATE ON public.store_products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_leetcode_stats
    BEFORE UPDATE ON public.leetcode_stats
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_college_rankings
    BEFORE UPDATE ON public.college_rankings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_events
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_study_groups
    BEFORE UPDATE ON public.study_groups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, personal_email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();