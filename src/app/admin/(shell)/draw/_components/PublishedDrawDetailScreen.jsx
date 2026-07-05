"use client";

import Link from "next/link";
import styles from "../draw.module.css";
import BracketPreview from "../../draw/_components/BracketPreview";
import DrawDivisionDetail from "./DrawDivisionDetail";
import PublishDrawConfirmModal from "./PublishDrawConfirmModal";
import { formatShortDate, formatTime12 } from "@/lib/drawUi";
import { tournamentAdminPath } from "@/lib/tournaments";
import { useDrawState } from "./useDrawState";
import { useState } from "react";

export default function PublishedDrawDetailScreen({ tournamentId, divisionId }) {
  const { rows, loading, error, actionMessage, unpublishDraw, getRowById } =
    useDrawState(tournamentId);
  const [confirm, setConfirm] = useState(false);

  const row = getRowById(divisionId);

  if (!tournamentId) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateTitle}>Select a tournament</div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, color: "var(--text-sec)" }}>Loading…</div>;
  }

  if (!row || row.drawStatus !== "published") {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateTitle}>Division not found or not published</div>
        <Link
          href={tournamentAdminPath("/admin/published", tournamentId)}
          className="btn btn-ghost btn-md"
          style={{ marginTop: 16 }}
        >
          ← Back to Published Draws
        </Link>
      </div>
    );
  }

  const subParts = [
    <span key="pill" className="pill pill-done">
      ✓ Published
    </span>,
    <strong key="fmt">{row.format}</strong>,
  ];
  if (row.startDate) subParts.push(`🗓 ${formatShortDate(row.startDate)}`);
  if (row.startTime) subParts.push(`🕐 ${formatTime12(row.startTime)}`);
  subParts.push(`${row.players}/${row.max} ${row.entryWord}`);

  return (
    <div className={`screen active ${styles.drawPage}`} id="screen-published-detail">
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Link
              href={tournamentAdminPath("/admin/published", tournamentId)}
              className="btn btn-ghost btn-sm"
              style={{ padding: "4px 10px", fontSize: 12 }}
            >
              ← Back to Published Draws
            </Link>
          </div>
          <div className="page-eyebrow">Phase 3 · Draw & Schedule</div>
          <div className="page-title">{row.name}</div>
          <div
            className="page-sub"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              fontSize: 12,
              color: "var(--text-sec)",
            }}
          >
            {subParts.map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </div>
        </div>
        <div className="page-actions">
          <Link
            href={tournamentAdminPath("/admin/divisions", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            ⚙️ Edit Settings
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-md"
            style={{ color: "var(--text-sec)" }}
            onClick={() => setConfirm(true)}
          >
            🔓 Unpublish
          </button>
        </div>
      </div>

      <div className="content">
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        {actionMessage ? (
          <div
            className={styles.errorBanner}
            style={{
              background: "rgba(91, 140, 255, 0.1)",
              borderColor: "rgba(91, 140, 255, 0.35)",
              color: "#9bb8ff",
            }}
          >
            {actionMessage}
          </div>
        ) : null}

        <div className={styles.lockedBanner}>
          <div
            className={styles.lockedStripe}
            style={{ background: row.color }}
            aria-hidden
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "var(--text-ter)",
                marginBottom: 2,
              }}
            >
              Locked Bracket
            </div>
            <div style={{ fontSize: 13, color: "var(--text-sec)" }}>
              Roster, seeds and matchups are locked. Unpublish to make changes.
            </div>
          </div>
        </div>

        <DrawDivisionDetail row={row} tournamentId={tournamentId} locked />
        {row.bracket?.generated ? (
          <BracketPreview row={row} locked />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateSub}>Bracket data not available</div>
          </div>
        )}
      </div>

      <PublishDrawConfirmModal
        open={confirm}
        mode="unpublish"
        divisionName={row.name}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          await unpublishDraw(row);
          setConfirm(false);
        }}
      />
    </div>
  );
}
