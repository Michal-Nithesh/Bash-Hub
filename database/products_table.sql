-- Create products table for the store
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category VARCHAR(100) NOT NULL,
  condition VARCHAR(50) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name VARCHAR(255),
  seller_college VARCHAR(255),
  contact_method VARCHAR(255),
  images TEXT[], -- Array of image URLs
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on seller_id for faster queries
CREATE INDEX idx_products_seller_id ON products(seller_id);

-- Create an index on category for faster filtering
CREATE INDEX idx_products_category ON products(category);

-- Create an index on available for faster filtering
CREATE INDEX idx_products_available ON products(available);

-- Create an index on created_at for sorting
CREATE INDEX idx_products_created_at ON products(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can view available products
CREATE POLICY "Anyone can view available products" ON products
  FOR SELECT USING (available = true);

-- Create policy: Authenticated users can view all products
CREATE POLICY "Authenticated users can view all products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy: Users can insert their own products
CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Create policy: Users can update their own products
CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = seller_id);

-- Create policy: Users can delete their own products
CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = seller_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO products (title, description, price, original_price, category, condition, seller_name, seller_college, images, available) VALUES
('Data Structures and Algorithms in Java', 'Complete textbook with solved examples. Excellent condition.', 450.00, 650.00, 'Books', 'Like New', 'Alice Smith', 'GEC Thiruvananthapuram', ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop'], true),
('Yamaha Acoustic Guitar F310', 'Well-maintained acoustic guitar, perfect for beginners. Comes with picks and strap.', 8500.00, 12000.00, 'Instruments', 'Good', 'Bob Johnson', 'LBS College of Engineering', ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop'], true),
('Computer Networks - Tanenbaum', '5th Edition. Highlighted and bookmarked. Great for networking concepts.', 380.00, 520.00, 'Books', 'Good', 'Carol Davis', 'College of Engineering, Trivandrum', ARRAY['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop'], true),
('Scientific Calculator Casio fx-991ES', 'Programmable calculator in excellent working condition.', 1200.00, 1800.00, 'Electronics', 'Like New', 'David Wilson', 'Noorul Islam Centre', ARRAY['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=400&fit=crop'], false),
('Digital Electronics Lab Manual', 'Complete lab manual with circuit diagrams and procedures.', 150.00, 250.00, 'Books', 'Good', 'Emma Brown', 'Francis Xavier Engineering', ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop'], true),
('HP Pavilion Laptop Bag', 'Padded laptop bag suitable for 15.6 inch laptops. Water resistant.', 800.00, 1200.00, 'Accessories', 'Like New', 'Frank Miller', 'GEC Thiruvananthapuram', ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop'], true);