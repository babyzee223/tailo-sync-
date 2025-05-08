/*
  # Create Subscription System Tables

  1. New Tables
    - `subscription_plans`: Stores available subscription plans
    - `subscriptions`: Stores user subscriptions
    - `payment_history`: Stores payment records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Set up foreign key relationships
*/

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  interval text NOT NULL CHECK (interval IN ('month', 'year')),
  stripe_price_id text NOT NULL UNIQUE,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL CHECK (status IN ('trialing', 'active', 'canceled', 'incomplete', 'past_due')),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment history table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id),
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id text,
  stripe_payment_method text,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to subscription plans" ON subscription_plans;
  DROP POLICY IF EXISTS "Allow users to view their own subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Allow users to create trial subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Allow users to update their own subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Allow users to view their own payment history" ON payment_history;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Allow public read access to subscription plans"
  ON subscription_plans FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow users to view their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create trial subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    status = 'trialing' AND 
    trial_start IS NOT NULL AND 
    trial_end IS NOT NULL
  );

CREATE POLICY "Allow users to update their own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to view their own payment history"
  ON payment_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing indexes if they exist
DO $$ 
BEGIN
  DROP INDEX IF EXISTS idx_subscriptions_user_id;
  DROP INDEX IF EXISTS idx_subscriptions_status;
  DROP INDEX IF EXISTS idx_payment_history_user_id;
  DROP INDEX IF EXISTS idx_payment_history_subscription_id;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);

-- Drop existing triggers if they exist
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
  DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();