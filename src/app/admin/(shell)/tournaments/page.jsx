"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./tournaments.module.css";
import CreateTournamentWizard from "./_components/CreateTournamentWizard";
import DeleteTournamentConfirmModal from "./_components/DeleteTournamentConfirmModal";
import {
  countByHubStatus,
  deleteTournament,
  fetchHostTournaments,
  formatRevenue,
  formatTournamentDates,
  hubStatusMeta,
  tournamentAdminPath,
  tournamentLocationLabel,
} from "@/lib/tournaments";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "draft", label: "Drafts" },
  { id: "completed", label: "Completed" },
];

const HUB_LAYOUTS = [
  { id: "table", label: "Table" },
  { id: "gallery", label: "Gallery" },
  { id: "compact", label: "Compact" },
];

const HUB_LAYOUT_KEY = "jomg_hub_layout";

function tournamentInitials(name) {
  const parts = String(name || "T")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "T";
  return parts
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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

export default function TournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardKey, setWizardKey] = useState(0);
  const [editTournamentId, setEditTournamentId] = useState(null);
  const [hubLayout, setHubLayout] = useState("table");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(HUB_LAYOUT_KEY);
    if (saved && HUB_LAYOUTS.some((l) => l.id === saved)) {
      setHubLayout(saved);
    }
  }, []);

  const changeHubLayout = (layoutId) => {
    setHubLayout(layoutId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HUB_LAYOUT_KEY, layoutId);
    }
  };

  const openWizard = () => {
    setEditTournamentId(null);
    setWizardKey((k) => k + 1);
    setWizardOpen(true);
  };

  const openEditWizard = (tournament) => {
    setEditTournamentId(tournament.id);
    setWizardKey((k) => k + 1);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setEditTournamentId(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete?.id) return;
    setDeleting(true);
    setError("");
    try {
      await deleteTournament(pendingDelete.id);
      setPendingDelete(null);
      await loadTournaments();
    } catch (err) {
      setError(err.message || "Failed to delete tournament");
    } finally {
      setDeleting(false);
    }
  };

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchHostTournaments({ search });
      setTournaments(data);
    } catch (err) {
      setError(err.message || "Failed to load tournaments");
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

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
    router.push(tournamentAdminPath("/admin/dashboard", tournament.id));
  };

  const renderActions = (tournament) => {
    const status = tournament.hubStatus;
    if (status === "draft" || status === "upcoming") {
      return (
        <>
          <button
            type="button"
            className="hub-mini-btn"
            onClick={(e) => {
              e.stopPropagation();
              openEditWizard(tournament);
            }}
            title="Edit tournament"
          >
            Edit
          </button>
          {status === "draft" ? (
            <button
              type="button"
              className="hub-mini-btn danger"
              onClick={(e) => {
                e.stopPropagation();
                setPendingDelete(tournament);
              }}
              title="Delete draft"
            >
              ✕ Delete
            </button>
          ) : null}
        </>
      );
    }
    if (status === "active") {
      return (
        <button
          type="button"
          className="hub-mini-btn"
          onClick={(e) => {
            e.stopPropagation();
            router.push(tournamentAdminPath("/admin/settings", tournament.id));
          }}
          title="Tournament settings"
        >
          Settings
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
          <span className={styles.toolbarDivider} aria-hidden />
          <div className={styles.layoutSwitcher} role="tablist" aria-label="View">
            {HUB_LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={hubLayout === l.id}
                className={`${styles.layoutBtn} ${hubLayout === l.id ? styles.layoutBtnActive : ""}`}
                onClick={() => changeHubLayout(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className={styles.loadingState}>Loading tournaments…</div>}
        {error && !loading && <div className={styles.errorState}>{error}</div>}

        {!loading && !error && (
          <>
            {hubLayout === "gallery" ? (
              <div className={styles.hubGallery}>
                {filteredRows.map((t) => {
                  const meta = hubStatusMeta(t.hubStatus);
                  const cardStatusClass =
                    t.hubStatus === "completed"
                      ? styles.hgCardCompleted
                      : t.hubStatus === "active"
                        ? styles.hgCardLive
                        : t.hubStatus === "upcoming"
                          ? styles.hgCardUpcoming
                          : styles.hgCardDraft;
                  const bannerClass =
                    t.hubStatus === "active"
                      ? styles.hgBannerLive
                      : t.hubStatus === "upcoming"
                        ? styles.hgBannerUpcoming
                        : t.hubStatus === "completed"
                          ? styles.hgBannerCompleted
                          : styles.hgBannerDraft;

                  return (
                    <div
                      key={t.id}
                      className={`${styles.hgCard} ${cardStatusClass} ${
                        t.hubStatus === "completed" ? styles.hgCardCompletedBorder : ""
                      }`}
                      onClick={() => handleRowClick(t)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRowClick(t);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className={
                          t.tournamentTumbnail
                            ? styles.hgBanner
                            : `${styles.hgBanner} ${styles.hgBannerPlaceholder} ${bannerClass}`
                        }
                        style={
                          t.tournamentTumbnail
                            ? { backgroundImage: `url(${t.tournamentTumbnail})` }
                            : undefined
                        }
                      >
                        {!t.tournamentTumbnail ? (
                          <span className={styles.hgBannerInitials}>
                            {tournamentInitials(t.name)}
                          </span>
                        ) : null}
                        <span className={`pill ${meta.pill} ${styles.hgStatusPill}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className={styles.hgBody}>
                        <div className={styles.hgName}>{t.name}</div>
                        <div className={styles.hgFacility}>
                          📍 {tournamentLocationLabel(t)}
                        </div>
                        <div className={styles.hgDates}>
                          {formatTournamentDates(t.startDate, t.endDate)}
                        </div>
                        <div className={styles.hgDates}>
                          {t.players > 0 ? `${t.players} players` : "— players"} ·{" "}
                          {t.revenue > 0 ? formatRevenue(t.revenue) : "— revenue"} ·{" "}
                          {t.divisions ?? 0} divs
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {hubLayout === "compact" ? (
              <div className={styles.hubCompact}>
                {filteredRows.map((t) => {
                  const meta = hubStatusMeta(t.hubStatus);
                  const rowClass =
                    t.hubStatus === "active"
                      ? styles.hcRowLive
                      : t.hubStatus === "upcoming"
                        ? styles.hcRowUpcoming
                        : t.hubStatus === "completed"
                          ? styles.hcRowCompleted
                          : styles.hcRowDraft;

                  return (
                    <div
                      key={t.id}
                      className={`${styles.hcRow} ${rowClass} ${
                        t.hubStatus === "completed" ? styles.hcRowCompleted : ""
                      }`}
                      onClick={() => handleRowClick(t)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRowClick(t);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles.hcDot} />
                      <div className={styles.hcName}>
                        {t.name}
                        <span className={styles.hcStatus}>{meta.label}</span>
                      </div>
                      <div className={styles.hcLoc}>{tournamentLocationLabel(t)}</div>
                      <div className={styles.hcDates}>
                        {formatTournamentDates(t.startDate, t.endDate)}
                      </div>
                      <div
                        className={`${styles.hcNum} ${t.players > 0 ? "" : styles.hcNumMuted}`}
                      >
                        {t.players > 0 ? t.players : "—"}
                      </div>
                      <div
                        className={`${styles.hcNum} ${t.revenue > 0 ? "" : styles.hcNumMuted}`}
                      >
                        {t.revenue > 0 ? formatRevenue(t.revenue) : "—"}
                      </div>
                      <button
                        type="button"
                        className={styles.hcAction}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(t);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {hubLayout === "table" ? (
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
            ) : null}

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
        editTournamentId={editTournamentId}
        onClose={closeWizard}
        onCreated={async () => {
          setFilter("all");
          await loadTournaments();
        }}
      />

      <DeleteTournamentConfirmModal
        open={Boolean(pendingDelete)}
        tournament={pendingDelete}
        deleting={deleting}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
