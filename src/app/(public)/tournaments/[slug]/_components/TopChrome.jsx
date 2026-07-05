"use client";

import { usePublicTheme } from "../../../_components/PublicThemeProvider";

export default function TopChrome({ brandTitle, brandSubtitle, brandLogoUrl }) {
  const { theme, toggleTheme } = usePublicTheme();
  const isDark = theme === "dark";

  return (
    <div className="cs">
      <div className="cs-brand">
        {brandLogoUrl ? (
          <img
            className="cs-brand-logo"
            src={brandLogoUrl}
            alt={brandTitle || "JOMG"}
          />
        ) : (
          <>
            <span className="dot">🥒</span> {brandTitle}
          </>
        )}{" "}
        <span className="muted">{brandSubtitle}</span>
      </div>
      <div className="cs-right">
        <button type="button" className="cs-theme" onClick={toggleTheme}>
          <span>{isDark ? "☀️" : "🌙"}</span>{" "}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>
    </div>
  );
}
