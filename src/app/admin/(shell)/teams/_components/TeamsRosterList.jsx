"use client";

import { useState } from "react";
import styles from "../teams.module.css";
import TeamRosterRow from "./TeamRosterRow";

export default function TeamsRosterList({
  row,
  locked,
  busy,
  onGenerate,
  onAddTeam,
  onPoolChange,
  getMenuHandlers,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const teams = row?.teams || [];
  const isPool = (row?.format || "").toLowerCase().includes("pool");
  const requiredPools = isPool
    ? Math.max(1, Math.ceil(teams.length / (row.teamsPerPool || 4)))
    : 0;
  const poolCount = isPool ? requiredPools + 1 : 0;

  if (!teams.length) {
    return (
      <div className={styles.rosterCard} id="teams-roster-card">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <div className={styles.emptyTitle}>No teams in this division yet</div>
          <div className={styles.emptySub}>
            No teams yet. Teams from bulk upload appear here when rows include a team_name
            column. You can also generate from registrations or add manually.
          </div>
          <div className={styles.emptyActions}>
            <button
              type="button"
              className="btn btn-primary btn-md"
              disabled={busy}
              onClick={onGenerate}
            >
              {busy ? "Generating…" : "Generate from Registrations"}
            </button>
            <button type="button" className="btn btn-ghost btn-md" onClick={onAddTeam}>
              + Add First Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rosterCard} id="teams-roster-card">
      <div className={styles.rosterHead}>
        <div>Seed</div>
        <div />
        <div>Team</div>
        {isPool ? <div>Pool</div> : <div />}
        <div>Combined</div>
        <div />
      </div>
      {teams.map((team) => (
        <TeamRosterRow
          key={team.id}
          team={team}
          row={row}
          locked={locked}
          poolCount={poolCount}
          menuOpen={openMenuId === team.id}
          onMenuToggle={() =>
            setOpenMenuId((prev) => (prev === team.id ? null : team.id))
          }
          onMenuClose={() => setOpenMenuId(null)}
          onPoolChange={onPoolChange}
          menuHandlers={getMenuHandlers(team)}
        />
      ))}
    </div>
  );
}
