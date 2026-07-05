"use client";

import styles from "../../settings.module.css";

export default function ConfirmSettingsCard({
  settings,
  saving,
  onConfirm,
  onUnconfirm,
}) {
  return (
    <div className={`card ${styles.confirmCard}`} id="settings-confirm-card">
      <div className="card-header" style={{ marginBottom: 10 }}>
        <div>
          <span className="card-title" style={{ color: "var(--primary-text)" }}>
            ✅ Confirm Tournament Settings
          </span>
          <div className={styles.cardSectionTitle}>Required before publishing</div>
        </div>
        <span
          className={`${styles.confirmBadge} ${
            settings.settingsConfirmed
              ? styles.confirmBadgeDone
              : styles.confirmBadgePending
          }`}
        >
          {settings.settingsConfirmed ? "● Confirmed" : "● Not Confirmed"}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-sec)", lineHeight: 1.6, marginBottom: 14 }}>
        Review the sections above. Confirm when scoring, registration, and visibility settings
        are ready to unlock publishing on your dashboard.
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {!settings.settingsConfirmed ? (
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={onConfirm}
            disabled={saving}
          >
            ✓ Confirm &amp; Lock Settings
          </button>
        ) : (
          <button type="button" className="btn btn-ghost btn-md" onClick={onUnconfirm}>
            ↺ Edit Settings
          </button>
        )}
        {settings.settingsConfirmedAt ? (
          <span style={{ fontSize: 11, color: "var(--text-ter)", fontStyle: "italic" }}>
            Confirmed {new Date(settings.settingsConfirmedAt).toLocaleString()}
          </span>
        ) : null}
      </div>
    </div>
  );
}
