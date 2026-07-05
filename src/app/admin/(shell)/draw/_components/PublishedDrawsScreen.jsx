"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import TournamentPicker from "../../_components/TournamentPicker";
import styles from "../draw.module.css";
import DrawDivisionRow from "./DrawDivisionRow";
import DrawFilterBar, {
  applyPublishedFilters,
  sortDrawDivisions,
} from "./DrawFilterBar";
import DrawSummaryBanner from "./DrawSummaryBanner";
import PublishDrawConfirmModal from "./PublishDrawConfirmModal";
import { formatShortDate } from "@/lib/drawUi";
import { tournamentAdminPath } from "@/lib/tournaments";
import { useDrawState } from "./useDrawState";

export default function PublishedDrawsScreen({ tournamentId }) {
  const router = useRouter();
  const { rows, loading, error, actionMessage, unpublishDraw } = useDrawState(tournamentId);
  const [filterDay, setFilterDay] = useState("all");
  const [confirm, setConfirm] = useState(null);

  const published = useMemo(
    () => sortDrawDivisions(rows).filter((d) => d.poolStarted && d.drawStatus === "published"),
    [rows]
  );
  const filtered = useMemo(
    () => applyPublishedFilters(published, filterDay),
    [published, filterDay]
  );

  let lastDay = null;

  if (!tournamentId) {
    return <TournamentPicker label="Published Draws" />;
  }

  const openDetail = (row) => {
    router.push(
      tournamentAdminPath(
        `/admin/published/detail?divisionId=${row.id}`,
        tournamentId
      )
    );
  };

  return (
    <div className={`screen active ${styles.drawPage}`} id="screen-published">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 3 · Draw & Schedule</div>
          <div className="page-title">Published Draws</div>
          <div className="page-sub">
            Locked brackets visible to players · click <strong>View</strong> to see the
            full draw
          </div>
        </div>
        <div className="page-actions">
          <Link
            href={tournamentAdminPath("/admin/draw", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            ← Back to Generate Draw
          </Link>
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
        {loading ? (
          <div style={{ padding: 24, color: "var(--text-sec)" }}>Loading…</div>
        ) : (
          <>
            <DrawSummaryBanner rows={rows} variant="published" />
            <DrawFilterBar
              rows={rows}
              mode="published"
              filterDay={filterDay}
              onFilterDay={setFilterDay}
              tournamentId={tournamentId}
            />

            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  {published.length === 0 ? "✅" : "📅"}
                </div>
                <div className={styles.emptyStateTitle}>
                  {published.length === 0
                    ? "No published draws yet"
                    : "No published draws on this day"}
                </div>
                <div className={styles.emptyStateSub}>
                  {published.length === 0
                    ? "Go to Generate Draw to publish your first division"
                    : "Try a different day or All days"}
                </div>
                {published.length === 0 ? (
                  <Link
                    href={tournamentAdminPath("/admin/draw", tournamentId)}
                    className="btn btn-primary btn-md"
                  >
                    Open Generate Draw →
                  </Link>
                ) : null}
              </div>
            ) : (
              filtered.map((row) => {
                const dayHeader =
                  filterDay === "all" && row.startDate !== lastDay ? (
                    (() => {
                      lastDay = row.startDate;
                      return (
                        <div key={`day-${row.startDate || "none"}`} className={styles.dayHeader}>
                          <div className={styles.dayHeaderLabel}>
                            {row.startDate ? formatShortDate(row.startDate) : "No date set"}
                          </div>
                          <div className={styles.dayHeaderLine} />
                        </div>
                      );
                    })()
                  ) : null;

                return (
                  <div key={row.id}>
                    {dayHeader}
                    <DrawDivisionRow
                      row={row}
                      tournamentId={tournamentId}
                      mode="published"
                      onView={openDetail}
                      onUnpublish={(r) => setConfirm({ mode: "unpublish", row: r })}
                    />
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <PublishDrawConfirmModal
        open={Boolean(confirm)}
        mode="unpublish"
        divisionName={confirm?.row?.name}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm?.row) await unpublishDraw(confirm.row);
          setConfirm(null);
        }}
      />
    </div>
  );
}
