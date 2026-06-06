import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('translator_theme');
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    window.document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('translator_theme', theme);
    if (theme === 'light') {
      window.document.documentElement.classList.remove('dark');
      window.document.documentElement.classList.add('light');
    } else {
      window.document.documentElement.classList.remove('light');
      window.document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
