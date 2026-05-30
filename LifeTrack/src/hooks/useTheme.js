import { useEffect, useState } from "react";

const STORAGE_KEY = "lifetrack-theme";

export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "light");

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return {
    theme,
    isDark: theme === "dark",
    setTheme,
    toggleTheme,
  };
}
