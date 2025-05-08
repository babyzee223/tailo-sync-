-- Create forms table with real-time enabled
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact_number text not null,
  email_address text not null,
  date date not null,
  preferred_contact_method text not null,
  preferred_pickup_date text not null,
  dropoff_signature text not null,
  client_signature text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable real-time for this table
alter publication supabase_realtime add table forms;

-- Enable RLS
alter table forms enable row level security;

-- Create policies
create policy "Allow authenticated users to read forms"
  on forms
  for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert forms"
  on forms
  for insert
  to authenticated
  with check (true);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_forms_updated_at
  before update on forms
  for each row
  execute function update_updated_at_column();