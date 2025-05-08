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
DROP POLICY IF EXISTS "Allow authenticated users to read forms" ON forms;
DROP POLICY IF EXISTS "Allow authenticated users to insert forms" ON forms;
DROP POLICY IF EXISTS "Allow anonymous read access" ON forms;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON forms;

-- Create new policies with proper user isolation
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

-- Ensure user_id column exists and is required
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE forms ADD COLUMN user_id uuid REFERENCES auth.users(id) NOT NULL;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);