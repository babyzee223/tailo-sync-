/*
  # Add missing columns and ensure consistent naming

  1. Changes
    - Adds any missing columns to forms table
    - Ensures consistent camelCase naming
    - Preserves existing data
    - Adds appropriate constraints safely

  2. Security
    - Maintains existing permissions
    - Preserves data integrity
*/

-- Add missing columns and ensure consistent naming
DO $$ 
BEGIN
  -- Basic form fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'preferredContactMethod') THEN
    ALTER TABLE forms ADD COLUMN "preferredContactMethod" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'preferredPickUpDate') THEN
    ALTER TABLE forms ADD COLUMN "preferredPickUpDate" TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'garmentQuantity') THEN
    ALTER TABLE forms ADD COLUMN "garmentQuantity" INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'garmentType') THEN
    ALTER TABLE forms ADD COLUMN "garmentType" TEXT;
  END IF;

  -- Wedding-specific fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'venue') THEN
    ALTER TABLE forms ADD COLUMN venue TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'wedding_party_size') THEN
    ALTER TABLE forms ADD COLUMN wedding_party_size INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'dress_budget') THEN
    ALTER TABLE forms ADD COLUMN dress_budget NUMERIC(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'alterations_deadline') THEN
    ALTER TABLE forms ADD COLUMN alterations_deadline DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'special_requirements') THEN
    ALTER TABLE forms ADD COLUMN special_requirements TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'wedding_party_measurements') THEN
    ALTER TABLE forms ADD COLUMN wedding_party_measurements JSONB;
  END IF;

  -- Add constraints safely
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'forms' AND constraint_name = 'garment_quantity_positive'
  ) THEN
    ALTER TABLE forms ADD CONSTRAINT garment_quantity_positive CHECK (("garmentQuantity" > 0));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'forms' AND constraint_name = 'wedding_party_size_positive'
  ) THEN
    ALTER TABLE forms ADD CONSTRAINT wedding_party_size_positive_new CHECK ((wedding_party_size > 0 OR wedding_party_size IS NULL));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'forms' AND constraint_name = 'dress_budget_positive'
  ) THEN
    ALTER TABLE forms ADD CONSTRAINT dress_budget_positive_new CHECK ((dress_budget > 0 OR dress_budget IS NULL));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'forms' AND constraint_name = 'alterations_deadline_before_wedding'
  ) THEN
    ALTER TABLE forms ADD CONSTRAINT alterations_deadline_before_wedding_new CHECK ((alterations_deadline < wedding_date OR alterations_deadline IS NULL));
  END IF;

END $$;