"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PHASES } from "./sidebar-config";

const COLLAPSED_KEY = "jomg-sidebar-collapsed";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [phaseOpen, setPhaseOpen] = useState({
    "phase-1": true,
    "phase-2": true,
    "phase-3": false,
    "phase-4": false,
    "phase-5": false,
  });

  useEffect(() => {
    try {
      const c = localStorage.getItem(COLLAPSED_KEY) === "1";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore sidebar width from localStorage
      setCollapsed(c);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const togglePhase = useCallback((phaseId) => {
    if (collapsed) return;
    setPhaseOpen((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }, [collapsed]);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`} id="sidebar">
      <div
        className="sidebar-collapse-btn"
        onClick={toggleCollapsed}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCollapsed();
          }
        }}
        role="button"
        tabIndex={0}
        title={collapsed ? "Expand navigation" : "Collapse navigation"}
      >
        <div className="sidebar-collapse-icon" aria-hidden>
          ◀
        </div>
      </div>

      {PHASES.map((phase) => {
        const open = phaseOpen[phase.id];
        const phaseCollapsed = !open;
        return (
          <div
            key={phase.id}
            className={`sidebar-phase${phaseCollapsed ? " collapsed" : ""}`}
            id={phase.id}
          >
            <div
              className="phase-label"
              data-label={phase.label}
              onClick={() => togglePhase(phase.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePhase(phase.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span className="phase-num">{phase.num}</span>
              {phase.label}
              <span className="phase-chevron">▾</span>
            </div>
            <div
              className={`phase-body${phaseCollapsed ? " collapsed" : ""}`}
              id={`${phase.id}-body`}
            >
              <div className="phase-sub">{phase.sub}</div>
              {phase.items.map((item, idx) => {
                if (item.comingSoon) {
                  return (
                    <div
                      key={`${phase.id}-cs-${idx}`}
                      className="nav-item nav-coming-soon"
                      title={`Coming in ${item.version}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {item.label}
                      <span className="nav-version-badge">{item.version}</span>
                    </div>
                  );
                }
                const active = pathname === item.href;
                const badgeCls =
                  item.badge?.variant === "red"
                    ? "nav-badge red"
                    : item.badge?.variant === "green"
                      ? "nav-badge"
                      : item.badge
                        ? "nav-badge gray"
                        : "";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${active ? " active" : ""}`}
                    data-label={item.label}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    {item.liveDot ? (
                      <span
                        className="status-dot"
                        style={{ marginLeft: "auto" }}
                      />
                    ) : null}
                    {item.badge ? (
                      <span
                        className={badgeCls}
                        style={item.badge.style}
                      >
                        {item.badge.text}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
