/*
  # Fix contact number column name in forms table

  1. Changes
    - Renames contact_number to contactNumber to match code expectations
    - Preserves existing data
    - Ensures column names match application code

  2. Security
    - Maintains existing permissions
    - Preserves data integrity
*/

-- Rename existing column if it exists
DO $$ 
BEGIN
  -- Rename contact_number to contactNumber if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'contact_number'
  ) THEN
    ALTER TABLE forms RENAME COLUMN contact_number TO "contactNumber";
  END IF;

  -- Add column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'contactNumber'
  ) THEN
    ALTER TABLE forms ADD COLUMN "contactNumber" TEXT;
  END IF;
END $$;