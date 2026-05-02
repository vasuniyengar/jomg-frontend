"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { labelForPath } from "./route-labels";
import { useTheme } from "./ThemeProvider";

const DARK_SWATCHES = [
  { name: "Graphite", palette: "", gradient: "linear-gradient(135deg,#34383e 50%,#23262a 50%)" },
  { name: "Midnight", palette: "midnight", gradient: "linear-gradient(135deg,#131b42 50%,#060b24 50%)" },
  { name: "Slate", palette: "slate", gradient: "linear-gradient(135deg,#29313e 50%,#161b24 50%)" },
  { name: "Carbon", palette: "carbon", gradient: "linear-gradient(135deg,#202020 50%,#0d0d0d 50%)" },
  { name: "Forest", palette: "forest", gradient: "linear-gradient(135deg,#232e29 50%,#141c19 50%)" },
];

const LIGHT_SWATCHES = [
  { name: "Paper", palette: "", gradient: "linear-gradient(135deg,#ffffff 50%,#f5f5f4 50%)", border: "#e7e5e4" },
  { name: "Pure White", palette: "pure", gradient: "linear-gradient(135deg,#ffffff 50%,#f5f6f8 50%)", border: "#e5e7eb" },
  { name: "Ivory", palette: "ivory", gradient: "linear-gradient(135deg,#fffbf3 50%,#f2ecde 50%)", border: "#e4dfce" },
  { name: "Sky", palette: "sky", gradient: "linear-gradient(135deg,#ffffff 50%,#e3ebf6 50%)", border: "#d4dff0" },
  { name: "Sand", palette: "sand", gradient: "linear-gradient(135deg,#fbf6ed 50%,#ebe3d3 50%)", border: "#ddd2bd" },
];

function LogoSvg() {
  return (
    <svg
      fill="none"
      height="22"
      style={{ verticalAlign: "middle", marginRight: "4px" }}
      viewBox="0 0 22 22"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse
        cx="10"
        cy="10"
        fill="currentColor"
        opacity="0.15"
        rx="9"
        ry="9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect fill="currentColor" height="10" rx="3" width="6" x="7" y="4" />
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
        x1="13"
        x2="18"
        y1="12"
        y2="18"
      />
      <circle cx="10" cy="8" fill="white" opacity="0.7" r="1.2" />
    </svg>
  );
}

export default function Topbar() {
  const pathname = usePathname();
  const { theme, palette, setPalette, toggleTheme } = useTheme();
  const swatches = theme === "dark" ? DARK_SWATCHES : LIGHT_SWATCHES;

  return (
    <header className="topbar">
      <div className="logo">
        <LogoSvg />
        DRIVE<span> PB</span>
      </div>
      <div className="topbar-divider" />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <span style={{ fontSize: "11px", color: "var(--text-sec)", fontWeight: 600 }}>
          Austin Open 2025
        </span>
        <span className="status-dot" />
      </div>
      <div className="topbar-divider" />
      <Link href="/admin/tournaments" className="topbar-back-link" title="Back to all tournaments">
        ← <span>All Tournaments</span>
      </Link>
      <span style={{ color: "var(--text-ter)", fontSize: "12px" }}>/</span>
      <div className="breadcrumb">
        <strong>{labelForPath(pathname)}</strong>
      </div>

      <div className="palette-picker" title="Change color palette">
        <span className="palette-picker-label">Color</span>
        {swatches.map((sw) => {
          const active = (sw.palette || "") === (palette || "");
          return (
            <div
              key={sw.name}
              className={`palette-swatch${active ? " active" : ""}`}
              data-name={sw.name}
              data-palette={sw.palette}
              data-theme-for={theme}
              role="button"
              tabIndex={0}
              onClick={() => setPalette(sw.palette)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPalette(sw.palette);
                }
              }}
              style={{
                background: sw.gradient,
                ...(sw.border ? { borderColor: sw.border } : {}),
              }}
            />
          );
        })}
      </div>

      <div
        className="theme-toggle"
        onClick={toggleTheme}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleTheme();
          }
        }}
        role="button"
        tabIndex={0}
        title="Toggle light/dark mode"
      >
        <span style={{ fontSize: "13px" }}>🌙</span>
        <div className="toggle-track">
          <div className="toggle-thumb" />
        </div>
        <span style={{ fontSize: "13px" }}>☀️</span>
      </div>

      <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "var(--radius-sm)",
            background: "var(--card)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
          title="Notifications"
        >
          🔔
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "8px",
            height: "8px",
            background: "#ff5555",
            borderRadius: "50%",
            border: "2px solid var(--topbar-bg)",
          }}
        />
      </div>

      <Link href="/admin/login" className="topbar-user" title="Sign out">
        <div className="user-avatar">AD</div>
        <span className="user-name">Admin</span>
        <span style={{ fontSize: "11px", color: "var(--text-ter)", marginLeft: "2px" }}>↩</span>
      </Link>
    </header>
  );
}
