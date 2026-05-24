"use client";

import styles from "../../settings.module.css";
import { SectionPushHeader, ToggleRow } from "../SettingsUi";

export default function DuprIntegrationCard({
  settings,
  duprRecorded,
  duprEnforced,
  requireSkillRating,
  onSettingsChange,
  onDuprRecorded,
  onDuprEnforced,
  onRequireSkillRating,
  clubDuprId = "CLB-08821",
}) {
  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="card-title">DUPR Integration</span>
          <span className={styles.duprBadge}>DUPR</span>
        </div>
        <SectionPushHeader sectionKey="dupr" settings={settings} onChange={onSettingsChange} />
      </div>
      <div className="form-group" style={{ maxWidth: 420, marginTop: 16 }}>
        <label className="form-label">Club DUPR ID</label>
        <div className={styles.readOnlyField}>
          <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{clubDuprId}</span>
          <span className={styles.readOnlyBadge}>Read-only</span>
        </div>
        <p className="form-hint">Managed in club profile (Phase 2).</p>
      </div>
      <div className={styles.toggleGrid}>
        <ToggleRow
          title="DUPR Recorded"
          description="Matches count toward ratings"
          checked={duprRecorded}
          onChange={onDuprRecorded}
        />
        <ToggleRow
          title="DUPR Enforced"
          description="Only verified DUPR profiles can register"
          checked={duprEnforced}
          onChange={onDuprEnforced}
        />
        <ToggleRow
          title="Require Skill Rating"
          description="DUPR or UTR required at registration"
          checked={requireSkillRating}
          onChange={onRequireSkillRating}
        />
      </div>
    </div>
  );
}
