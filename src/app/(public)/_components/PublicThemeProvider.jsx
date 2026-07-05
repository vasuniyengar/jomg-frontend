"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "jomg-public-theme";
const ThemeContext = createContext(null);

export function PublicThemeProvider({ children }) {
  const [theme, setTheme] = useState("white");

  useLayoutEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    html.classList.add("public-tournament-page");
    body.classList.add("public-tournament-page");

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const initial = stored === "dark" ? "dark" : "white";
      html.setAttribute("data-theme", initial);
      html.removeAttribute("data-palette");
      setTheme(initial);
    } catch {
      html.setAttribute("data-theme", "white");
    }

    return () => {
      html.classList.remove("public-tournament-page");
      body.classList.remove("public-tournament-page");
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "white" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function usePublicTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("usePublicTheme must be used within PublicThemeProvider");
  }
  return ctx;
}
