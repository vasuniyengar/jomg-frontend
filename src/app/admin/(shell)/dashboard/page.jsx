"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TournamentPicker from "../_components/TournamentPicker";
import StatusControlModal from "./_components/StatusControlModal";
import styles from "./dashboard.module.css";
import {
  fetchTournamentDashboard,
  ringDashOffset,
  ringStrokeColor,
  updateTournamentStatus,
} from "@/lib/dashboard";
import {
  displayStatus,
  formatRevenue,
  formatTournamentDates,
  statusBadgeClass,
  tournamentAdminPath,
} from "@/lib/tournaments";

function useCountdown(targetDate) {
  const [parts, setParts] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const end = new Date(targetDate).getTime();
      const now = Date.now();
      let diff = Math.max(0, end - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * 24 * 60 * 60 * 1000;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * 60 * 60 * 1000;
      const mins = Math.floor(diff / (1000 * 60));
      diff -= mins * 60 * 1000;
      const secs = Math.floor(diff / 1000);
      setParts({ days, hours, mins, secs });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return parts;
}

function ChecklistRow({ done, children, href, pendingLabel }) {
  const inner = (
    <>
      <span style={{ color: done ? "#10b981" : "#f59e0b", fontWeight: 700 }}>
        {done ? "✓" : "○"}
      </span>
      <span style={{ color: "var(--text)", flex: 1 }}>{children}</span>
      {pendingLabel ? (
        <span
          style={{
            fontSize: 10,
            color: done ? "var(--text-ter)" : "#f59e0b",
            fontWeight: 700,
          }}
        >
          {pendingLabel}
        </span>
      ) : null}
    </>
  );
  const boxStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    background: done ? "rgba(16,185,129,0.08)" : "var(--badge-bg)",
    border: `1px solid ${done ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
    borderRadius: "var(--radius-sm)",
    fontSize: 12,
    textDecoration: "none",
    color: "inherit",
  };
  if (href && !done) {
    return (
      <Link href={href} style={boxStyle}>
        {inner}
      </Link>
    );
  }
  return <div style={boxStyle}>{inner}</div>;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tournamentId = searchParams.get("tournamentId");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!tournamentId) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const dash = await fetchTournamentDashboard(tournamentId);
      setData(dash);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    load();
  }, [load]);

  const t = data?.tournament;
  const metrics = data?.metrics;
  const brackets = data?.brackets || [];
  const checklist = data?.checklist || {};
  const isLive = t?.status === "ongoing";
  const countdown = useCountdown(t?.startDate);

  const paths = useMemo(
    () => ({
      divisions: tournamentAdminPath("/admin/divisions", tournamentId),
      create: tournamentAdminPath("/admin/create", tournamentId),
      settings: tournamentAdminPath("/admin/settings", tournamentId),
      reglist: tournamentAdminPath("/admin/reglist", tournamentId),
      scoreentry: tournamentAdminPath("/admin/scoreentry", tournamentId),
      control: tournamentAdminPath("/admin/control", tournamentId),
    }),
    [tournamentId]
  );

  const handleStatusChange = async (nextStatus) => {
    if (!tournamentId) {
      throw new Error("No tournament selected");
    }
    setStatusUpdating(true);
    setError("");
    try {
      const result = await updateTournamentStatus(tournamentId, nextStatus);
      setData((prev) => {
        if (!prev?.tournament) return prev;
        return {
          ...prev,
          tournament: {
            ...prev.tournament,
            status: result?.status ?? nextStatus,
          },
          checklist: {
            ...prev.checklist,
            isPublished:
              nextStatus === "active" ||
              nextStatus === "ongoing" ||
              nextStatus === "completed",
          },
        };
      });
      load().catch(() => {});
      if (nextStatus === "ongoing") {
        setStatusModalOpen(false);
        router.push(paths.control);
      }
    } catch (err) {
      const message = err.message || "Failed to update status";
      setError(message);
      throw err;
    } finally {
      setStatusUpdating(false);
    }
  };

  const openStatusModal = () => {
    setStatusModalOpen(true);
    if (tournamentId) {
      fetchTournamentDashboard(tournamentId)
        .then(setData)
        .catch(() => {});
    }
  };

  if (!tournamentId) {
    return <TournamentPicker label="Dashboard" />;
  }

  const displayLabel = displayStatus(t?.status, data?.settingsConfirmed);
  const heroActionLabel =
    t?.status === "draft"
      ? "📢 Publish Tournament →"
      : t?.status === "active"
        ? "▶ Start Live →"
        : t?.status === "ongoing"
          ? "● Live — Manage"
          : "View Tournament";

  return (
    <div className={`screen ${styles.pageRoot}`} id="screen-dashboard">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 1 · Setup</div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">
            Overview &amp; alerts · {t?.name || "…"}
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="status-pill"
            data-status={t?.status || "draft"}
            title="Manage tournament status"
            onClick={openStatusModal}
          >
            <span className="status-dot" />
            <span className="status-label">{displayLabel}</span>
            <span className="status-caret">▾</span>
          </button>
        </div>
      </div>

      <div className="content">
        {loading ? (
          <div className="alert alert-warn">Loading dashboard…</div>
        ) : null}
        {error ? <div className="alert alert-err">{error}</div> : null}

        {t ? (
          <>
            <div className="tournament-hero">
              <div className="tournament-hero-left">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span
                    className={`tournament-status-badge ${statusBadgeClass(t.status)}`}
                  >
                    ○ {displayLabel.toUpperCase()}
                  </span>
                  {t.duprRecorded ? <span className="dupr-badge">DUPR Rated</span> : null}
                </div>
                <Link
                  href={paths.create}
                  className="tournament-name-hero"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {t.name} <span style={{ fontSize: 14, opacity: 0.4 }}>✏️</span>
                </Link>
                <div className="tournament-meta-row">
                  <div className="tournament-meta-item">
                    📍 <strong>{t.venue || t.location}</strong>
                  </div>
                  <div className="tournament-meta-item">
                    📅 <strong>{formatTournamentDates(t.startDate, t.endDate)}</strong>
                  </div>
                  <div className="tournament-meta-item">
                    <strong>
                      {metrics?.divisionCount || 0} Divisions
                      {t.clubName ? ` · ${t.clubName}` : ""}
                    </strong>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  alignItems: "flex-end",
                }}
              >
                <Link href={paths.create} className="btn btn-ghost btn-sm">
                  ✏️ Edit Info
                </Link>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={openStatusModal}
                >
                  {heroActionLabel}
                </button>
              </div>
            </div>

            {isLive ? (
              <div style={{ marginBottom: 20 }}>
                <Link href={paths.control} className="btn btn-primary btn-md">
                  ● Matches Live — Open Live Play →
                </Link>
              </div>
            ) : null}

            <div className="metrics-row">
              <div className="metric">
                <div className="metric-label">Registered Players</div>
                <div className="metric-value">{metrics?.registeredPlayers ?? 0}</div>
                <div className="metric-delta delta-up">
                  {metrics?.totalCapacity
                    ? `${metrics.totalCapacity} team slots`
                    : "No capacity set"}
                </div>
              </div>
              <Link
                href={paths.reglist}
                className="metric"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="metric-label">Fill Rate</div>
                <div className="metric-value">{metrics?.fillPct ?? 0}%</div>
                <div className="metric-delta delta-up">View players →</div>
              </Link>
              <div className="metric">
                <div className="metric-label">Revenue</div>
                <div className="metric-value">
                  {formatRevenue(metrics?.revenue)}
                </div>
                <div className="metric-delta delta-up">From paid registrations</div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <div>
                  <span className="card-title">Division Registration Status</span>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-ter)",
                      marginTop: 2,
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    {brackets.length} divisions · {metrics?.registeredPlayers ?? 0}/
                    {metrics?.totalCapacity ?? 0} teams ·{" "}
                    <span style={{ color: "var(--primary-text)", fontWeight: 700 }}>
                      {metrics?.fillPct ?? 0}% full
                    </span>
                  </div>
                </div>
                <Link href={paths.divisions} className="btn btn-ghost btn-sm">
                  Manage →
                </Link>
              </div>
              <div className="div-reg-grid">
                {brackets.length === 0 ? (
                  <div style={{ padding: 16, color: "var(--text-sec)", fontSize: 13 }}>
                    No divisions yet.{" "}
                    <Link href={paths.divisions} style={{ color: "var(--primary-text)" }}>
                      Add a division
                    </Link>
                  </div>
                ) : (
                  brackets.map((b) => {
                    const color = ringStrokeColor(b.fillPct);
                    const low = b.fillPct < 40;
                    return (
                      <Link
                        key={b.id}
                        href={paths.divisions}
                        className={`div-reg-card${low ? " div-reg-low" : ""}`}
                      >
                        <div className="div-ring-wrap">
                          <svg
                            className="div-ring"
                            height="72"
                            viewBox="0 0 72 72"
                            width="72"
                          >
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
                              stroke={color}
                              strokeDasharray="188.5"
                              strokeDashoffset={ringDashOffset(b.fillPct)}
                              strokeLinecap="round"
                              strokeWidth="6"
                              transform="rotate(-90 36 36)"
                            />
                          </svg>
                          <div
                            className="div-ring-pct"
                            style={low ? { color: "#ef4444" } : undefined}
                          >
                            {b.fillPct}
                            <span>%</span>
                          </div>
                        </div>
                        <div className="div-reg-info">
                          <div className="div-reg-name">{b.name}</div>
                          <div className="div-reg-meta">{b.formatLabel || "—"}</div>
                          <div className="div-reg-count">
                            <span style={{ color, fontWeight: 800 }}>
                              {b.registeredCount}
                            </span>
                            <span style={{ color: "var(--text-ter)" }}>
                              /{b.maxTeams} teams
                            </span>
                            {low ? (
                              <span className="div-low-pill">⚠ Low</span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    {isLive ? "Live Operations" : "Tournament Setup"}
                  </span>
                </div>
                {isLive ? (
                  <div className="quick-actions">
                    <Link href={paths.scoreentry} className="qa-card">
                      <div className="qa-icon">🎾</div>
                      <div className="qa-title">Enter Score</div>
                      <div className="qa-sub">Record live match</div>
                    </Link>
                    <Link href={paths.reglist} className="qa-card">
                      <div className="qa-icon">➕</div>
                      <div className="qa-title">Add Player</div>
                      <div className="qa-sub">Manual registration</div>
                    </Link>
                    <Link href={paths.control} className="qa-card">
                      <div className="qa-icon">🎮</div>
                      <div className="qa-title">Live Play</div>
                      <div className="qa-sub">Court feed &amp; matches</div>
                    </Link>
                  </div>
                ) : (
                  <div className="quick-actions">
                    <Link href={paths.divisions} className="qa-card">
                      <div className="qa-icon">🏆</div>
                      <div className="qa-title">Manage Divisions</div>
                      <div className="qa-sub">
                        {brackets.length} divisions · Edit formats &amp; fees
                      </div>
                    </Link>
                    <Link href={paths.create} className="qa-card">
                      <div className="qa-icon">📝</div>
                      <div className="qa-title">Tournament Info</div>
                      <div className="qa-sub">Description, banner &amp; sponsors</div>
                    </Link>
                    <Link href={paths.settings} className="qa-card">
                      <div className="qa-icon">⚙️</div>
                      <div className="qa-title">Tournament Settings</div>
                      <div className="qa-sub">Rules, pricing &amp; visibility</div>
                    </Link>
                    <Link href={paths.reglist} className="qa-card">
                      <div className="qa-icon">👥</div>
                      <div className="qa-title">View Players</div>
                      <div className="qa-sub">
                        {metrics?.registeredPlayers ?? 0} registered
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {!isLive ? (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Tournament Countdown</span>
                    <span
                      style={{
                        fontSize: 10,
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
                      gap: 8,
                      padding: "4px 0 14px",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: 14,
                    }}
                  >
                    {[
                      ["Days", countdown.days],
                      ["Hours", countdown.hours],
                      ["Min", countdown.mins],
                      ["Sec", countdown.secs],
                    ].map(([label, n]) => (
                      <div
                        key={label}
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
                            fontSize: 26,
                            fontWeight: 900,
                            color: "var(--primary-text)",
                            lineHeight: 1,
                          }}
                        >
                          {n}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "var(--text-ter)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginTop: 2,
                            fontWeight: 700,
                          }}
                        >
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-sec)",
                      marginBottom: 10,
                    }}
                  >
                    <strong style={{ color: "var(--text)" }}>{t.name}</strong> · Starts{" "}
                    <strong style={{ color: "var(--text)" }}>
                      {formatTournamentDates(t.startDate, t.endDate)}
                    </strong>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "var(--text-sec)",
                      marginBottom: 8,
                    }}
                  >
                    Setup Checklist
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <ChecklistRow done={checklist.infoComplete}>
                      Tournament info &amp; branding
                    </ChecklistRow>
                    <ChecklistRow
                      done={checklist.hasDivisions}
                      pendingLabel={
                        checklist.hasDivisions
                          ? `${brackets.length} divisions`
                          : "Pending →"
                      }
                      href={paths.divisions}
                    >
                      Divisions created
                    </ChecklistRow>
                    <ChecklistRow
                      done={checklist.settingsConfirmed}
                      href={paths.settings}
                      pendingLabel={
                        checklist.settingsConfirmed ? "Complete" : "Pending →"
                      }
                    >
                      Confirm &amp; lock tournament settings
                    </ChecklistRow>
                    <ChecklistRow
                      done={checklist.isPublished}
                      pendingLabel={checklist.isPublished ? "Published" : "After confirm"}
                    >
                      Publish tournament page
                    </ChecklistRow>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <StatusControlModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        tournamentId={tournamentId}
        status={t?.status || "draft"}
        settingsConfirmed={data?.settingsConfirmed}
        slug={t?.slug}
        startDate={t?.startDate}
        timezone={t?.timezone}
        onStatusChange={handleStatusChange}
        updating={statusUpdating}
      />
    </div>
  );
}
