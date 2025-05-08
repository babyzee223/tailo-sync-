import { supabase } from '../lib/supabaseClient';
import type { User } from '../types';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'brand.gkco@gmail.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export const login = async (email: string, password: string): Promise<User | null> => {
  // For the admin account, use environment variables
  if (email === ADMIN_EMAIL) {
    if (password === ADMIN_PASSWORD) {
      return {
        id: 'admin',
        username: ADMIN_EMAIL,
        name: 'Admin',
        role: 'admin',
        password: '' // We don't store passwords
      };
    }
    throw new Error('Invalid password');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    const { id, email: userEmail, user_metadata } = data.user;
    return {
      id,
      username: userEmail || '',
      name: user_metadata?.name || 'User',
      role: user_metadata?.role || 'user',
      password: '' // We don't store passwords
    };
  }

  return null;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  if (session?.user) {
    const { id, email, user_metadata } = session.user;
    return {
      id,
      username: email || '',
      name: user_metadata?.name || 'User',
      role: user_metadata?.role || 'user',
      password: '' // We don't store passwords
    };
  }

  return null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};