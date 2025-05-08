/*
  # Add user_id to forms table

  1. Changes
    - Adds user_id column to forms table
    - Links forms to auth.users
    - Updates RLS policies for user isolation
    - Adds indexes for performance

  2. Security
    - Ensures each user can only access their own forms
    - Maintains existing RLS policies
*/

-- Add user_id column to forms table
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read forms" ON forms;
DROP POLICY IF EXISTS "Allow authenticated users to insert forms" ON forms;

-- Create new policies for user isolation
CREATE POLICY "Users can view their own forms"
ON forms FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms"
ON forms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE forms IS 'Stores client intake forms with user isolation';