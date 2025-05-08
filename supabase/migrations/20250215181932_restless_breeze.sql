/*
  # Add Garment Fields to Forms Table

  1. Changes
    - Adds garment description and quantity fields to forms table
    - Ensures safe addition of fields without conflicts

  2. New Fields
    - garment_description (text)
    - garment_quantity (integer)
    - garment_type (text)

  3. Validations
    - Garment quantity must be positive
*/

-- Add garment-specific fields to forms table
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'garment_description') THEN
    ALTER TABLE forms ADD COLUMN garment_description text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'garment_quantity') THEN
    ALTER TABLE forms ADD COLUMN garment_quantity integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'garment_type') THEN
    ALTER TABLE forms ADD COLUMN garment_type text;
  END IF;
END $$;

-- Add constraints safely
DO $$ 
BEGIN
  -- Check if constraint doesn't exist before adding it
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'garment_quantity_positive_check') THEN
    ALTER TABLE forms 
    ADD CONSTRAINT garment_quantity_positive_check 
    CHECK (garment_quantity > 0);
  END IF;
END $$;

-- Update table comment
COMMENT ON TABLE forms IS 'Stores client intake forms including garment and wedding details';