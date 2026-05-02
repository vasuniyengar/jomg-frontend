"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

const keyPalette = (t) => `jomg-palette-${t}`;

function readChromeFromDocument() {
  if (typeof document === "undefined") {
    return { theme: "dark", darkPalette: "", lightPalette: "" };
  }
  const html = document.documentElement;
  const theme = html.getAttribute("data-theme") || "dark";
  const activeP = html.getAttribute("data-palette") || "";
  let darkPalette = "";
  let lightPalette = "";
  try {
    darkPalette = window.localStorage.getItem(keyPalette("dark")) ?? "";
    lightPalette = window.localStorage.getItem(keyPalette("light")) ?? "";
  } catch {
    /* ignore */
  }
  if (theme === "dark" && activeP) darkPalette = activeP;
  if (theme === "light" && activeP) lightPalette = activeP;
  return { theme, darkPalette, lightPalette };
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [darkPalette, setDarkPalette] = useState("");
  const [lightPalette, setLightPalette] = useState("");

  useEffect(() => {
    const { theme: t, darkPalette: dp, lightPalette: lp } =
      readChromeFromDocument();
    /* Sync React state with values applied by the inline script in root layout + localStorage. */
    /* eslint-disable react-hooks/set-state-in-effect -- intentional one-time hydration sync */
    setTheme(t);
    setDarkPalette(dp);
    setLightPalette(lp);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setPalette = useCallback(
    (palette) => {
      const p = palette || "";
      const html = document.documentElement;
      if (theme === "dark") {
        setDarkPalette(p);
        localStorage.setItem(keyPalette("dark"), p);
      } else {
        setLightPalette(p);
        localStorage.setItem(keyPalette("light"), p);
      }
      if (p) html.setAttribute("data-palette", p);
      else html.removeAttribute("data-palette");
    },
    [theme],
  );

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const next = theme === "dark" ? "light" : "dark";
    const nextPal = next === "dark" ? darkPalette : lightPalette;
    html.setAttribute("data-theme", next);
    localStorage.setItem("jomg-theme", next);
    if (nextPal) html.setAttribute("data-palette", nextPal);
    else html.removeAttribute("data-palette");
    setTheme(next);
  }, [theme, darkPalette, lightPalette]);

  const value = useMemo(
    () => ({
      theme,
      palette: theme === "dark" ? darkPalette : lightPalette,
      setPalette,
      toggleTheme,
    }),
    [theme, darkPalette, lightPalette, setPalette, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
