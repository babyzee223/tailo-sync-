/*
  # Create core tables for Alterations Pro

  1. New Tables
    - `orders`: Stores all order information
    - `clients`: Stores client information
    - `messages`: Stores email and SMS tracking
    - `revenue`: Stores monthly revenue tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Set up real-time for orders and messages

  3. Changes
    - Add foreign key relationships
    - Add indexes for performance
    - Enable row-level security
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

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) NOT NULL,
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

-- Create policies
CREATE POLICY "Allow authenticated users to read clients"
  ON clients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert clients"
  ON clients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update clients"
  ON clients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read orders"
  ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orders"
  ON orders FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read messages"
  ON messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert messages"
  ON messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update messages"
  ON messages FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read revenue"
  ON revenue FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert revenue"
  ON revenue FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update revenue"
  ON revenue FOR UPDATE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_revenue_year_month ON revenue(year, month);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_updated_at
  BEFORE UPDATE ON revenue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();