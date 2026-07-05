"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import TournamentPicker from "../../_components/TournamentPicker";
import styles from "../draw.module.css";
import DrawDivisionRow from "./DrawDivisionRow";
import DrawFilterBar, {
  applyDrawFilters,
  sortDrawDivisions,
} from "./DrawFilterBar";
import DrawSummaryBanner from "./DrawSummaryBanner";
import PregenReviewModal from "./PregenReviewModal";
import PublishDrawConfirmModal from "./PublishDrawConfirmModal";
import { formatShortDate, getDrawStatusCounts } from "@/lib/drawUi";
import { tournamentAdminPath } from "@/lib/tournaments";
import { useDrawState } from "./useDrawState";

export default function GenerateDrawScreen({ tournamentId }) {
  const {
    rows,
    loading,
    error,
    actionMessage,
    rowErrors,
    isRowBusy,
    generateDraw,
    publishDraw,
    unpublishDraw,
    regenerateBracket,
    deleteBracket,
    generateAllReady,
    publishAllDrafts,
  } = useDrawState(tournamentId);

  const [filterDay, setFilterDay] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [pregenRow, setPregenRow] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [pregenSubmitting, setPregenSubmitting] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const counts = useMemo(() => getDrawStatusCounts(rows), [rows]);
  const filtered = useMemo(
    () => applyDrawFilters(sortDrawDivisions(rows), { filterDay, filterStatus }),
    [rows, filterDay, filterStatus]
  );

  let lastDay = null;

  if (!tournamentId) {
    return <TournamentPicker label="Generate Draw" />;
  }

  const handleGenerate = (row) => setPregenRow(row);

  const confirmPregen = async () => {
    if (!pregenRow) return;
    setPregenSubmitting(true);
    try {
      await generateDraw(pregenRow);
      setExpandedId(pregenRow.id);
      setPregenRow(null);
    } catch {
      /* row error surfaced via useDrawState */
    } finally {
      setPregenSubmitting(false);
    }
  };

  const handleBulkGenerate = async () => {
    setBulkBusy(true);
    try {
      await generateAllReady();
    } finally {
      setBulkBusy(false);
    }
  };

  const renderPageActions = () => {
    const els = [];
    if (counts.ready > 0) {
      els.push(
        <button
          key="gen-all"
          type="button"
          className="btn btn-ghost btn-md"
          disabled={bulkBusy}
          onClick={handleBulkGenerate}
        >
          {bulkBusy ? "Generating…" : `🎯 Generate All Ready (${counts.ready})`}
        </button>
      );
    }
    if (counts.draft > 0) {
      els.push(
        <button
          key="pub-all"
          type="button"
          className="btn btn-primary btn-md"
          onClick={() =>
            setConfirm({
              mode: "bulkPublish",
              names: rows.filter((r) => r.drawStatus === "draft").map((r) => r.name),
            })
          }
        >
          Publish All Drafts ({counts.draft}) →
        </button>
      );
    }
    if (!els.length) {
      return (
        <Link
          href={tournamentAdminPath("/admin/divisions", tournamentId)}
          className="btn btn-ghost btn-md"
        >
          ⚙️ Manage Divisions
        </Link>
      );
    }
    return els;
  };

  return (
    <div className={`screen active ${styles.drawPage}`} id="screen-draw">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 3 · Draw & Schedule</div>
          <div className="page-title">Generate Draw</div>
          <div className="page-sub">
            One row per division · format & seeding inherited from{" "}
            <Link
              href={tournamentAdminPath("/admin/divisions", tournamentId)}
              style={{
                color: "var(--primary-text)",
                textDecoration: "none",
                borderBottom: "1px dotted var(--primary-border)",
              }}
            >
              Manage Divisions
            </Link>
            {" · teams from "}
            <Link
              href={tournamentAdminPath("/admin/teams", tournamentId)}
              style={{
                color: "var(--primary-text)",
                textDecoration: "none",
                borderBottom: "1px dotted var(--primary-border)",
              }}
            >
              Manage Teams
            </Link>
          </div>
        </div>
        <div className="page-actions">{renderPageActions()}</div>
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
          <div style={{ padding: 24, color: "var(--text-sec)" }}>Loading divisions…</div>
        ) : (
          <>
            <DrawSummaryBanner rows={rows} tournamentId={tournamentId} />
            <DrawFilterBar
              rows={rows}
              mode="generate"
              filterDay={filterDay}
              filterStatus={filterStatus}
              onFilterDay={setFilterDay}
              onFilterStatus={setFilterStatus}
              tournamentId={tournamentId}
            />

            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🎯</div>
                <div className={styles.emptyStateTitle}>No divisions match your filter</div>
                <div className={styles.emptyStateSub}>
                  Adjust the filter chips above to see more
                </div>
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
                      expanded={expandedId === row.id}
                      busy={isRowBusy(row.id)}
                      rowError={rowErrors[row.id]}
                      onToggle={(id) =>
                        setExpandedId((prev) => (prev === id ? null : id))
                      }
                      tournamentId={tournamentId}
                      mode="generate"
                      onGenerate={handleGenerate}
                      onPublish={(r) => setConfirm({ mode: "publish", row: r })}
                      onPreview={(r) => setExpandedId(r.id)}
                      onRegenerate={regenerateBracket}
                      onDelete={deleteBracket}
                    />
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <PregenReviewModal
        open={Boolean(pregenRow)}
        divisionName={pregenRow?.name}
        submitting={pregenSubmitting}
        onCancel={() => {
          if (!pregenSubmitting) setPregenRow(null);
        }}
        onConfirm={confirmPregen}
      />

      <PublishDrawConfirmModal
        open={Boolean(confirm)}
        mode={confirm?.mode || "publish"}
        divisionName={confirm?.row?.name}
        divisionNames={confirm?.names || []}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm?.mode === "bulkPublish") await publishAllDrafts();
          else if (confirm?.mode === "unpublish" && confirm.row) await unpublishDraw(confirm.row);
          else if (confirm?.row) await publishDraw(confirm.row);
          setConfirm(null);
        }}
      />
    </div>
  );
}