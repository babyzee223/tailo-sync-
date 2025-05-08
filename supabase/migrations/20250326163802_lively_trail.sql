-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;

-- Create new policies with proper user isolation
CREATE POLICY "clients_select_policy"
ON clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "clients_insert_policy"
ON clients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clients_update_policy"
ON clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Add comment
COMMENT ON TABLE clients IS 'Stores client information with user isolation';