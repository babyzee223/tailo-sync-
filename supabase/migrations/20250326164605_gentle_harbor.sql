-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "user_preferences_select_policy" ON user_preferences;
  DROP POLICY IF EXISTS "user_preferences_insert_policy" ON user_preferences;
  DROP POLICY IF EXISTS "user_preferences_update_policy" ON user_preferences;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create user preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "user_preferences_select_policy_v2"
ON user_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_policy_v2"
ON user_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_policy_v2"
ON user_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger if it doesn't exist
DO $$ 
BEGIN
  CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Add comment
COMMENT ON TABLE user_preferences IS 'Stores user preferences with user isolation';