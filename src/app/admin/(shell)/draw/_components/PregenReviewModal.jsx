"use client";

import styles from "../draw.module.css";

export default function PregenReviewModal({
  open,
  divisionName,
  submitting = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <div
        className={`${styles.modalPanel} ${styles.modalPanelWide}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>Review roster before generating</div>
            <div className={styles.modalSubtitle}>
              All teams resolved in “{divisionName}”
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={submitting}
            onClick={onCancel}
          >
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ margin: "0 0 14px", lineHeight: 1.6 }}>
            Confirm the roster is ready before generating the bracket. Unresolved teams
            (waitlist, missing partners, etc.) would appear here in a future release.
          </p>
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--text-ter)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--primary-text)",
                marginBottom: 4,
              }}
            >
              All teams resolved
            </div>
            <div style={{ fontSize: 12 }}>Click Continue to generate the bracket</div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <span style={{ fontSize: 11, color: "var(--text-sec)" }}>✓ Roster ready</span>
          <div className={styles.modalFooterActions}>
            <button
              type="button"
              className="btn btn-ghost btn-md"
              disabled={submitting}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-md"
              disabled={submitting}
              onClick={onConfirm}
            >
              {submitting ? "Generating…" : "Continue to Generate →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
