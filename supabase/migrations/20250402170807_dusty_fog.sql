/*
  # Fix email address column name in forms table

  1. Changes
    - Renames email_address to emailAddress to match code expectations
    - Preserves existing data
    - Ensures column names match application code

  2. Security
    - Maintains existing permissions
    - Preserves data integrity
*/

-- Rename existing column if it exists
DO $$ 
BEGIN
  -- Rename email_address to emailAddress if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'email_address'
  ) THEN
    ALTER TABLE forms RENAME COLUMN email_address TO "emailAddress";
  END IF;

  -- Add column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'emailAddress'
  ) THEN
    ALTER TABLE forms ADD COLUMN "emailAddress" TEXT;
  END IF;
END $$;