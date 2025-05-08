-- Create the 'teams' table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- Create the 'team_members' table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT now()
);

-- Enable Row-Level Security (RLS) for 'teams' table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for 'teams' table: Allow only the creator to manage their teams
CREATE POLICY "Allow team creators to manage their teams"
ON teams
AS PERMISSIVE
FOR ALL
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Enable Row-Level Security (RLS) for 'team_members' table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for 'team_members' table: Allow users to manage their own memberships
CREATE POLICY "Allow users to manage their team memberships"
ON team_members
AS PERMISSIVE
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
