import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType } from '../types';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isSubscriptionActive: false,
  checkSubscription: async () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);

  const checkSubscription = async (userId: string) => {
    try {
      // Get the most recent subscription for the user
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      // If no subscription found, user is in trial
      if (!subscriptions || subscriptions.length === 0) {
        setIsSubscriptionActive(true); // Everyone starts with trial access
        return true;
      }

      const subscription = subscriptions[0];

      // Check if subscription is active or in trial
      const isActive = subscription.status === 'active' || 
        (subscription.status === 'trialing' && new Date(subscription.trial_end) > new Date());

      setIsSubscriptionActive(isActive);
      return isActive;
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscriptionActive(true); // Default to active on error for better UX
      return true;
    }
  };

  useEffect(() => {
    // Clear any existing data on mount
    localStorage.clear();
    
    // Check for existing session
    const checkSession = async () => {
      // Sign out any existing session first
      await supabase.auth.signOut();
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking session:', error);
        return;
      }
      if (session?.user) {
        const { id, email, user_metadata } = session.user;
        const userData = {
          id,
          username: email || '',
          name: user_metadata?.name || 'User',
          role: user_metadata?.role || 'user',
          password: '' // We don't store passwords
        };
        setUser(userData);

        // Update user metadata if name has changed
        if (user_metadata?.name !== userData.name) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { name: userData.name }
          });
          if (updateError) {
            console.error('Error updating user metadata:', updateError);
          }
        }

        // Check subscription status
        await checkSubscription(id);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsSubscriptionActive(false);
        localStorage.clear();
        return;
      }

      if (session?.user) {
        const { id, email, user_metadata } = session.user;
        const userData = {
          id,
          username: email || '',
          name: user_metadata?.name || 'User',
          role: user_metadata?.role || 'user',
          password: '' // We don't store passwords
        };
        setUser(userData);

        // Update user metadata if name has changed
        if (user_metadata?.name !== userData.name) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { name: userData.name }
          });
          if (updateError) {
            console.error('Error updating user metadata:', updateError);
          }
        }

        // Check subscription status
        await checkSubscription(id);
      } else {
        setUser(null);
        setIsSubscriptionActive(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // First sign out any existing session
      await supabase.auth.signOut();
      localStorage.clear();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      const { id, email: userEmail, user_metadata } = data.user;
      const userData = {
        id,
        username: userEmail || '',
        name: user_metadata?.name || 'User',
        role: user_metadata?.role || 'user',
        password: '' // We don't store passwords
      };
      setUser(userData);

      // Update user metadata if name has changed
      if (user_metadata?.name !== userData.name) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { name: userData.name }
        });
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        }
      }

      // Check subscription status
      await checkSubscription(id);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsSubscriptionActive(false);
      localStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      isSubscriptionActive,
      checkSubscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;