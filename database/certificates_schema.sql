-- Certificates Database Schema and Setup
-- This file contains the complete database setup for certificate management
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create certificates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('academic', 'professional', 'personal', 'certification', 'general')),
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
    issuer TEXT,
    issue_date DATE,
    expiry_date DATE,
    verification_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS certificates_owner_idx ON public.certificates(owner);
CREATE INDEX IF NOT EXISTS certificates_category_idx ON public.certificates(category);
CREATE INDEX IF NOT EXISTS certificates_visibility_idx ON public.certificates(visibility);
CREATE INDEX IF NOT EXISTS certificates_created_at_idx ON public.certificates(created_at DESC);
CREATE INDEX IF NOT EXISTS certificates_title_idx ON public.certificates USING gin(to_tsvector('english', title));

-- Create storage bucket for certificates if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for certificates bucket
-- Policy: Users can upload certificates
CREATE POLICY "Users can upload certificates" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'certificates' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'certificates' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can update their own certificates
CREATE POLICY "Users can update own certificates" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'certificates' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own certificates
CREATE POLICY "Users can delete own certificates" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'certificates' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create RLS policies for certificates table
-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = owner);

-- Policy: Users can insert their own certificates
CREATE POLICY "Users can insert own certificates" ON public.certificates
    FOR INSERT WITH CHECK (auth.uid() = owner);

-- Policy: Users can update their own certificates
CREATE POLICY "Users can update own certificates" ON public.certificates
    FOR UPDATE USING (auth.uid() = owner);

-- Policy: Users can delete their own certificates
CREATE POLICY "Users can delete own certificates" ON public.certificates
    FOR DELETE USING (auth.uid() = owner);

-- Policy: Public certificates can be viewed by anyone (optional)
CREATE POLICY "Public certificates viewable by all" ON public.certificates
    FOR SELECT USING (visibility = 'public');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at_certificates()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at_certificates ON public.certificates;
CREATE TRIGGER handle_updated_at_certificates
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at_certificates();

-- Create function to get certificate statistics
CREATE OR REPLACE FUNCTION get_certificate_stats(user_id UUID)
RETURNS TABLE (
    total_certificates BIGINT,
    public_certificates BIGINT,
    private_certificates BIGINT,
    categories JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_certificates,
        COUNT(*) FILTER (WHERE visibility = 'public') as public_certificates,
        COUNT(*) FILTER (WHERE visibility = 'private') as private_certificates,
        jsonb_object_agg(category, count) as categories
    FROM (
        SELECT 
            category,
            COUNT(*) as count
        FROM public.certificates 
        WHERE owner = user_id
        GROUP BY category
    ) category_counts;
END;
$$ LANGUAGE plpgsql;

-- Create function to search certificates
CREATE OR REPLACE FUNCTION search_certificates(
    user_id UUID,
    search_term TEXT DEFAULT '',
    category_filter TEXT DEFAULT '',
    visibility_filter TEXT DEFAULT ''
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    file_path TEXT,
    category TEXT,
    visibility TEXT,
    issuer TEXT,
    issue_date DATE,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.file_path,
        c.category,
        c.visibility,
        c.issuer,
        c.issue_date,
        c.created_at,
        CASE 
            WHEN search_term = '' THEN 0::REAL
            ELSE ts_rank(to_tsvector('english', c.title || ' ' || COALESCE(c.description, '')), plainto_tsquery('english', search_term))
        END as rank
    FROM public.certificates c
    WHERE c.owner = user_id
        AND (search_term = '' OR to_tsvector('english', c.title || ' ' || COALESCE(c.description, '')) @@ plainto_tsquery('english', search_term))
        AND (category_filter = '' OR c.category = category_filter)
        AND (visibility_filter = '' OR c.visibility = visibility_filter)
    ORDER BY 
        CASE WHEN search_term = '' THEN c.created_at END DESC,
        CASE WHEN search_term != '' THEN rank END DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up orphaned files (run periodically)
CREATE OR REPLACE FUNCTION cleanup_orphaned_certificate_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    file_record RECORD;
BEGIN
    -- Find files in storage that don't have corresponding database records
    FOR file_record IN
        SELECT name
        FROM storage.objects
        WHERE bucket_id = 'certificates'
        AND name NOT IN (
            SELECT file_path
            FROM public.certificates
            WHERE file_path IS NOT NULL
        )
    LOOP
        -- Delete the orphaned file
        DELETE FROM storage.objects
        WHERE bucket_id = 'certificates' AND name = file_record.name;
        
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (optional - remove in production)
-- INSERT INTO public.certificates (owner, title, description, file_path, category, visibility) VALUES
-- (auth.uid(), 'Sample Certificate', 'This is a sample certificate', 'sample.pdf', 'academic', 'private');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.certificates TO authenticated;
GRANT EXECUTE ON FUNCTION get_certificate_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_certificates(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_certificate_files() TO authenticated;