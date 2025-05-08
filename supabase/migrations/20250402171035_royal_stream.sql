/*
  # Fix signature columns in forms table

  1. Changes
    - Renames signature columns to match frontend code
    - Ensures consistent camelCase naming
    - Preserves existing data
    - Adds missing columns if needed

  2. Security
    - Maintains existing permissions
    - Preserves data integrity
*/

-- Rename and add signature columns
DO $$ 
BEGIN
  -- Rename full_name to fullName if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE forms RENAME COLUMN full_name TO "fullName";
  END IF;

  -- Add fullName if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'fullName'
  ) THEN
    ALTER TABLE forms ADD COLUMN "fullName" TEXT;
  END IF;

  -- Ensure signature columns exist with correct names
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'dropOffSignature'
  ) THEN
    ALTER TABLE forms ADD COLUMN "dropOffSignature" TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'clientSignature'
  ) THEN
    ALTER TABLE forms ADD COLUMN "clientSignature" TEXT;
  END IF;
END $$;