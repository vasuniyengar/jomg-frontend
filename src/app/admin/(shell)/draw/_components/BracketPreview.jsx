"use client";

import { useState } from "react";
import styles from "../draw.module.css";

export default function BracketPreview({ row, locked = false, busy = false, onRegenerate, onDelete }) {
  const b = row.bracket;
  const [viewMode, setViewMode] = useState("pool");

  if (!b?.generated) return null;

  // Group matches by round
  const byRound = {};
  for (const pool of b.pools) {
    for (const m of pool.matches) {
      if (!byRound[m.round]) byRound[m.round] = [];
      byRound[m.round].push({ ...m, poolName: pool.poolName || `Pool ${pool.poolNum}` });
    }
  }
  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);

  // Count distinct pools per round for the subtitle
  const poolsPerRound = (roundMatches) =>
    new Set(roundMatches.map((m) => m.poolName)).size;

  const handleDelete = () => {
    if (busy) return;
    const confirmed = window.confirm(
      "Delete this round robin? This will permanently remove all pools, rounds, and matches. This cannot be undone."
    );
    if (confirmed && onDelete) {
      onDelete();
    }
  };

  return (
    <div>
      {/* ── Header bar ── */}
      <div className={styles.bracketHeader}>
        <div>
          <div className={styles.bracketHeaderTitle}>
            {b.pools.length} pool{b.pools.length !== 1 ? "s" : ""} · {b.totalMatches} total matches
          </div>
          <div className={styles.bracketHeaderSub}>
            Round-robin within each pool, top {row.teamsAdvance || 2} advance
          </div>
        </div>
        <div className={styles.bracketHeaderActions}>
          {/* View toggle */}
          <div
            style={{
              display: "inline-flex",
              borderRadius: 6,
              border: "1px solid var(--border, rgba(255,255,255,0.1))",
              overflow: "hidden",
            }}
          >
            {["pool", "round"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "var(--font-display, inherit)",
                  letterSpacing: "0.03em",
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === mode ? "var(--primary, #5b8cff)" : "transparent",
                  color: viewMode === mode ? "#fff" : "var(--text-sec, rgba(255,255,255,0.5))",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                By {mode === "pool" ? "Pool" : "Round"}
              </button>
            ))}
          </div>

          {!locked && onRegenerate ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={busy}
              onClick={onRegenerate}
            >
              {busy ? "Regenerating…" : "↻ Regenerate"}
            </button>
          ) : null}
          {!locked && onDelete ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={busy}
              onClick={handleDelete}
              style={{ color: "var(--danger, #ff5b5b)" }}
            >
              {busy ? "Deleting…" : "✕ Delete"}
            </button>
          ) : null}
          {locked ? (
            <span style={{ fontSize: 11, color: "var(--text-ter)", padding: "6px 0" }}>
              Locked — Unpublish to edit
            </span>
          ) : null}
        </div>
      </div>

      {/* ── By Pool view (original table layout) ── */}
      {viewMode === "pool" ? (
        <div className={styles.poolCardList}>
          {b.pools.map((pool) => (
            <div key={pool.poolNum} className={styles.poolCard}>
              <div className={styles.poolCardHeader}>
                <div className={styles.poolCardTitle}>{pool.poolName || `Pool ${pool.poolNum}`}</div>
                <div className={styles.poolTeamTags}>
                  {pool.teams.map((t) => (
                    <span key={t.id} className={styles.poolTeamTag}>
                      <strong style={{ fontFamily: "var(--font-display)", fontSize: 10, color: "var(--text-ter)" }}>
                        #{t.seed}
                      </strong>
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
              <table className={styles.poolMatchTable}>
                <thead>
                  <tr>
                    <th>Match</th>
                    <th>Round</th>
                    <th>Home</th>
                    <th>Away</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pool.matches.map((m) => (
                    <tr key={m.id}>
                      <td style={{ color: "var(--text-ter)", fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700 }}>
                        M{m.matchNumInPool}
                      </td>
                      <td style={{ color: "var(--text-sec)" }}>R{m.round}</td>
                      <td style={{ fontWeight: 600 }}>{m.home}</td>
                      <td style={{ fontWeight: 600 }}>{m.away}</td>
                      <td style={{ fontSize: 11, color: "var(--text-ter)" }}>Pending</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        /* ── By Round view ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {rounds.map((round) => {
            const matches = byRound[round];
            const numPools = poolsPerRound(matches);
            return (
              <div
                key={round}
                style={{
                  borderRadius: 8,
                  border: "1px solid var(--border, rgba(255,255,255,0.08))",
                  overflow: "hidden",
                }}
              >
                {/* Round header */}
                <div
                  style={{
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    borderBottom: "1px solid var(--border, rgba(255,255,255,0.08))",
                    background: "var(--surface-raised, rgba(255,255,255,0.03))",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display, inherit)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--text)",
                    }}
                  >
                    Round {round}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-ter)" }}>
                    {matches.length} simultaneous match{matches.length !== 1 ? "es" : ""} across {numPools} pool{numPools !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Match cards row — scrollable when matches overflow */}
                <div style={{ overflowX: "auto" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${matches.length}, minmax(180px, 1fr))`,
                      gap: 0,
                      minWidth: `${matches.length * 180}px`,
                    }}
                  >
                    {matches.map((m, i) => (
                      <div
                        key={m.id}
                        style={{
                          padding: "12px 14px",
                          borderRight:
                            i < matches.length - 1
                              ? "1px solid var(--border, rgba(255,255,255,0.08))"
                              : "none",
                        }}
                      >
                        {/* Pool · Match eyebrow */}
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "var(--text-ter)",
                            fontFamily: "var(--font-display, inherit)",
                            marginBottom: 8,
                          }}
                        >
                          {m.poolName} · Match {m.matchNumInPool}
                        </div>

                        {/* Home team */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--text-ter)",
                              fontFamily: "var(--font-display, inherit)",
                              minWidth: 18,
                            }}
                          >
                            #{m.homeSeed ?? ""}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                            {m.home}
                          </span>
                        </div>

                        {/* vs */}
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text-ter)",
                            paddingLeft: 24,
                            marginBottom: 4,
                            fontStyle: "italic",
                          }}
                        >
                          vs
                        </div>

                        {/* Away team */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--text-ter)",
                              fontFamily: "var(--font-display, inherit)",
                              minWidth: 18,
                            }}
                          >
                            #{m.awaySeed ?? ""}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                            {m.away}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}