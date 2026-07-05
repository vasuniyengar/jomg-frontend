"use client";

import styles from "../../settings.module.css";
import { CardBadge, ToggleRow } from "../SettingsUi";

export default function NotificationsCard({ settings, onSettingsChange }) {
  const n = settings.notifications;
  const patch = (patch) => {
    onSettingsChange({ notifications: { ...n, ...patch } });
  };

  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <div>
          <span className="card-title">Notifications</span>
          <div className={styles.cardSectionTitle}>
            Match alerts, scoreboard &amp; email reminders
          </div>
        </div>
        <CardBadge>Tournament-wide</CardBadge>
      </div>
      <div className={styles.toggleGrid} style={{ marginTop: 14 }}>
        <ToggleRow
          title="Match Notifications"
          description="Auto-notify players of upcoming matches"
          checked={n.matchNotifications}
          onChange={(v) => patch({ matchNotifications: v })}
        />
        <ToggleRow
          title="Live Scoring"
          description="Public real-time scoreboard"
          checked={n.liveScoring}
          onChange={(v) => patch({ liveScoring: v })}
        />
        <ToggleRow
          title="Email Notifications"
          description="Reminders & match alerts"
          checked={n.emailNotifications}
          onChange={(v) => patch({ emailNotifications: v })}
        />
        <ToggleRow
          title="Court Assignment Text"
          description="Text players their court"
          checked={n.courtAssignmentText}
          onChange={(v) => patch({ courtAssignmentText: v })}
        />
      </div>
    </div>
  );
}
