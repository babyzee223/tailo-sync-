/*
  # Add Wedding Form Fields

  1. Changes
    - Adds wedding-specific fields to the forms table
    - Adds validation for wedding date
    - Adds wedding party size tracking

  2. New Fields
    - is_wedding_client (boolean)
    - wedding_date (date)
    - venue (text)
    - wedding_party_size (integer)
    - dress_budget (numeric)
    - alterations_deadline (date)
    - special_requirements (text)
    - wedding_party_measurements (jsonb)
*/

-- Add wedding-specific fields to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS is_wedding_client boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS wedding_date date,
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS wedding_party_size integer,
ADD COLUMN IF NOT EXISTS dress_budget numeric(10,2),
ADD COLUMN IF NOT EXISTS alterations_deadline date,
ADD COLUMN IF NOT EXISTS special_requirements text,
ADD COLUMN IF NOT EXISTS wedding_party_measurements jsonb;

-- Add validation for wedding date
ALTER TABLE forms 
ADD CONSTRAINT wedding_date_future 
CHECK (wedding_date > CURRENT_DATE OR wedding_date IS NULL);

-- Add validation for wedding party size
ALTER TABLE forms 
ADD CONSTRAINT wedding_party_size_positive 
CHECK (wedding_party_size > 0 OR wedding_party_size IS NULL);

-- Add validation for dress budget
ALTER TABLE forms 
ADD CONSTRAINT dress_budget_positive 
CHECK (dress_budget > 0 OR dress_budget IS NULL);

-- Add validation for alterations deadline
ALTER TABLE forms 
ADD CONSTRAINT alterations_deadline_before_wedding 
CHECK (alterations_deadline < wedding_date OR alterations_deadline IS NULL);

-- Update types for the forms table
COMMENT ON TABLE forms IS 'Stores client intake forms including wedding-specific details';