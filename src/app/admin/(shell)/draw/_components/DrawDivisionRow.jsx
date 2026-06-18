"use client";

import styles from "../draw.module.css";
import {
  drawStatusLabel,
  formatTime12,
  validateDivisionForDraw,
} from "@/lib/drawUi";
import DrawDivisionDetail from "./DrawDivisionDetail";

export default function DrawDivisionRow({
  row,
  expanded,
  busy = false,
  rowError = "",
  onToggle,
  tournamentId,
  mode = "generate",
  onGenerate,
  onPublish,
  onPreview,
  onView,
  onUnpublish,
  onRegenerate,
  onDelete,
}) {
  const v = validateDivisionForDraw(row);
  const pct = row.max ? Math.min(100, Math.round(((row.players || 0) / row.max) * 100)) : 0;
  const status = drawStatusLabel(row);
  const pillClass =
    status.className === "pillDraft"
      ? `pill ${styles.pillDraft}`
      : status.className === "pillNotReady"
        ? `pill ${styles.pillNotReady}`
        : `pill ${status.className}`;

  const handleHeaderClick = () => {
    if (mode === "published" && onView) {
      onView(row);
      return;
    }
    onToggle?.(row.id);
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className={`${styles.expandCard}${expanded ? ` ${styles.expandCardOpen}` : ""}${
        mode === "published" ? ` ${styles.expandCardPublished}` : ""
      }`}
    >
      <div className={styles.expandHeader} onClick={handleHeaderClick}>
        <div className={styles.colorStripe} style={{ background: row.color }} aria-hidden />
        <div className={styles.rowMain}>
          <div className={styles.rowTitle}>
            {row.name}
            <span style={{ fontSize: 11, color: "var(--text-ter)", fontWeight: 500 }}>
              · {row.formatShort}
            </span>
            {row.startTime ? (
              <span className={styles.timeBadge}>🕐 {formatTime12(row.startTime)}</span>
            ) : null}
          </div>
          <div className={styles.rowMeta}>
            <strong style={{ color: "var(--text)" }}>{row.format}</strong>
            {" · Seed: "}
            {row.seed}
            {" · "}
            {row.players}/{row.max} {row.entryWord}
          </div>
          {v.blockers.length > 0 ? (
            <div className={styles.issueTags}>
              {v.blockers.map((b) => (
                <span key={b} className={`${styles.issueTag} ${styles.issueBlocker}`}>
                  ⚠ {b}
                </span>
              ))}
            </div>
          ) : v.warnings.length > 0 ? (
            <div className={styles.issueTags}>
              {v.warnings.map((w) => (
                <span key={w} className={`${styles.issueTag} ${styles.issueWarning}`}>
                  ℹ {w}
                </span>
              ))}
            </div>
          ) : null}
          {rowError ? (
            <div className={styles.issueTags}>
              <span className={`${styles.issueTag} ${styles.issueBlocker}`}>
                ⚠ {rowError}
              </span>
            </div>
          ) : null}
        </div>
        <div className={styles.rowAside}>
          <div className={styles.capacityCol}>
            <div className={styles.capacityNum}>
              {row.players}
              <span className={styles.capacityDenom}>/{row.max}</span>
            </div>
            <div className={`progress-bar ${styles.capacityBar}`}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className={pillClass}>
            {status.label === "Published" ? "✓ Published" : status.label}
          </span>
          <div className={styles.rowActions} onClick={stop}>
            {mode === "published" ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onView?.(row)}
                >
                  View →
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--text-sec)" }}
                  onClick={() => onUnpublish?.(row)}
                >
                  Unpublish
                </button>
              </>
            ) : row.drawStatus === "draft" ? (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={busy}
                  onClick={() => onPreview?.(row)}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                  onClick={() => onPublish?.(row)}
                >
                  Publish →
                </button>
              </>
            ) : v.ok ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={busy}
                onClick={() => onGenerate?.(row)}
              >
                {busy ? "Generating…" : "🎯 Generate"}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              >
                Generate
              </button>
            )}
          </div>
          {mode === "generate" ? (
            <span className={`${styles.chevron}${expanded ? ` ${styles.chevronOpen}` : ""}`}>
              ▾
            </span>
          ) : null}
        </div>
      </div>
      {mode === "generate" && expanded ? (
        <div className={styles.expandBody}>
          <DrawDivisionDetail
            row={row}
            tournamentId={tournamentId}
            busy={busy}
            onRegenerate={() => onRegenerate?.(row)}
            onDelete={() => onDelete?.(row)}
          />
        </div>
      ) : null}
    </div>
  );
}