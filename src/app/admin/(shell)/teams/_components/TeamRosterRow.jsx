"use client";

import styles from "../teams.module.css";
import { teamDisplayName, teamStatusPillMeta } from "@/lib/teamsUi";
import TeamActionMenu from "./TeamActionMenu";

function StatusPill({ status }) {
  const meta = teamStatusPillMeta(status);
  if (!meta || status === "confirmed") return null;
  return <span className={`${styles.statusPill} ${styles[meta.cls]}`}>{meta.label}</span>;
}

function PlayerLine({ team, row, inactive }) {
  const isDoubles = row.type === "Doubles" || row.type === "Mixed Doubles";
  const nameColor = inactive ? "var(--text-sec)" : "var(--text)";
  const displayName = teamDisplayName(team);

  if (displayName) {
    return (
      <>
        <div className={styles.teamTitle} style={{ color: nameColor }}>
          <span>{displayName}</span>
          <StatusPill status={team.status} />
        </div>
        <div className={styles.teamSub}>
          {team.players.map((p, i) => (
            <span key={p.id}>
              {i > 0 ? " · " : ""}
              {p.name}
              {p.dupr ? ` (${p.dupr.toFixed(2)})` : ""}
            </span>
          ))}
          {isDoubles && team.partnerNeeded ? (
            <span style={{ fontStyle: "italic", color: "#fbbf24", fontWeight: 600 }}>
              {" "}
              · Needs partner
            </span>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.teamTitle} style={{ color: nameColor }}>
        {team.players[0] ? (
          <span>{team.players[0].name}</span>
        ) : (
          <span>Empty team</span>
        )}
        {team.players[1] ? (
          <>
            <span style={{ color: "var(--text-ter)", fontWeight: 400 }}>/</span>
            <span>{team.players[1].name}</span>
          </>
        ) : isDoubles && team.partnerNeeded ? (
          <>
            <span style={{ color: "var(--text-ter)", fontWeight: 400 }}>/</span>
            <span style={{ fontStyle: "italic", color: "#fbbf24", fontWeight: 600 }}>
              Needs partner
            </span>
          </>
        ) : null}
        <StatusPill status={team.status} />
      </div>
      <div className={styles.teamSub}>
        {team.players.length >= 2 ? (
          <>
            Combined Rating: <strong>{team.combinedDupr?.toFixed(3)}</strong>
          </>
        ) : (
          <>
            DUPR: <strong>{team.players[0]?.dupr?.toFixed(3) || "—"}</strong>
          </>
        )}
        {team.status === "forfeited" && team.forfeitReason ? (
          <div style={{ marginTop: 4, color: "#ff8888" }}>
            Forfeit reason: {team.forfeitReason}
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function TeamRosterRow({
  team,
  row,
  locked,
  poolCount,
  menuOpen,
  onMenuToggle,
  onMenuClose,
  onPoolChange,
  menuHandlers,
}) {
  const inactive = team.status === "withdrawn" || team.status === "forfeited";
  const isPool = (row.format || "").toLowerCase().includes("pool");

  return (
    <div
      className={`${styles.rosterRow}${inactive ? ` ${styles.rosterRowInactive}` : ""}`}
      data-team-id={team.id}
    >
      <div className={styles.seedNum} style={{ color: inactive ? "var(--text-ter)" : undefined }}>
        {team.seed}
      </div>
      <div className={styles.dragHandle} title="Drag to re-seed">
        ⋮⋮
      </div>
      <div className={styles.teamMain}>
        <PlayerLine team={team} row={row} inactive={inactive} />
      </div>
      {isPool ? (
        <select
          className={`form-select ${styles.poolSelect}`}
          value={team.pool || ""}
          disabled={inactive || locked}
          onChange={(e) => onPoolChange(team.id, e.target.value)}
        >
          <option value="">— Pool —</option>
          {Array.from({ length: poolCount }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              Pool {p}
            </option>
          ))}
        </select>
      ) : (
        <div />
      )}
      <div className={styles.combinedRating}>
        <div
          className={styles.combinedVal}
          style={{ color: inactive ? "var(--text-sec)" : undefined }}
        >
          {(team.combinedDupr || 0).toFixed(2)}
        </div>
        <div className={styles.combinedLbl}>
          {team.players?.length > 1 ? "Combined" : "DUPR"}
        </div>
      </div>
      <TeamActionMenu
        team={team}
        row={row}
        locked={locked}
        open={menuOpen}
        onToggle={onMenuToggle}
        onClose={onMenuClose}
        {...menuHandlers}
      />
    </div>
  );
}
