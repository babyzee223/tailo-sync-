import { supabase } from '../lib/supabaseClient';

export type UserPreferences = {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    appointments: boolean;
    marketing: boolean;
  };
};

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    sms: true,
    appointments: true,
    marketing: false
  }
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
  try {
    // First try to get existing preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle no results

    // If no preferences exist, create default preferences
    if (!data) {
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          preferences: defaultPreferences
        });

      if (insertError) throw insertError;
      return defaultPreferences;
    }

    // If preferences exist but there was an error, throw it
    if (error) throw error;

    // Merge existing preferences with defaults to ensure all fields exist
    return {
      ...defaultPreferences,
      ...data.preferences
    };
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    return defaultPreferences;
  }
};

export const updateUserPreferences = async (userId: string, preferences: UserPreferences): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    throw error;
  }
};