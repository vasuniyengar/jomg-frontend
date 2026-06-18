"use client";

import { useState } from "react";
import styles from "../teams.module.css";

export default function MoveSeedModal({ open, team, maxSeed, onCancel, onConfirm }) {
  const [seed, setSeed] = useState(team?.seed || 1);

  if (!open || !team) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className={`${styles.modalPanel} ${styles.modalPanelSm}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>Move to seed</div>
            <div className={styles.modalSubtitle}>{team.customName || team.teamName}</div>
          </div>
        </div>
        <div className={styles.modalBody}>
          <label className="form-label">New seed (1–{maxSeed})</label>
          <input
            className="form-input"
            type="number"
            min={1}
            max={maxSeed}
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
          />
        </div>
        <div className={styles.modalFooter}>
          <div />
          <div className={styles.modalFooterActions}>
            <button type="button" className="btn btn-ghost btn-md" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={() => onConfirm(Math.max(1, Math.min(maxSeed, seed)))}
            >
              Move
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
