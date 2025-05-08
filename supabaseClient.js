import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmleoigdwthetolgeylf.supabase.co'; // Your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbGVvaWdkd3RoZXRvbGdleWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTgxNzgsImV4cCI6MjA1NDk5NDE3OH0.bJbeI-3l5xnT1hA0qmlHkgGVQMbO4_-bqRGJF_ChENM'; // Your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
