"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../teams.module.css";
import { fetchRegisteredPlayers } from "@/lib/divisions";
import { mapRegistrationToCandidate } from "@/lib/teamsUi";

export default function AddTeamModal({
  open,
  row,
  tournamentId,
  existingTeams,
  onClose,
  onAdd,
}) {
  const [selection, setSelection] = useState([]);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isDoubles = row?.type === "Doubles" || row?.type === "Mixed Doubles";
  const isMlp = row?.type === "MLP";
  const slotCount = isMlp ? 6 : isDoubles ? 2 : 1;

  const usedPlayerIds = useMemo(() => {
    const ids = new Set();
    (existingTeams || []).forEach((t) => {
      (t.players || []).forEach((p) => ids.add(p.id));
    });
    selection.forEach((p) => ids.add(p.id));
    return ids;
  }, [existingTeams, selection]);

  useEffect(() => {
    if (!open) {
      setSelection([]);
      setSearch("");
      setSubmitError("");
      setSubmitting(false);
      return;
    }
    if (!tournamentId || !row?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const players = await fetchRegisteredPlayers(tournamentId);
        if (cancelled) return;
        const mapped = players
          .filter((p) =>
            (p.events || []).some((e) => String(e.bracketId) === String(row.id))
          )
          .map((p) => mapRegistrationToCandidate(p, row.id));
        setCandidates(mapped);
      } catch {
        if (!cancelled) setCandidates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, tournamentId, row?.id]);

  if (!open || !row) return null;

  const filtered = candidates.filter((p) => {
    if (usedPlayerIds.has(p.id) && !selection.find((s) => s.id === p.id)) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || String(p.dupr).includes(q);
  });

  const pick = (player) => {
    if (selection.find((s) => s.id === player.id)) return;
    if (selection.length >= slotCount) return;
    setSelection((prev) => [...prev, player]);
  };

  const removeSlot = (idx) => {
    setSelection((prev) => prev.filter((_, i) => i !== idx));
  };

  const canAdd = isMlp
    ? selection.filter((p) => p.gender === "M").length >= 2 &&
      selection.filter((p) => p.gender === "F").length >= 2
    : isDoubles
      ? selection.length === 2
      : selection.length === 1;

  const commit = async (partnerNeeded = false) => {
    if ((!canAdd && !partnerNeeded) || submitting) return;
    const players = partnerNeeded ? selection.slice(0, 1) : [...selection];
    const playerIds = players.map((p) => p.playerId || p.id);
    setSubmitting(true);
    setSubmitError("");
    try {
      await onAdd({ playerIds, partnerNeeded });
      setSelection([]);
      setSearch("");
      onClose();
    } catch (err) {
      setSubmitError(err.message || "Failed to add team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>Add Team</div>
            <div className={styles.modalSubtitle}>
              {isMlp
                ? `Build a roster for ${row.name}`
                : isDoubles
                  ? `Pick players for ${row.name}`
                  : `Pick a player for ${row.name}`}
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.selectionTray}>
          <div className={styles.sectionEyebrow}>Selected</div>
          <div className={styles.selectionSlots}>
            {Array.from({ length: slotCount }, (_, i) => {
              const p = selection[i];
              const label = isMlp ? `Roster ${i + 1}` : isDoubles ? (i === 0 ? "Player" : "Partner") : "Player";
              if (p) {
                return (
                  <div key={i} className={styles.selectionSlot}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary-text)", textTransform: "uppercase" }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-sec)" }}>
                        DUPR: {p.dupr ? p.dupr.toFixed(3) : "—"}
                      </div>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSlot(i)}>
                      ✕
                    </button>
                  </div>
                );
              }
              return (
                <div key={i} className={styles.selectionSlotEmpty}>
                  {label} — search & pick below
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
          <input
            className="form-input"
            placeholder="Search players by name or DUPR…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: 13 }}
          />
          <div style={{ fontSize: 11, color: "var(--text-sec)", marginTop: 8 }}>
            {loading ? "Loading…" : `${filtered.length} eligible player(s)`}
          </div>
        </div>

        <div className={styles.candidateList}>
          {filtered.map((p) => (
            <div key={p.id} className={styles.candidateRow} onClick={() => pick(p)}>
              <div>
                <div className={styles.candidateName}>{p.name}</div>
                <div className={styles.candidateMeta}>
                  DUPR {p.dupr ? p.dupr.toFixed(2) : "—"} · {p.gender === "F" ? "Female" : "Male"}
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm">
                + Pick
              </button>
            </div>
          ))}
        </div>

        <div className={styles.modalFooter}>
          {submitError ? (
            <span style={{ fontSize: 11, color: "var(--danger-text, #e55)" }}>{submitError}</span>
          ) : (
            <span style={{ fontSize: 11, color: "var(--text-sec)" }}>
              {selection.length} selected
            </span>
          )}
          <div className={styles.modalFooterActions}>
            <button
              type="button"
              className="btn btn-ghost btn-md"
              disabled={submitting}
              onClick={onClose}
            >
              Cancel
            </button>
            {isDoubles && selection.length === 1 ? (
              <button
                type="button"
                className="btn btn-ghost btn-md"
                disabled={submitting}
                onClick={() => commit(true)}
              >
                {submitting ? "Adding…" : "Add — Needs Partner"}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-primary btn-md"
              disabled={!canAdd || submitting}
              onClick={() => commit(false)}
            >
              {submitting ? "Adding…" : "Add Team"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
