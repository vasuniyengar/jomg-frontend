"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "../reglist.module.css";

export default function DeletePlayerModal({
  open,
  player,
  deleting = false,
  error = "",
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !deleting) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, deleting, onClose]);

  if (!open || !player || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-player-title"
      onClick={() => {
        if (!deleting) onClose();
      }}
    >
      <div
        className={`${styles.modalPanel} ${styles.modalPanelNarrow}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="delete-player-title" className={styles.modalTitle}>
            Delete Player
          </h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            disabled={deleting}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          {error ? (
            <div className="bulk-upload-error" style={{ whiteSpace: "pre-wrap" }}>
              {error}
            </div>
          ) : null}
          <p className={styles.deleteCopy}>
            Remove <strong>{player.name}</strong> from{" "}
            <strong>{player.division}</strong>?
          </p>
          <p className={styles.deleteHint}>
            This deletes their registration for this division. It cannot be undone.
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button
            type="button"
            className="btn btn-ghost btn-md"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-md ${styles.deleteConfirmBtn}`}
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
