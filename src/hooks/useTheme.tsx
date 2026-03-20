import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ThemePalette, THEMES, applyTheme, getSavedTheme } from "@/lib/themes";

interface ThemeContextType {
  theme: ThemePalette;
  setTheme: (t: ThemePalette) => void;
  themes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[0],
  setTheme: () => {},
  themes: THEMES,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemePalette>(getSavedTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: ThemePalette) => {
    setThemeState(t);
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
