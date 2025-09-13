-- Sample data for store_products table
-- Run this in your Supabase SQL editor to add test products

-- First, let's check if there are any users to assign as sellers
-- If not, you'll need to create them through your auth flow first

-- Insert sample products (you'll need to replace the seller_id with actual user IDs from your auth.users table)
INSERT INTO public.store_products (
    title, 
    description, 
    price, 
    original_price, 
    category, 
    condition, 
    seller_id,
    images,
    is_available
) VALUES 
(
    'Data Structures and Algorithms Textbook',
    'Complete textbook for DSA course. Covers all topics including arrays, linked lists, trees, graphs, and dynamic programming. Very good condition with minimal highlighting.',
    850.00,
    1200.00,
    'Books',
    'good',
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
    ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'],
    true
),
(
    'Scientific Calculator (Casio FX-991EX)',
    'Advanced scientific calculator perfect for engineering and math courses. All functions working perfectly. Includes original manual and protective case.',
    2500.00,
    3200.00,
    'Electronics',
    'like_new',
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
    ARRAY['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400'],
    true
),
(
    'Acoustic Guitar - Yamaha F280',
    'Beautiful acoustic guitar in excellent condition. Perfect for beginners and intermediate players. Includes guitar picks and carrying case.',
    8500.00,
    12000.00,
    'Instruments',
    'good',
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
    ARRAY['https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400'],
    true
),
(
    'Chemistry Lab Kit',
    'Complete chemistry laboratory kit with all essential equipment including beakers, test tubes, burner, and safety equipment. Great for home experiments.',
    1800.00,
    2500.00,
    'Lab Equipment',
    'good',
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
    ARRAY['https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400'],
    true
),
(
    'MacBook Air M1 (2020)',
    'Excellent condition MacBook Air with M1 chip. 8GB RAM, 256GB SSD. Perfect for programming and design work. Includes original charger and box.',
    65000.00,
    89900.00,
    'Electronics',
    'like_new',
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
    ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    true
),
(
    'Study Desk with Drawer',
    'Wooden study desk in very good condition. Perfect height for studying with built-in drawer for storage. Selling due to room change.',
    3500.00,
    5000.00,
    'Furniture',
    'good',
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
    ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
    true
);

-- Note: Before running this, make sure you have users in your auth.users table
-- You can check with: SELECT id, email FROM auth.users LIMIT 5;