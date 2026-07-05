"use client";

import Link from "next/link";
import styles from "../draw.module.css";
import { drawFormatSummary, validateDivisionForDraw } from "@/lib/drawUi";
import { tournamentAdminPath } from "@/lib/tournaments";
import BracketPreview from "../../draw/_components/BracketPreview";

export default function DrawDivisionDetail({
  row,
  tournamentId,
  locked = false,
  busy = false,
  onRegenerate,
  onDelete,
  includeBracket = true,
  showEditLink = true,
}) {
  const v = validateDivisionForDraw(row);
  const isPool = row.format?.toLowerCase().includes("pool");

  return (
    <div>
      {showEditLink ? (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <Link
            href={tournamentAdminPath("/admin/divisions", tournamentId)}
            className="btn btn-ghost btn-sm"
            onClick={(e) => e.stopPropagation()}
          >
            ⚙️ Edit Settings
          </Link>
        </div>
      ) : null}

      <div className={styles.sectionEyebrow}>From Division Setup — read-only</div>
      <div className={styles.poolStatGrid}>
        <div className={styles.poolStat}>
          <div className={styles.poolStatLabel}>Format</div>
          <div className={`${styles.poolStatVal} ${styles.poolStatValSm}`}>{row.format}</div>
        </div>
        <div className={styles.poolStat}>
          <div className={styles.poolStatLabel}>Seeding</div>
          <div className={`${styles.poolStatVal} ${styles.poolStatValSm}`}>{row.seed}</div>
        </div>
        <div className={styles.poolStat}>
          <div className={styles.poolStatLabel}>Capacity</div>
          <div className={styles.poolStatVal}>{row.max || "—"}</div>
        </div>
        <div className={styles.poolStat}>
          <div className={styles.poolStatLabel}>Sign-ups</div>
          <div className={styles.poolStatVal}>{row.players || 0}</div>
        </div>
        {isPool ? (
          <>
            <div className={styles.poolStat}>
              <div className={styles.poolStatLabel}>Teams / Pool</div>
              <div className={styles.poolStatVal}>{row.teamsPerPool || 4}</div>
            </div>
            <div className={styles.poolStat}>
              <div className={styles.poolStatLabel}>Advance</div>
              <div className={styles.poolStatVal}>Top {row.teamsAdvance || 2}</div>
            </div>
          </>
        ) : null}
        <div className={styles.poolStat}>
          <div className={styles.poolStatLabel}>Game Guarantee</div>
          <div className={styles.poolStatVal}>{row.guar || 4}+</div>
        </div>
      </div>

      <div className={styles.drawPlan}>
        <div className={styles.sectionEyebrow} style={{ marginBottom: 6 }}>
          Draw Plan — computed from sign-ups
        </div>
        <div className={styles.drawPlanTitle}>{drawFormatSummary(row)}</div>
        {v.warnings.length > 0 ? (
          <div className={styles.issueTags} style={{ marginTop: 8 }}>
            {v.warnings.map((w) => (
              <span key={w} className={`${styles.issueTag} ${styles.issueWarning}`}>
                ℹ {w}
              </span>
            ))}
          </div>
        ) : null}
        {v.blockers.length > 0 ? (
          <div className={styles.issueTags} style={{ marginTop: 8 }}>
            {v.blockers.map((b) => (
              <span key={b} className={`${styles.issueTag} ${styles.issueBlocker}`}>
                ⚠ {b}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {includeBracket && row.drawStatus !== "none" && row.bracket?.generated ? (
        <BracketPreview
          row={row}
          locked={locked}
          busy={busy}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
        />
      ) : null}
    </div>
  );
}