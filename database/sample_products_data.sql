-- Sample Products Data for Testing
-- Insert sample products into the products table

INSERT INTO public.products (
  title,
  description,
  price,
  original_price,
  category,
  condition,
  seller_id,
  seller_name,
  seller_college,
  contact_method,
  images,
  available,
  created_at,
  updated_at
) VALUES
(
  'Data Structures and Algorithms in Java',
  'Comprehensive textbook covering all major data structures and algorithms. Excellent condition with minimal highlighting. Perfect for CS students.',
  850.00,
  1200.00,
  'Books',
  'good',
  NULL, -- Will need to replace with actual user UUID
  'John Doe',
  'MIT College of Engineering',
  'WhatsApp: +91 9876543210',
  ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'],
  true,
  NOW(),
  NOW()
),
(
  'Acoustic Guitar Yamaha F310',
  'Well-maintained acoustic guitar, perfect for beginners and intermediate players. Includes carrying case and pick set.',
  4500.00,
  6500.00,
  'Instruments',
  'like_new',
  NULL,
  'Sarah Wilson',
  'St. Xavier\'s College',
  'Email: sarah.music@email.com',
  ARRAY['https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=500'],
  true,
  NOW(),
  NOW()
),
(
  'Scientific Calculator Casio fx-991EX',
  'Advanced scientific calculator with matrix calculations and equation solving. Essential for engineering students.',
  1200.00,
  1800.00,
  'Electronics',
  'new',
  NULL,
  'Mike Chen',
  'IIT Bombay',
  'Phone: +91 8765432109',
  ARRAY['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500'],
  true,
  NOW(),
  NOW()
),
(
  'Organic Chemistry Textbook Morrison & Boyd',
  'Classic organic chemistry reference. Some wear on cover but all pages intact. Great for medical and chemistry students.',
  650.00,
  950.00,
  'Books',
  'fair',
  NULL,
  'Priya Sharma',
  'AIIMS Delhi',
  'WhatsApp: +91 7654321098',
  ARRAY['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'],
  true,
  NOW(),
  NOW()
),
(
  'Digital Multimeter Fluke 117',
  'Professional grade multimeter for electrical engineering students. Barely used, comes with original case and probes.',
  3200.00,
  4500.00,
  'Lab Equipment',
  'like_new',
  NULL,
  'Raj Patel',
  'NIT Surathkal',
  'Email: raj.electrical@email.com',
  ARRAY['https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500'],
  true,
  NOW(),
  NOW()
),
(
  'Study Table with Drawer',
  'Compact wooden study table perfect for dorm rooms. Includes one drawer for storage. Minor scratches but very functional.',
  2800.00,
  4000.00,
  'Furniture',
  'good',
  NULL,
  'Lisa Kumar',
  'Delhi University',
  'WhatsApp: +91 6543210987',
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'],
  true,
  NOW(),
  NOW()
);

-- Display inserted products
SELECT 
  title,
  price,
  category,
  condition,
  seller_name,
  seller_college,
  available,
  created_at
FROM public.products 
ORDER BY created_at DESC;