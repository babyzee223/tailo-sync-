/*
  # Add appointments functionality

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `type` (text)
      - `date` (timestamptz)
      - `duration` (interval)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `appointments` table
    - Add policies for authenticated users
*/

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('fitting', 'pickup', 'consultation', 'other')),
  date timestamptz NOT NULL,
  duration interval NOT NULL DEFAULT '1 hour',
  status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read appointments"
  ON appointments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert appointments"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Create updated_at trigger
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Add appointment-related fields to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS preferred_contact_time text,
ADD COLUMN IF NOT EXISTS appointment_notes text;

COMMENT ON TABLE appointments IS 'Stores client appointments including fittings, pickups, and consultations';