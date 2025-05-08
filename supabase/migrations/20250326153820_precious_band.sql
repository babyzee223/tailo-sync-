/*
  # Add user_id to clients table

  1. Changes
    - Adds user_id column to clients table
    - Links clients to auth.users
    - Updates RLS policies for user isolation
    - Adds indexes for performance

  2. Security
    - Ensures each user can only access their own clients
    - Updates existing RLS policies
*/

-- Add user_id column to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read clients" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to insert clients" ON clients;
DROP POLICY IF EXISTS "Allow authenticated users to update clients" ON clients;

-- Create new policies for user isolation
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

-- Add comment
COMMENT ON TABLE clients IS 'Stores client information with user isolation';