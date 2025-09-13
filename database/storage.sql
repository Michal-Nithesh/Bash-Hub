-- Supabase Storage Setup for Bash Hub
-- Run this in your Supabase SQL editor after setting up the main schema

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('certificates', 'certificates', false, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']),
    ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']),
    ('product-images', 'product-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
    ('event-images', 'event-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for certificates bucket
CREATE POLICY "Users can view own certificates" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'certificates' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR
         EXISTS (
             SELECT 1 FROM public.certificates 
             WHERE file_path = name AND visibility = 'public'
         ))
    );

CREATE POLICY "Users can upload own certificates" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'certificates' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own certificates" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'certificates' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own certificates" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'certificates' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for product-images bucket
CREATE POLICY "Product images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for event-images bucket
CREATE POLICY "Event images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Users can upload event images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'event-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own event images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'event-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own event images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'event-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );