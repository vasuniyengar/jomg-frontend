"use client";

import styles from "../tournaments.module.css";

export default function DeleteTournamentConfirmModal({
  open,
  tournament,
  deleting,
  onCancel,
  onConfirm,
}) {
  if (!open || !tournament) return null;

  const players = tournament.players || 0;
  const divisions = tournament.divisions || 0;

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
            style={{ background: "var(--primary)" }}
            aria-hidden
          />
          <div className={styles.modalHeaderText}>
            <div className={styles.modalTitle}>Delete tournament?</div>
            <div className={styles.modalSubtitle}>{tournament.name}</div>
          </div>
        </div>

        <div className={styles.confirmModalBody}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            Delete <strong>{tournament.name}</strong>? This cannot be undone.
          </p>
          {players > 0 ? (
            <p style={{ margin: "10px 0 0", fontSize: 13 }}>
              This tournament has {players} player{players === 1 ? "" : "s"}.
            </p>
          ) : null}
          {divisions > 0 ? (
            <p style={{ margin: players > 0 ? "6px 0 0" : "10px 0 0", fontSize: 13 }}>
              This tournament has {divisions} division{divisions === 1 ? "" : "s"}.
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
              {deleting ? "Deleting…" : "Delete Tournament"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
