/*
  # Add garmentDescription column to forms table

  1. Changes
    - Adds garmentDescription column to forms table
    - Ensures consistent camelCase naming
    - Preserves existing data
    - Handles column rename if needed

  2. Security
    - Maintains existing permissions
    - Preserves data integrity
*/

-- Add garmentDescription column safely
DO $$ 
BEGIN
  -- Rename garment_description to garmentDescription if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'garment_description'
  ) THEN
    ALTER TABLE forms RENAME COLUMN garment_description TO "garmentDescription";
  END IF;

  -- Add garmentDescription if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'garmentDescription'
  ) THEN
    ALTER TABLE forms ADD COLUMN "garmentDescription" TEXT;
  END IF;
END $$;