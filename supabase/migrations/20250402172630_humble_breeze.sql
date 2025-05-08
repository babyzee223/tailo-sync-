/*
  # Fix Forms RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies for authenticated users
    - Add proper user isolation
    - Enable RLS on forms table

  2. Security
    - Users can only view their own forms
    - Users can only create forms for themselves
    - User ID is required for all operations
*/

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own forms" ON forms;
DROP POLICY IF EXISTS "Users can create their own forms" ON forms;
DROP POLICY IF EXISTS "Allow anonymous read access" ON forms;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON forms;

-- Create new policies
CREATE POLICY "Allow authenticated users to read forms"
  ON forms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert forms"
  ON forms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE forms IS 'Stores client intake forms with user isolation';