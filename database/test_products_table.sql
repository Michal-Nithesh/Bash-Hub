-- Quick test to check if store_products table exists and has data
-- Run this in your Supabase SQL editor

-- 1. Check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'store_products'
);

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'store_products'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Count total products
SELECT COUNT(*) as total_products FROM public.store_products;

-- 4. Show sample products (if any)
SELECT 
    id,
    title,
    price,
    category,
    condition,
    is_available,
    created_at
FROM public.store_products
ORDER BY created_at DESC
LIMIT 5;