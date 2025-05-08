/*
  # Fix signature column names in forms table

  1. Changes
    - Renames signature columns to match code expectations
    - Preserves existing data
    - Ensures column names match application code

  2. Security
    - Maintains existing permissions
    - Preserves data integrity
*/

-- Rename existing columns if they exist
DO $$ 
BEGIN
  -- Rename dropoff_signature to dropOffSignature if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'dropoff_signature'
  ) THEN
    ALTER TABLE forms RENAME COLUMN dropoff_signature TO "dropOffSignature";
  END IF;

  -- Rename client_signature to clientSignature if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'client_signature'
  ) THEN
    ALTER TABLE forms RENAME COLUMN client_signature TO "clientSignature";
  END IF;

  -- Add columns if they don't exist
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