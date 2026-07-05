"use client";

import { useState } from "react";
import styles from "../teams.module.css";

export default function ForfeitModal({ open, teamName, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");

  if (!open) return null;

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
            <div className={styles.modalTitle}>Mark as forfeit</div>
            <div className={styles.modalSubtitle}>{teamName}</div>
          </div>
        </div>
        <div className={styles.modalBody}>
          <label className="form-label">Reason (optional)</label>
          <input
            className="form-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="No-show, injury, etc."
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
              onClick={() => onConfirm(reason.trim())}
            >
              Mark Forfeit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
