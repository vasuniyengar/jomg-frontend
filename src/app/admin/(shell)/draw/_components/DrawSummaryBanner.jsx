"use client";

import Link from "next/link";
import styles from "../draw.module.css";
import { tournamentAdminPath } from "@/lib/tournaments";
import { getDrawStatusCounts, validateDivisionForDraw } from "@/lib/drawUi";

export default function DrawSummaryBanner({ rows, variant = "generate", tournamentId }) {
  if (variant === "published") {
    const pubDivs = rows.filter((d) => d.drawStatus === "published");
    const totalSignups = pubDivs.reduce((s, d) => s + (d.players || 0), 0);
    let withIssues = 0;
    pubDivs.forEach((d) => {
      if (validateDivisionForDraw(d).warnings.length) withIssues++;
    });

    return (
      <div className={styles.overrideBanner}>
        <span className={styles.overrideDot} aria-hidden />
        <span className={styles.overrideLabel}>
          {pubDivs.length} Published Division{pubDivs.length === 1 ? "" : "s"} ·{" "}
          {totalSignups} total entrants
        </span>
        <span className={styles.overrideSub}>
          — brackets locked & visible to players
          {withIssues > 0 ? ` · ${withIssues} with advisories` : ""}
        </span>
      </div>
    );
  }

  const counts = getDrawStatusCounts(rows);
  const totalSignups = rows.reduce((s, d) => s + (d.players || 0), 0);
  const parts = [];
  if (counts.draft) parts.push(`${counts.draft} draft`);
  if (counts.ready) parts.push(`${counts.ready} ready`);
  if (counts.blocked) parts.push(`${counts.blocked} not ready`);

  return (
    <div className={styles.overrideBanner}>
      <span className={styles.overrideDot} aria-hidden />
      <span className={styles.overrideLabel}>
        {rows.length} Division{rows.length === 1 ? "" : "s"} · {totalSignups} total sign-ups
      </span>
      <span className={styles.overrideSub}>
        — {parts.length ? parts.join(" · ") : "no divisions to work on"} · division setup
        overrides draw setup
        {counts.published > 0 ? (
          <>
            {" · "}
            <Link
              href={tournamentAdminPath("/admin/published", tournamentId)}
              className={styles.publishedLink}
            >
              {counts.published} published →
            </Link>
          </>
        ) : null}
      </span>
    </div>
  );
}
