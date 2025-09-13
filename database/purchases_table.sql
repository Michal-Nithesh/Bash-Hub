-- Create purchases table for storing payment records
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES store_products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    buyer_message TEXT,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_id TEXT NOT NULL, -- Razorpay payment ID
    order_id TEXT NOT NULL,   -- Razorpay order ID
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for purchases table
-- Buyers can see their own purchases
CREATE POLICY "Buyers can view own purchases" ON purchases
    FOR SELECT USING (auth.uid() = buyer_id);

-- Sellers can see purchases of their products
CREATE POLICY "Sellers can view their product purchases" ON purchases
    FOR SELECT USING (auth.uid() = seller_id);

-- Authenticated users can insert purchase records
CREATE POLICY "Users can insert purchase records" ON purchases
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Users can update their own purchase records (e.g., for payment status updates)
CREATE POLICY "Users can update own purchases" ON purchases
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();