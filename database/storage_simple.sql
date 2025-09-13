-- Simplified Supabase Storage Setup for Bash Hub
-- This is a more permissive setup that should work reliably
-- Run this in your Supabase SQL editor

-- Create storage buckets (simplified)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('certificates', 'certificates', false, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own certificates" ON storage.objects;

-- Simplified storage policies for certificates bucket
CREATE POLICY "Users can view own certificates" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'certificates' AND 
        (
            -- Allow users to see their own files (files containing their user ID)
            name LIKE '%' || auth.uid()::text || '%' OR
            -- Allow public certificates
            EXISTS (
                SELECT 1 FROM public.certificates 
                WHERE file_path = name AND visibility = 'public'
            )
        )
    );

CREATE POLICY "Users can upload certificates" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'certificates' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own certificates" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'certificates' AND 
        name LIKE '%' || auth.uid()::text || '%'
    );

CREATE POLICY "Users can delete own certificates" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'certificates' AND 
        name LIKE '%' || auth.uid()::text || '%'
    );

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;