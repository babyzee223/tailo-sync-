-- Drop and recreate tables in correct order
DO $$ 
BEGIN
  -- First drop dependent tables if they exist
  DROP TABLE IF EXISTS orders CASCADE;
  DROP TABLE IF EXISTS clients CASCADE;

  -- Create clients table first
  CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    carrier text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Then create orders table with foreign key reference
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

  -- Re-enable RLS
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

  -- Recreate policies
  DO $policy$ 
  BEGIN
    -- Clients policies
    CREATE POLICY "Allow authenticated users to read clients"
      ON clients FOR SELECT TO authenticated USING (true);

    CREATE POLICY "Allow authenticated users to insert clients"
      ON clients FOR INSERT TO authenticated WITH CHECK (true);

    CREATE POLICY "Allow authenticated users to update clients"
      ON clients FOR UPDATE TO authenticated USING (true);

    -- Orders policies
    CREATE POLICY "Allow authenticated users to read orders"
      ON orders FOR SELECT TO authenticated USING (true);

    CREATE POLICY "Allow authenticated users to insert orders"
      ON orders FOR INSERT TO authenticated WITH CHECK (true);

    CREATE POLICY "Allow authenticated users to update orders"
      ON orders FOR UPDATE TO authenticated USING (true);
  EXCEPTION 
    WHEN duplicate_object THEN null;
  END $policy$;

  -- Recreate indexes
  CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
  CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
  CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);

END $$;