"use client";

import styles from "../draw.module.css";

export default function BracketPreview({ row, locked = false, busy = false, onRegenerate }) {
  const b = row.bracket;
  if (!b?.generated) return null;

  return (
    <div>
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
          {locked ? (
            <span style={{ fontSize: 11, color: "var(--text-ter)", padding: "6px 0" }}>
              Locked — Unpublish to edit
            </span>
          ) : null}
        </div>
      </div>
      <div className={styles.poolCardList}>
        {b.pools.map((pool) => (
          <div key={pool.poolNum} className={styles.poolCard}>
            <div className={styles.poolCardHeader}>
              <div className={styles.poolCardTitle}>{pool.poolName || `Pool ${pool.poolNum}`}</div>
              <div className={styles.poolTeamTags}>
                {pool.teams.map((t) => (
                  <span key={t.id} className={styles.poolTeamTag}>
                    <strong
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 10,
                        color: "var(--text-ter)",
                      }}
                    >
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
                    <td
                      style={{
                        color: "var(--text-ter)",
                        fontFamily: "var(--font-display)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
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
    </div>
  );
}
