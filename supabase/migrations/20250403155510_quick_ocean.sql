/*
  # Fix preferred_contact_method column

  1. Changes
    - Ensures preferred_contact_method column exists
    - Adds default value to prevent NOT NULL constraint violations
    - Updates existing records with null values
*/

-- Ensure preferred_contact_method column exists with correct name
DO $$ 
BEGIN
  -- Add preferred_contact_method if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' AND column_name = 'preferred_contact_method'
  ) THEN
    ALTER TABLE forms ADD COLUMN preferred_contact_method TEXT DEFAULT 'phone' NOT NULL;
  END IF;

  -- Update any existing null values
  UPDATE forms 
  SET preferred_contact_method = 'phone'
  WHERE preferred_contact_method IS NULL;

  -- Set NOT NULL constraint if not already set
  ALTER TABLE forms 
  ALTER COLUMN preferred_contact_method SET NOT NULL,
  ALTER COLUMN preferred_contact_method SET DEFAULT 'phone';
END $$;

-- Add comment
COMMENT ON COLUMN forms.preferred_contact_method IS 'Preferred method of contact (phone, email, text)';