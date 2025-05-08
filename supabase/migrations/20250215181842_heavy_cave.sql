/*
  # Add Wedding Fields to Forms Table

  1. Changes
    - Adds wedding-specific fields to forms table
    - Adds appropriate validations and constraints
    - Ensures safe addition of fields without conflicts

  2. New Fields
    - is_wedding_client (boolean)
    - wedding_date (date)
    - venue (text)
    - wedding_party_size (integer)
    - dress_budget (numeric)
    - alterations_deadline (date)
    - special_requirements (text)
    - wedding_party_measurements (jsonb)

  3. Validations
    - Wedding date must be in the future
    - Wedding party size must be positive
    - Dress budget must be positive
    - Alterations deadline must be before wedding date
*/

-- Add wedding-specific fields to forms table
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'is_wedding_client') THEN
    ALTER TABLE forms ADD COLUMN is_wedding_client boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'wedding_date') THEN
    ALTER TABLE forms ADD COLUMN wedding_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'venue') THEN
    ALTER TABLE forms ADD COLUMN venue text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'wedding_party_size') THEN
    ALTER TABLE forms ADD COLUMN wedding_party_size integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'dress_budget') THEN
    ALTER TABLE forms ADD COLUMN dress_budget numeric(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'alterations_deadline') THEN
    ALTER TABLE forms ADD COLUMN alterations_deadline date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'special_requirements') THEN
    ALTER TABLE forms ADD COLUMN special_requirements text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'wedding_party_measurements') THEN
    ALTER TABLE forms ADD COLUMN wedding_party_measurements jsonb;
  END IF;
END $$;

-- Add constraints safely
DO $$ 
BEGIN
  -- Check if constraints don't exist before adding them
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'wedding_date_future_check') THEN
    ALTER TABLE forms 
    ADD CONSTRAINT wedding_date_future_check 
    CHECK (wedding_date > CURRENT_DATE OR wedding_date IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'wedding_party_size_positive_check') THEN
    ALTER TABLE forms 
    ADD CONSTRAINT wedding_party_size_positive_check 
    CHECK (wedding_party_size > 0 OR wedding_party_size IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'dress_budget_positive_check') THEN
    ALTER TABLE forms 
    ADD CONSTRAINT dress_budget_positive_check 
    CHECK (dress_budget > 0 OR dress_budget IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'alterations_deadline_before_wedding_check') THEN
    ALTER TABLE forms 
    ADD CONSTRAINT alterations_deadline_before_wedding_check 
    CHECK (alterations_deadline < wedding_date OR alterations_deadline IS NULL);
  END IF;
END $$;

-- Update table comment
COMMENT ON TABLE forms IS 'Stores client intake forms including wedding-specific details';