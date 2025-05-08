/*
  # Fix user data migration

  1. Changes
    - Associates existing data with the provided user ID
    - Updates all tables to use the correct user_id
    - Ensures data integrity
*/

-- Update existing records with the correct user ID
UPDATE forms
SET user_id = 'cb718b80-ac94-4f1e-a64e-12e27998bfc3'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE clients
SET user_id = 'cb718b80-ac94-4f1e-a64e-12e27998bfc3'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

UPDATE orders
SET user_id = 'cb718b80-ac94-4f1e-a64e-12e27998bfc3'
WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Ensure RLS policies are enabled
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they're properly enforced
DROP POLICY IF EXISTS "Users can view their own forms" ON forms;
DROP POLICY IF EXISTS "Users can create their own forms" ON forms;

CREATE POLICY "Users can view their own forms"
ON forms FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms"
ON forms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;

CREATE POLICY "Users can view their own clients"
ON clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
ON clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);