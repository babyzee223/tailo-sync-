/*
  # Database Schema Update
  
  1. Tables
    - Creates base tables for clients, orders, messages, and revenue tracking
    - Adds proper foreign key relationships
    - Sets up appropriate indexes
  
  2. Security
    - Enables RLS on all tables
    - Adds policies for authenticated users
    
  3. Features
    - Real-time enabled for orders and messages
    - Automatic updated_at timestamp handling
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  carrier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table with proper foreign key reference
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  garments jsonb NOT NULL,
  payment_info jsonb NOT NULL,
  description text,
  status text NOT NULL,
  due_date date NOT NULL,
  event_info jsonb,
  timeline jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table for tracking
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  recipient text NOT NULL,
  subject text,
  content text NOT NULL,
  status text NOT NULL,
  tracking_id text,
  tracking_pixel text,
  delivered_at timestamptz,
  opened_at timestamptz,
  bounced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create revenue tracking table
CREATE TABLE IF NOT EXISTS revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  revenue numeric(10,2) NOT NULL DEFAULT 0,
  order_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (year, month)
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;

-- Create policies safely
DO $$ 
BEGIN
  -- Clients policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Allow authenticated users to read clients'
  ) THEN
    CREATE POLICY "Allow authenticated users to read clients"
      ON clients FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Allow authenticated users to insert clients'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert clients"
      ON clients FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Allow authenticated users to update clients'
  ) THEN
    CREATE POLICY "Allow authenticated users to update clients"
      ON clients FOR UPDATE TO authenticated USING (true);
  END IF;

  -- Orders policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Allow authenticated users to read orders'
  ) THEN
    CREATE POLICY "Allow authenticated users to read orders"
      ON orders FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Allow authenticated users to insert orders'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert orders"
      ON orders FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Allow authenticated users to update orders'
  ) THEN
    CREATE POLICY "Allow authenticated users to update orders"
      ON orders FOR UPDATE TO authenticated USING (true);
  END IF;

  -- Messages policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Allow authenticated users to read messages'
  ) THEN
    CREATE POLICY "Allow authenticated users to read messages"
      ON messages FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Allow authenticated users to insert messages'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert messages"
      ON messages FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' AND policyname = 'Allow authenticated users to update messages'
  ) THEN
    CREATE POLICY "Allow authenticated users to update messages"
      ON messages FOR UPDATE TO authenticated USING (true);
  END IF;

  -- Revenue policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'revenue' AND policyname = 'Allow authenticated users to read revenue'
  ) THEN
    CREATE POLICY "Allow authenticated users to read revenue"
      ON revenue FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'revenue' AND policyname = 'Allow authenticated users to insert revenue'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert revenue"
      ON revenue FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'revenue' AND policyname = 'Allow authenticated users to update revenue'
  ) THEN
    CREATE POLICY "Allow authenticated users to update revenue"
      ON revenue FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_revenue_year_month ON revenue(year, month);

-- Enable real-time safely
DO $$
BEGIN
  -- Check if tables are already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_revenue_updated_at ON revenue;
CREATE TRIGGER update_revenue_updated_at
  BEFORE UPDATE ON revenue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();