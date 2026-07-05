"use client";

import { useEffect, useState } from "react";
import styles from "../teams.module.css";
import { fetchRegisteredPlayers } from "@/lib/divisions";
import { mapRegistrationToCandidate } from "@/lib/teamsUi";

export default function RosterEditModal({
  open,
  team,
  row,
  tournamentId,
  onClose,
  onSave,
}) {
  const [slots, setSlots] = useState([]);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && team) {
      setSlots([...(team.players || []), ...(team.subs || [])]);
    } else if (!open) {
      setSlots([]);
      setSearch("");
    }
  }, [open, team]);

  useEffect(() => {
    if (!open || !tournamentId || !row?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const players = await fetchRegisteredPlayers(tournamentId);
        if (!cancelled) {
          setCandidates(players.map((p) => mapRegistrationToCandidate(p, row.id)));
        }
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

  if (!open || !team || !row) return null;

  const usedIds = new Set(slots.map((p) => p.id));
  const filtered = candidates.filter((p) => {
    if (usedIds.has(p.id)) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q);
  });

  const addPlayer = (p) => {
    if (slots.length >= 6) return;
    setSlots((prev) => [...prev, p]);
  };

  const removePlayer = (id) => {
    setSlots((prev) => prev.filter((p) => p.id !== id));
  };

  const men = slots.filter((p) => p.gender === "M").length;
  const women = slots.filter((p) => p.gender === "F").length;
  const canSave = men >= 2 && women >= 2;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`${styles.modalPanel} ${styles.modalPanelWide}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>Edit Roster</div>
            <div className={styles.modalSubtitle}>
              {team.customName || team.teamName} · {row.name}
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.sectionEyebrow}>Current Roster</div>
          {slots.map((p) => (
            <div key={p.id} className={styles.rosterSlot}>
              <span>
                {p.gender === "M" ? "♂" : "♀"} {p.name}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removePlayer(p.id)}>
                Remove
              </button>
            </div>
          ))}
          <div style={{ fontSize: 11, color: "var(--text-sec)", margin: "8px 0 14px" }}>
            {men} men · {women} women (need 2+ each)
          </div>
          <div className={styles.sectionEyebrow}>Add Player</div>
          <input
            className="form-input"
            placeholder="Search players…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div className={styles.candidateList} style={{ maxHeight: 200 }}>
            {filtered.slice(0, 20).map((p) => (
              <div key={p.id} className={styles.candidateRow} onClick={() => addPlayer(p)}>
                <span className={styles.candidateName}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <span style={{ fontSize: 12, color: "var(--text-sec)" }}>
            {slots.length}/6 players
          </span>
          <div className={styles.modalFooterActions}>
            <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-md"
              disabled={!canSave}
              onClick={() => {
                const starters = slots.slice(0, 4);
                const subs = slots.slice(4);
                onSave(team.id, starters, subs);
                onClose();
              }}
            >
              Save Roster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
