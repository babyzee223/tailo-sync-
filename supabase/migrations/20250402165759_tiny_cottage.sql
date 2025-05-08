/*
  # Add signature columns to forms table

  1. Changes
    - Adds dropoff_signature and client_signature columns to forms table
    - Ensures columns are TEXT type to store signature data URLs
    - Uses simple ALTER TABLE statements for reliability

  2. Security
    - Maintains existing table structure
    - Preserves data integrity
*/

-- Add signature columns with simple ALTER TABLE statements
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS dropoff_signature TEXT,
ADD COLUMN IF NOT EXISTS client_signature TEXT;

-- Add comment
COMMENT ON TABLE forms IS 'Stores client intake forms with signatures';