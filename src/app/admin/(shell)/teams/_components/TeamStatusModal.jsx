"use client";

import styles from "../teams.module.css";

const STATUSES = [
  { id: "confirmed", label: "Confirmed" },
  { id: "pending", label: "Pending" },
  { id: "waitlist", label: "Waitlist" },
  { id: "late", label: "Late add" },
];

export default function TeamStatusModal({ open, teamName, current, onCancel, onConfirm }) {
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
            <div className={styles.modalTitle}>Set team status</div>
            <div className={styles.modalSubtitle}>{teamName}</div>
          </div>
        </div>
        <div className={styles.modalBody}>
          {STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`btn ${current === s.id ? "btn-primary" : "btn-ghost"} btn-md`}
              style={{ marginRight: 8, marginBottom: 8 }}
              onClick={() => onConfirm(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className={styles.modalFooter}>
          <div />
          <button type="button" className="btn btn-ghost btn-md" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
