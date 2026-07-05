"use client";

import Link from "next/link";
import styles from "../teams.module.css";
import { getActiveTeamsForDraw, getOverflowTeamCount, validateTeamsForDraw } from "@/lib/teamsUi";
import { tournamentAdminPath } from "@/lib/tournaments";

export default function TeamsSummaryBanner({
  row,
  tournamentId,
  locked,
  busy,
  onUnpublish,
  onMoveOverflow,
}) {
  if (!row) return null;

  const teams = row.teams || [];
  const activeTeams = getActiveTeamsForDraw(teams);
  const activeCount = row.activeTeamCount ?? activeTeams.length;
  const isPool = (row.format || "").toLowerCase().includes("pool");
  const isLocked = locked ?? Boolean(row.poolStarted || row.drawStatus === "published");
  const v = validateTeamsForDraw(row, teams);
  const overflow = getOverflowTeamCount(row, teams);

  const subParts = [`${activeCount}/${row.max || 0} confirmed`];
  if (teams.length !== activeCount) {
    subParts.push(`${teams.length - activeCount} inactive`);
  }
  if (isPool) {
    const assigned = activeTeams.filter((t) => t.pool && t.status === "confirmed").length;
    subParts.push(`${assigned}/${activeCount} assigned to pools`);
  }
  if (isLocked) subParts.push("Bracket published — roster locked");
  else if (overflow > 0) {
    subParts.push(`${overflow} over capacity — move to waitlist`);
  } else if (v.blockers.length) subParts.push(`⚠ ${v.blockers[0]}`);

  const canContinue =
    !isLocked &&
    activeCount > 0 &&
    overflow === 0 &&
    v.ok &&
    (!isPool ||
      activeTeams.every(
        (t) => t.pool || t.status === "withdrawn" || t.status === "forfeited"
      ));

  return (
    <div className={styles.overrideBanner} id="teams-summary-banner">
      <span className={styles.overrideDot} aria-hidden />
      <span className={styles.overrideLabel}>
        {row.name} · {teams.length} team{teams.length !== 1 ? "s" : ""} · {row.format}
      </span>
      <span className={styles.overrideSub}> — {subParts.join(" · ")}</span>
      <div className={styles.bannerActions}>
        {isLocked ? (
          <>
            <Link
              href={tournamentAdminPath("/admin/published", tournamentId)}
              className="btn btn-primary btn-sm"
            >
              View Bracket →
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--text-sec)" }}
              onClick={onUnpublish}
            >
              Unpublish to edit
            </button>
          </>
        ) : (
          <>
            {overflow > 0 ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={busy}
                onClick={onMoveOverflow}
              >
                {busy ? "Updating…" : `Move ${overflow} to waitlist`}
              </button>
            ) : null}
            {canContinue ? (
              <Link
                href={tournamentAdminPath("/admin/draw", tournamentId)}
                className="btn btn-primary btn-sm"
              >
                Continue to Generate Draw →
              </Link>
            ) : (
              <span style={{ fontSize: 11, color: "var(--text-ter)" }}>
                Complete roster & pool assignment to continue
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
