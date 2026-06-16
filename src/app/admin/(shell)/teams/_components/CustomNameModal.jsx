"use client";

import { useEffect, useState } from "react";
import styles from "../teams.module.css";

export default function CustomNameModal({ open, teamName, current, onCancel, onConfirm }) {
  const [value, setValue] = useState(current || "");

  useEffect(() => {
    if (open) setValue(current || "");
  }, [open, current]);

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
            <div className={styles.modalTitle}>Custom team name</div>
            <div className={styles.modalSubtitle}>{teamName}</div>
          </div>
        </div>
        <div className={styles.modalBody}>
          <input
            className="form-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Austin Aces"
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
              onClick={() => onConfirm(value.trim())}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
