import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getUserPreferences, updateUserPreferences, type UserPreferences } from '../services/preferences';

type ThemeContextType = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const { user } = useAuth();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (user) {
          const prefs = await getUserPreferences(user.id);
          setThemeState(prefs.theme);
          if (prefs.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    loadTheme();
  }, [user]);

  const setTheme = async (newTheme: 'light' | 'dark') => {
    try {
      if (user) {
        const prefs = await getUserPreferences(user.id);
        await updateUserPreferences(user.id, {
          ...prefs,
          theme: newTheme
        });
      }
      setThemeState(newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};