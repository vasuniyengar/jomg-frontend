"use client";

import styles from "../divisions.module.css";
import { divisionAccentColor } from "@/lib/divisionForm";

export default function DeleteDivisionConfirmModal({
  open,
  division,
  divisionIndex = 0,
  deleting,
  onCancel,
  onConfirm,
}) {
  if (!open || !division) return null;

  const accent = divisionAccentColor(division, divisionIndex);
  const registered = division.registeredCount || 0;

  return (
    <div
      className={`${styles.modalOverlay} ${styles.confirmModalOverlay}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
    >
      <div
        className={`${styles.modalPanel} ${styles.confirmModalPanel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div
            className={styles.modalHeaderAccent}
            style={{ background: accent }}
            aria-hidden
          />
          <div className={styles.modalHeaderText}>
            <div className={styles.modalTitle}>Delete division?</div>
            <div className={styles.modalSubtitle}>{division.name}</div>
          </div>
        </div>

        <div className={styles.confirmModalBody}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            Delete <strong>{division.name}</strong>? This cannot be undone.
          </p>
          {registered > 0 ? (
            <p style={{ margin: "10px 0 0", fontSize: 13 }}>
              This division has {registered} registration
              {registered === 1 ? "" : "s"}.
            </p>
          ) : null}
        </div>

        <div className={styles.modalFooter}>
          <div />
          <div className={styles.modalFooterActions}>
            <button
              type="button"
              className="btn btn-ghost btn-md"
              disabled={deleting}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-md"
              disabled={deleting}
              onClick={onConfirm}
            >
              {deleting ? "Deleting…" : "Delete Division"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
