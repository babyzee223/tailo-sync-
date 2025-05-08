import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rmleoigdwthetolgeylf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbGVvaWdkd3RoZXRvbGdleWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MTgxNzgsImV4cCI6MjA1NDk5NDE3OH0.bJbeI-3l5xnT1hA0qmlHkgGVQMbO4_-bqRGJF_ChENM';

// Create client with retry configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'alterations-pro' }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add connection status check with retry
export const checkConnection = async (retries = 3, delay = 1000): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      // Try to access subscription_plans table as a connection test
      const { error } = await supabase
        .from('subscription_plans')
        .select('count')
        .limit(1)
        .single();
        
      if (error?.message?.includes('does not exist')) {
        console.warn('Subscription plans table does not exist. Please initialize the database.');
        return false;
      }

      if (!error) {
        return true;
      }

      // If error occurs and we have retries left, wait before trying again
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    } catch (err) {
      // If error occurs and we have retries left, wait before trying again
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }
  return false;
};

// Add error handling helper with improved network detection
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);

  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return 'Database connection not configured. Please connect to Supabase using the button in the top right.';
  }

  // Check for network connectivity issues
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  if (error?.message?.includes('JWT')) {
    return 'Your session has expired. Please log in again.';
  }

  if (error?.message?.includes('quota exceeded')) {
    return 'Database quota exceeded. Please try again in a few minutes.';
  }

  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error?.message?.includes('does not exist')) {
    return 'Database tables not initialized. Please connect to Supabase using the button in the top right.';
  }

  return error?.message || 'An unexpected error occurred. Please try again.';
};

// Add retry wrapper for Supabase operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Operation failed after retries');
};