"use client";

import Link from "next/link";
import styles from "../teams.module.css";
import { tournamentAdminPath } from "@/lib/tournaments";

export default function TeamsPageActions({
  row,
  tournamentId,
  locked,
  onAutoSuggestPools,
  onRandomize,
  onReseed,
  onAddTeam,
  onUnpublish,
}) {
  if (!row) return null;

  const isPool = (row.format || "").toLowerCase().includes("pool");

  if (locked) {
    return (
      <div className="page-actions">
        <Link
          href={tournamentAdminPath("/admin/published", tournamentId)}
          className="btn btn-ghost btn-md"
        >
          View Bracket →
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-md"
          style={{ color: "var(--text-sec)" }}
          onClick={onUnpublish}
        >
          Unpublish to edit
        </button>
      </div>
    );
  }

  return (
    <div className="page-actions">
      {isPool ? (
        <button type="button" className="btn btn-ghost btn-md" onClick={onAutoSuggestPools}>
          Auto-Suggest Pools
        </button>
      ) : null}
      <button type="button" className="btn btn-ghost btn-md" onClick={onRandomize}>
        Randomize Seeding
      </button>
      <button type="button" className="btn btn-ghost btn-md" onClick={onReseed}>
        Re-seed by DUPR
      </button>
      <button type="button" className="btn btn-primary btn-md" onClick={onAddTeam}>
        + Add Team
      </button>
    </div>
  );
}
