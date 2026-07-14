"use client";

import styles from "../draw.module.css";

const COPY = {
  publish: {
    title: "Publish draw?",
    confirm: "Publish Draw",
    confirmBusy: "Publishing…",
    body: (name) => (
      <>
        Publish draw for <strong>{name}</strong>? This locks seeding and the roster — no
        more team changes until you Unpublish. The bracket becomes visible to players.
      </>
    ),
  },
  unpublish: {
    title: "Unpublish draw?",
    confirm: "Unpublish",
    confirmBusy: "Unpublishing…",
    body: (name) => (
      <>
        Unpublish draw for <strong>{name}</strong>? The bracket will be hidden from
        players and the roster becomes editable again. Bracket data is preserved.
      </>
    ),
  },
  bulkPublish: {
    title: "Publish all drafts?",
    confirm: "Publish All",
    confirmBusy: "Publishing…",
    body: (names) => (
      <>
        Publish {names.length} draft draw{names.length !== 1 ? "s" : ""}? All seeds will
        lock and brackets become visible to players.
        <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
          {names.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </>
    ),
  },
};

export default function PublishDrawConfirmModal({
  open,
  mode = "publish",
  divisionName,
  divisionNames = [],
  submitting = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const meta = COPY[mode] || COPY.publish;
  const names =
    mode === "bulkPublish" ? divisionNames : divisionName ? [divisionName] : [];

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onCancel();
      }}
    >
      <div
        className={`${styles.modalPanel} ${styles.confirmModalPanel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>{meta.title}</div>
            {divisionName && mode !== "bulkPublish" ? (
              <div className={styles.modalSubtitle}>{divisionName}</div>
            ) : null}
          </div>
        </div>
        <div className={`${styles.modalBody} ${styles.confirmModalBody}`}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
            {meta.body(mode === "bulkPublish" ? names : divisionName)}
          </p>
        </div>
        <div className={styles.modalFooter}>
          <div />
          <div className={styles.modalFooterActions}>
            <button
              type="button"
              className="btn btn-ghost btn-md"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={mode === "unpublish" ? "btn btn-ghost btn-md" : "btn btn-primary btn-md"}
              onClick={onConfirm}
              disabled={submitting}
            >
              {submitting ? meta.confirmBusy : meta.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}