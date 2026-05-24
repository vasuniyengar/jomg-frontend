"use client";

import Link from "next/link";
import styles from "./dashboard.module.css";
import { useEffect, useMemo, useState } from "react";
import { buildDashboardSummary, fetchHostTournaments } from "@/lib/dashboard";

export default function DashboardPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadDashboard = async () => {
      const loadStart = Date.now();
      // #region agent log
      fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
        body: JSON.stringify({
          sessionId: "4a201a",
          runId: "pre-fix",
          hypothesisId: "H2-H5",
          location: "dashboard/page.jsx:loadStart",
          message: "Dashboard load start",
          data: {},
          timestamp: loadStart,
        }),
      }).catch(() => {});
      // #endregion
      try {
        const data = await fetchHostTournaments();
        if (mounted) {
          setTournaments(data);
        }
        // #region agent log
        fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
          body: JSON.stringify({
            sessionId: "4a201a",
            runId: "pre-fix",
            hypothesisId: "H2-H5",
            location: "dashboard/page.jsx:loadDone",
            message: "Dashboard load done",
            data: { count: data?.length ?? 0, durationMs: Date.now() - loadStart },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load dashboard");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => buildDashboardSummary(tournaments), [tournaments]);
  const firstTournament = summary.firstTournament;
  const title = firstTournament?.name || "No tournaments yet";
  const location = firstTournament?.location || "Add your first tournament";
  const tournamentStatus = firstTournament?.status || "draft";

  return (
    <div className={`screen ${styles.pageRoot}`} id="screen-dashboard">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 1 · Setup</div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Overview &amp; alerts · {title}</div>
        </div>
        <div className="page-actions">
          <div
            id="status-pill-wrap"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              className="status-pill"
              data-status="draft"
              title="Tournament status"
            >
              <span className="status-dot" />
              <span className="status-label">{tournamentStatus}</span>
              <span className="status-caret">▾</span>
            </div>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="tournament-hero">
          <div className="tournament-hero-left">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <span className="tournament-status-badge tsb-draft">
                ○ {String(tournamentStatus).toUpperCase()}
              </span>
              <span className="dupr-badge">DUPR Rated</span>
            </div>
            <Link
              href="/admin/create"
              className="tournament-name-hero"
              style={{ textDecoration: "none", color: "inherit" }}
              title="Edit tournament info"
            >
              {title}{" "}
              <span style={{ fontSize: "14px", opacity: 0.4 }}>✏️</span>
            </Link>
            <div className="tournament-meta-row">
              <div className="tournament-meta-item">
                📍 <strong>{location}</strong>
              </div>
              <div className="tournament-meta-item">
                📅 <strong>Apr 19–22, 2025</strong>
              </div>
              <div className="tournament-meta-item">
                <strong>5 Divisions · Mixed Doubles DUPR</strong>
              </div>
              <div className="tournament-meta-item">
                ⚖️ <strong>Single + Double Elim</strong>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "flex-end",
            }}
          >
            <Link href="/admin/create" className="btn btn-ghost btn-sm">
              ✏️ Edit Info
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ display: "none" }}
            >
              🔗 Share Public Link
            </button>
            <button type="button" className="btn btn-primary btn-sm">
              📢 Publish Tournament →
            </button>
          </div>
        </div>

        <div className="dash-alerts">
          <div className="alert alert-err">
            ⚠️ <strong>3 matches overdue</strong> — Courts 2, 5, 7 are running 15+
            min behind schedule.
          </div>
          <div className="alert alert-warn">
            ⏳ <strong>7 waitlist approvals</strong> pending your review before
            registration closes.
          </div>
        </div>

        <div className="metrics-row">
          <div className="metric">
            <div className="metric-label">Registered Players</div>
            <div className="metric-value">{summary.registeredPlayers}</div>
            <div className="metric-delta delta-up">
              {summary.capacityPlayers > 0
                ? `${summary.capacityPlayers} max capacity`
                : "Create a tournament to begin"}
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Check-In Rate</div>
            <div className="metric-value">{summary.checkInRate}%</div>
            <div className="metric-delta delta-up">Estimated from registrations</div>
          </div>
          <div className="metric">
            <div className="metric-label">Tournaments</div>
            <div className="metric-value">{tournaments.length}</div>
            <div className="metric-delta delta-up">
              {summary.activeCount} active · {summary.draftCount} draft
            </div>
          </div>
        </div>

        {loading ? (
          <div className="alert alert-warn">Loading dashboard data...</div>
        ) : null}
        {error ? <div className="alert alert-err">{error}</div> : null}

        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <div>
              <span className="card-title">Division Registration Status</span>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-ter)",
                  marginTop: "2px",
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                5 divisions · 94/160 teams total ·{" "}
                <span style={{ color: "var(--primary-text)", fontWeight: 700 }}>
                  59% full
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  fontSize: "10px",
                  color: "var(--text-ter)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                  />
                  Healthy
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#f59e0b",
                    }}
                  />
                  Watch
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#ef4444",
                    }}
                  />
                  Low
                </span>
              </div>
              <Link href="/admin/divisions" className="btn btn-ghost btn-sm">
                Manage →
              </Link>
            </div>
          </div>
          <div className="div-reg-grid">
            <Link href="/admin/divisions" className="div-reg-card">
              <div className="div-ring-wrap">
                <svg className="div-ring" height="72" viewBox="0 0 72 72" width="72">
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="var(--border)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="#10b981"
                    strokeDasharray="188.5"
                    strokeDashoffset="32"
                    strokeLinecap="round"
                    strokeWidth="6"
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <div className="div-ring-pct">
                  83<span>%</span>
                </div>
              </div>
              <div className="div-reg-info">
                <div className="div-reg-name">Men&apos;s Doubles 4.5</div>
                <div className="div-reg-meta">Pool Play</div>
                <div className="div-reg-count">
                  <span style={{ color: "#10b981", fontWeight: 800 }}>10</span>
                  <span style={{ color: "var(--text-ter)" }}>/12 teams</span>
                </div>
              </div>
            </Link>
            <Link href="/admin/divisions" className="div-reg-card">
              <div className="div-ring-wrap">
                <svg className="div-ring" height="72" viewBox="0 0 72 72" width="72">
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="var(--border)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="#10b981"
                    strokeDasharray="188.5"
                    strokeDashoffset="47"
                    strokeLinecap="round"
                    strokeWidth="6"
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <div className="div-ring-pct">
                  75<span>%</span>
                </div>
              </div>
              <div className="div-reg-info">
                <div className="div-reg-name">Women&apos;s Doubles 4.0</div>
                <div className="div-reg-meta">Pool Play</div>
                <div className="div-reg-count">
                  <span style={{ color: "#10b981", fontWeight: 800 }}>24</span>
                  <span style={{ color: "var(--text-ter)" }}>/32 teams</span>
                </div>
              </div>
            </Link>
            <Link href="/admin/divisions" className="div-reg-card">
              <div className="div-ring-wrap">
                <svg className="div-ring" height="72" viewBox="0 0 72 72" width="72">
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="var(--border)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="#10b981"
                    strokeDasharray="188.5"
                    strokeDashoffset="38"
                    strokeLinecap="round"
                    strokeWidth="6"
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <div className="div-ring-pct">
                  80<span>%</span>
                </div>
              </div>
              <div className="div-reg-info">
                <div className="div-reg-name">Mixed Doubles 3.5</div>
                <div className="div-reg-meta">Pool Play</div>
                <div className="div-reg-count">
                  <span style={{ color: "#10b981", fontWeight: 800 }}>32</span>
                  <span style={{ color: "var(--text-ter)" }}>/40 teams</span>
                </div>
              </div>
            </Link>
            <Link href="/admin/divisions" className="div-reg-card">
              <div className="div-ring-wrap">
                <svg className="div-ring" height="72" viewBox="0 0 72 72" width="72">
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="var(--border)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="#10b981"
                    strokeDasharray="188.5"
                    strokeDashoffset="23"
                    strokeLinecap="round"
                    strokeWidth="6"
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <div className="div-ring-pct">
                  88<span>%</span>
                </div>
              </div>
              <div className="div-reg-info">
                <div className="div-reg-name">Men&apos;s Singles Open</div>
                <div className="div-reg-meta">Single Elim</div>
                <div className="div-reg-count">
                  <span style={{ color: "#10b981", fontWeight: 800 }}>14</span>
                  <span style={{ color: "var(--text-ter)" }}>/16 teams</span>
                </div>
              </div>
            </Link>
            <Link
              href="/admin/divisions"
              className="div-reg-card div-reg-low"
            >
              <div className="div-ring-wrap">
                <svg className="div-ring" height="72" viewBox="0 0 72 72" width="72">
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="var(--border)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    fill="none"
                    r="30"
                    stroke="#ef4444"
                    strokeDasharray="188.5"
                    strokeDashoffset="145"
                    strokeLinecap="round"
                    strokeWidth="6"
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <div className="div-ring-pct" style={{ color: "#ef4444" }}>
                  23<span>%</span>
                </div>
              </div>
              <div className="div-reg-info">
                <div className="div-reg-name">Mixed Doubles 5.0+</div>
                <div className="div-reg-meta">Pool Play</div>
                <div className="div-reg-count">
                  <span style={{ color: "#ef4444", fontWeight: 800 }}>14</span>
                  <span style={{ color: "var(--text-ter)" }}>/60 teams</span>{" "}
                  <span className="div-low-pill">⚠ Low</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: "20px" }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Tournament Setup</span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-ter)",
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                Get ready before you go live
              </span>
            </div>
            <div className="quick-actions">
              <Link href="/admin/divisions" className="qa-card">
                <div className="qa-icon">🏆</div>
                <div className="qa-title">Manage Divisions</div>
                <div className="qa-sub">5 divisions · Edit formats &amp; fees</div>
              </Link>
              <Link href="/admin/create" className="qa-card">
                <div className="qa-icon">📝</div>
                <div className="qa-title">Tournament Info</div>
                <div className="qa-sub">Description, banner &amp; sponsors</div>
              </Link>
              <Link href="/admin/settings" className="qa-card">
                <div className="qa-icon">⚙️</div>
                <div className="qa-title">Tournament Settings</div>
                <div className="qa-sub">Rules, pricing &amp; visibility</div>
              </Link>
              <Link href="/admin/reglist" className="qa-card">
                <div className="qa-icon">👥</div>
                <div className="qa-title">View Players</div>
                <div className="qa-sub">120 registered · 7 pending</div>
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Tournament Countdown</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "100px",
                  background: "var(--primary-dim)",
                  color: "var(--primary-text)",
                }}
              >
                IN SETUP
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                padding: "4px 0 14px",
                borderBottom: "1px solid var(--border)",
                marginBottom: "14px",
              }}
            >
              {["23", "14", "32", "18"].map((n, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "8px 4px",
                    background: "var(--badge-bg)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "26px",
                      fontWeight: 900,
                      color: "var(--primary-text)",
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "var(--text-ter)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginTop: "2px",
                      fontWeight: 700,
                    }}
                  >
                    {["Days", "Hours", "Min", "Sec"][i]}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-sec)",
                marginBottom: "10px",
              }}
            >
              <strong style={{ color: "var(--text)" }}>
                Austin Pickleball Open 2025
              </strong>{" "}
              · Starts{" "}
              <strong style={{ color: "var(--text)" }}>
                Apr 19, 2025 · 9:00 AM CT
              </strong>
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "var(--text-sec)",
                marginTop: "6px",
                marginBottom: "8px",
              }}
            >
              Setup Checklist
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                <span style={{ color: "var(--text)", flex: 1 }}>
                  Tournament info &amp; branding
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-ter)" }}>
                  Complete
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                <span style={{ color: "var(--text)", flex: 1 }}>
                  Divisions created &amp; published
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-ter)" }}>
                  5 divisions
                </span>
              </div>
              <Link
                href="/admin/settings"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background: "var(--badge-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span style={{ color: "#f59e0b", fontWeight: 700 }}>○</span>
                <span style={{ color: "var(--text)", flex: 1 }}>
                  Confirm &amp; lock tournament settings
                </span>
                <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700 }}>
                  Pending →
                </span>
              </Link>
              <Link
                href="/admin/draw"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background: "var(--badge-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span style={{ color: "var(--text-ter)", fontWeight: 700 }}>○</span>
                <span style={{ color: "var(--text)", flex: 1 }}>
                  Generate brackets &amp; pool schedules
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-ter)" }}>
                  Apr 10 after sign-ups close
                </span>
              </Link>
              <Link
                href="/admin/schedule"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background: "var(--badge-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span style={{ color: "var(--text-ter)", fontWeight: 700 }}>○</span>
                <span style={{ color: "var(--text)", flex: 1 }}>
                  Publish match schedule to players
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-ter)" }}>
                  Apr 15 target
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
