-- Quick Storage Setup Test
-- Run this in your Supabase SQL Editor to check and set up storage

-- First, check if the certificates bucket exists
SELECT * FROM storage.buckets WHERE id = 'certificates';

-- If the bucket doesn't exist, create it with minimal policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('certificates', 'certificates', false, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to upload
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR ALL USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');

-- Test the setup
SELECT 
    b.id as bucket_id,
    b.name,
    b.public,
    b.file_size_limit,
    b.allowed_mime_types,
    COUNT(p.id) as policy_count
FROM storage.buckets b
LEFT JOIN pg_policies p ON p.tablename = 'objects' AND p.policyname LIKE '%certificates%'
WHERE b.id = 'certificates'
GROUP BY b.id, b.name, b.public, b.file_size_limit, b.allowed_mime_types;