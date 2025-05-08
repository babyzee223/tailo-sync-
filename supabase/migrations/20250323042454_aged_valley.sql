-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, interval, stripe_price_id, features)
VALUES 
  (
    'Monthly Plan',
    'Full access to all features billed monthly',
    49.00,
    'month',
    'price_monthly_2024',
    '[
      "Unlimited orders",
      "Client management",
      "Appointment scheduling",
      "Email & SMS notifications",
      "Revenue tracking",
      "Photo storage",
      "Custom forms"
    ]'::jsonb
  ),
  (
    'Yearly Plan',
    'Full access to all features billed annually (save 20%)',
    470.00,
    'year',
    'price_yearly_2024',
    '[
      "Unlimited orders",
      "Client management", 
      "Appointment scheduling",
      "Email & SMS notifications",
      "Revenue tracking",
      "Photo storage",
      "Custom forms"
    ]'::jsonb
  )
ON CONFLICT (stripe_price_id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  interval = EXCLUDED.interval,
  features = EXCLUDED.features,
  updated_at = now();