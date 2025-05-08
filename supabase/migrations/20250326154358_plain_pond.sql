/*
  # Update existing data with user_id and fix wedding dates

  1. Changes
    - Updates existing records with default user ID
    - Fixes wedding dates to be valid
    - Makes user_id required after data migration
    - Handles constraints safely

  2. Security
    - Maintains data integrity
    - Preserves existing relationships
*/

-- First drop all existing wedding date constraints
ALTER TABLE forms 
DROP CONSTRAINT IF EXISTS wedding_date_future,
DROP CONSTRAINT IF EXISTS wedding_date_future_check;

-- Create a default user if needed (using a secure UUID)
DO $$ 
BEGIN
  INSERT INTO auth.users (id, email)
  VALUES ('00000000-0000-0000-0000-000000000000', 'system@alterationspro.com')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Update existing records with default user_id
UPDATE forms
SET 
  user_id = '00000000-0000-0000-0000-000000000000',
  -- Set wedding date to 1 year from now for any invalid dates
  wedding_date = CASE 
    WHEN wedding_date IS NOT NULL AND wedding_date <= CURRENT_DATE 
    THEN CURRENT_DATE + interval '1 year'
    ELSE wedding_date
  END
WHERE user_id IS NULL;

UPDATE clients
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL;

UPDATE orders
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL;

-- Make user_id required for all tables
ALTER TABLE forms
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE clients
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE orders
ALTER COLUMN user_id SET NOT NULL;

-- Re-add the wedding date constraint with new condition
ALTER TABLE forms
ADD CONSTRAINT wedding_date_future 
CHECK ((wedding_date IS NULL) OR (wedding_date > CURRENT_DATE));

-- Add comments
COMMENT ON TABLE forms IS 'Stores client intake forms with user isolation';
COMMENT ON TABLE clients IS 'Stores client information with user isolation';
COMMENT ON TABLE orders IS 'Stores order information with user isolation';