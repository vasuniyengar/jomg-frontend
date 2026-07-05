"use client";

import Link from "next/link";
import styles from "../draw.module.css";
import {
  applyDrawFilters,
  applyPublishedFilters,
  formatShortDate,
  getDrawDays,
  getDrawStatusCounts,
  sortDrawDivisions,
} from "@/lib/drawUi";
import { tournamentAdminPath } from "@/lib/tournaments";

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.filterChip}${active ? ` ${styles.filterChipActive}` : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function DrawFilterBar({
  rows,
  mode = "generate",
  filterDay,
  filterStatus,
  onFilterDay,
  onFilterStatus,
  tournamentId,
}) {
  const sorted = sortDrawDivisions(rows);

  if (mode === "published") {
    const pubRows = sorted.filter((d) => d.drawStatus === "published");
    const days = getDrawDays(pubRows, (d) => d.drawStatus === "published");
    const filtered = applyPublishedFilters(pubRows, filterDay);

    return (
      <div className={styles.filterBar}>
        <div className={styles.filterLabel}>Filter by day</div>
        <div className={styles.filterChips}>
          <Chip label="All days" active={filterDay === "all"} onClick={() => onFilterDay("all")} />
          {days.map((d) => (
            <Chip
              key={d}
              label={formatShortDate(d)}
              active={filterDay === d}
              onClick={() => onFilterDay(d)}
            />
          ))}
          {days.length === 0 ? (
            <span style={{ fontSize: 11, color: "var(--text-ter)", fontStyle: "italic" }}>
              No published divisions yet
            </span>
          ) : null}
        </div>
        <span className={styles.filterCount}>
          Showing {filtered.length} of {pubRows.length} published
        </span>
      </div>
    );
  }

  const days = getDrawDays(sorted, (d) => d.drawStatus !== "published");
  const counts = getDrawStatusCounts(sorted);
  const filtered = applyDrawFilters(sorted, { filterDay, filterStatus });
  const unpublishedTotal = rows.length - counts.published;

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterLabel}>Filter</div>
      <div className={styles.filterChips}>
        <Chip label="All days" active={filterDay === "all"} onClick={() => onFilterDay("all")} />
        {days.map((d) => (
          <Chip
            key={d}
            label={formatShortDate(d)}
            active={filterDay === d}
            onClick={() => onFilterDay(d)}
          />
        ))}
        {days.length === 0 ? (
          <span style={{ fontSize: 11, color: "var(--text-ter)", fontStyle: "italic" }}>
            No unpublished divisions
          </span>
        ) : null}
      </div>
      <div className={styles.filterDivider} aria-hidden />
      <div className={styles.filterChips}>
        <Chip
          label={`All (${counts.all})`}
          active={filterStatus === "all"}
          onClick={() => onFilterStatus("all")}
        />
        <Chip
          label={`Ready (${counts.ready})`}
          active={filterStatus === "ready"}
          onClick={() => onFilterStatus("ready")}
        />
        <Chip
          label={`Draft (${counts.draft})`}
          active={filterStatus === "draft"}
          onClick={() => onFilterStatus("draft")}
        />
        <Chip
          label={`Not ready (${counts.blocked})`}
          active={filterStatus === "blocked"}
          onClick={() => onFilterStatus("blocked")}
        />
        {counts.published > 0 ? (
          <Link
            href={tournamentAdminPath("/admin/published", tournamentId)}
            className={styles.publishedNavChip}
          >
            Published ({counts.published}) <span style={{ fontSize: 10 }}>→</span>
          </Link>
        ) : null}
      </div>
      <span className={styles.filterCount}>
        Showing {filtered.length} of {unpublishedTotal} unpublished division
        {unpublishedTotal !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

export { applyDrawFilters, applyPublishedFilters, sortDrawDivisions };
