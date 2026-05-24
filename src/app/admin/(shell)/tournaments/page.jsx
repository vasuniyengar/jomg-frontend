"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./tournaments.module.css";
import CreateTournamentWizard from "./_components/CreateTournamentWizard";
import {
  countByHubStatus,
  fetchHostTournaments,
  formatRevenue,
  formatTournamentDates,
  hubStatusMeta,
  tournamentLocationLabel,
} from "@/lib/tournaments";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "draft", label: "Drafts" },
  { id: "completed", label: "Completed" },
];

function HubLogo() {
  return (
    <svg
      fill="none"
      height="32"
      style={{ verticalAlign: "middle" }}
      viewBox="0 0 22 22"
      width="32"
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

const TOURNAMENTS_PAGE_MOUNT = typeof performance !== "undefined" ? performance.now() : 0;

export default function TournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardKey, setWizardKey] = useState(0);

  const openWizard = () => {
    setWizardKey((k) => k + 1);
    setWizardOpen(true);
  };

  const closeWizard = () => setWizardOpen(false);

  const loadTournaments = useCallback(async () => {
    const loadStart = Date.now();
    // #region agent log
    fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
      body: JSON.stringify({
        sessionId: "4a201a",
        runId: "pre-fix",
        hypothesisId: "H2-H4",
        location: "tournaments/page.jsx:loadStart",
        message: "loadTournaments start",
        data: {
          search,
          msSincePageModuleLoad:
            typeof performance !== "undefined" ? Math.round(performance.now() - TOURNAMENTS_PAGE_MOUNT) : null,
        },
        timestamp: loadStart,
      }),
    }).catch(() => {});
    // #endregion
    setLoading(true);
    setError("");
    try {
      const data = await fetchHostTournaments({ search });
      setTournaments(data);
      // #region agent log
      fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
        body: JSON.stringify({
          sessionId: "4a201a",
          runId: "pre-fix",
          hypothesisId: "H2",
          location: "tournaments/page.jsx:loadDone",
          message: "loadTournaments done",
          data: { count: data?.length ?? 0, durationMs: Date.now() - loadStart },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    } catch (err) {
      setError(err.message || "Failed to load tournaments");
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
      body: JSON.stringify({
        sessionId: "4a201a",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "tournaments/page.jsx:mount",
        message: "TournamentsPage mounted",
        data: {
          msSincePageModuleLoad:
            typeof performance !== "undefined" ? Math.round(performance.now() - TOURNAMENTS_PAGE_MOUNT) : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, []);
  // #endregion

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTournaments();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadTournaments, search]);

  const counts = useMemo(() => countByHubStatus(tournaments), [tournaments]);

  const subtitleClub = useMemo(() => {
    const first = tournaments[0]?.Club;
    if (first?.name) {
      return `${first.name} · ${tournaments.length} tournament${tournaments.length === 1 ? "" : "s"}`;
    }
    return `${tournaments.length} tournament${tournaments.length === 1 ? "" : "s"}`;
  }, [tournaments]);

  const filteredRows = useMemo(() => {
    if (filter === "all") return tournaments;
    return tournaments.filter((t) => t.hubStatus === filter);
  }, [tournaments, filter]);

  const handleRowClick = (tournament) => {
    if (tournament.hubStatus === "draft") {
      router.push(`/admin/settings?tournamentId=${tournament.id}`);
      return;
    }
    router.push("/admin/dashboard");
  };

  const renderActions = (tournament) => {
    const status = tournament.hubStatus;
    if (status === "active" || status === "upcoming") {
      return (
        <button
          type="button"
          className="hub-mini-btn"
          onClick={(e) => e.stopPropagation()}
          title="Share public link"
        >
          Share
        </button>
      );
    }
    if (status === "draft") {
      return (
        <button
          type="button"
          className="hub-mini-btn danger"
          onClick={(e) => e.stopPropagation()}
          title="Delete draft"
        >
          ✕ Delete
        </button>
      );
    }
    if (status === "completed") {
      return (
        <button
          type="button"
          className="hub-mini-btn"
          onClick={(e) => e.stopPropagation()}
          title="Duplicate as new tournament"
        >
          ⎘ Duplicate
        </button>
      );
    }
    return null;
  };

  return (
    <div className={`screen active ${styles.page}`} id="screen-hub">
      <div className={styles.hubBody}>
        <header className={styles.hubHeader}>
          <div>
            <h1 className={styles.hubTitle}>
              <HubLogo /> My Tournaments
            </h1>
            <p className={styles.hubSub}>{subtitleClub}</p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={openWizard}
          >
            + Create Tournament
          </button>
        </header>

        <div className={styles.toolbar}>
          <input
            className={`form-input ${styles.searchInput}`}
            placeholder="🔍 Search tournaments by name, date, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.filterPill} ${filter === f.id ? styles.filterPillActive : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}{" "}
              <span className={styles.filterCount}>{counts[f.id] ?? 0}</span>
            </button>
          ))}
        </div>

        {loading && <div className={styles.loadingState}>Loading tournaments…</div>}
        {error && !loading && <div className={styles.errorState}>{error}</div>}

        {!loading && !error && (
          <>
            <div className={`table-wrap ${styles.hubTable}`}>
              <table id="hub-table">
                <thead>
                  <tr>
                    <th style={{ width: 14, paddingLeft: 18 }} />
                    <th>Tournament</th>
                    <th style={{ width: 140 }}>Dates</th>
                    <th style={{ width: 100 }}>Status</th>
                    <th style={{ width: 90, textAlign: "right" }}>Players</th>
                    <th style={{ width: 90, textAlign: "right" }}>Revenue</th>
                    <th style={{ width: 80, textAlign: "center" }}>Divs</th>
                    <th style={{ width: 200, textAlign: "right", paddingRight: 18 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((t) => {
                    const meta = hubStatusMeta(t.hubStatus);
                    const rowClass = [
                      "hub-row-clickable",
                      t.hubStatus === "completed" ? "hub-row-completed" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <tr
                        key={t.id}
                        className={rowClass}
                        onClick={() => handleRowClick(t)}
                      >
                        <td style={{ paddingLeft: 18 }}>
                          <span className={`hub-status-dot ${meta.dot}`} />
                        </td>
                        <td>
                          <div className="hub-tname">{t.name}</div>
                          <div className="hub-tmeta">
                            📍 {tournamentLocationLabel(t)}
                          </div>
                        </td>
                        <td>
                          <span className="hub-tdates">
                            {formatTournamentDates(t.startDate, t.endDate)}
                          </span>
                        </td>
                        <td>
                          <span className={`pill ${meta.pill}`}>{meta.label}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {t.players > 0 ? (
                            <span className="hub-tnum">{t.players}</span>
                          ) : (
                            <span style={{ color: "var(--text-ter)" }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {t.revenue > 0 ? (
                            <span className="hub-tnum">{formatRevenue(t.revenue)}</span>
                          ) : (
                            <span style={{ color: "var(--text-ter)" }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="hub-tnum">{t.divisions ?? 0}</span>
                        </td>
                        <td style={{ textAlign: "right", paddingRight: 18 }}>
                          <div className="hub-actions">{renderActions(t)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!filteredRows.length && (
              <div className={styles.emptyState}>{tournaments.length
                  ? "No tournaments match this filter. Try All or Drafts."
                  : "No tournaments yet. Create your first tournament to get started."}</div>
            )}
          </>
        )}
      </div>

      <CreateTournamentWizard
        key={wizardKey}
        open={wizardOpen}
        onClose={closeWizard}
        onCreated={async () => {
          setFilter("all");
          await loadTournaments();
        }}
      />
    </div>
  );
}
