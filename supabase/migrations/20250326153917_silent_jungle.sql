/*
  # Add user_id to orders table

  1. Changes
    - Adds user_id column to orders table
    - Links orders to auth.users
    - Updates RLS policies for user isolation
    - Adds indexes for performance

  2. Security
    - Ensures each user can only access their own orders
    - Updates existing RLS policies
*/

-- Add user_id column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON orders;

-- Create new policies for user isolation
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

-- Add comment
COMMENT ON TABLE orders IS 'Stores order information with user isolation';