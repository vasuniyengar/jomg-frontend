"use client";

import DescriptionRteEditor from "../../../_components/DescriptionRteEditor";
import { NET_SETUP_OPTIONS, PLAY_ENV_OPTIONS } from "@/lib/tournamentSettings";
import styles from "../../settings.module.css";
import { CardBadge } from "../SettingsUi";

export default function CourtsInfoCard({ settings, onChange }) {
  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <div>
          <span className="card-title">Courts Info</span>
          <div className={styles.cardSectionTitle}>
            # of Courts, play environment &amp; net setup
          </div>
        </div>
        <CardBadge>Tournament-wide</CardBadge>
      </div>
      <div className={styles.grid3}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label"># of Courts</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={settings.numCourts}
            onChange={(e) =>
              onChange({ numCourts: Math.max(0, Number(e.target.value) || 0) })
            }
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Play Environment</label>
          <select
            className="form-select"
            value={settings.playEnv}
            onChange={(e) => onChange({ playEnv: e.target.value })}
          >
            {PLAY_ENV_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Net Setup</label>
          <select
            className="form-select"
            value={settings.netSetup}
            onChange={(e) => onChange({ netSetup: e.target.value })}
          >
            {NET_SETUP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.grid2}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Official Ball</label>
          <input
            className="form-input"
            placeholder="e.g. Franklin X-40 Outdoor"
            value={settings.officialBall}
            onChange={(e) => onChange({ officialBall: e.target.value })}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Ball Link (optional)</label>
          <input
            className="form-input"
            type="url"
            placeholder="https://…"
            value={settings.officialBallUrl}
            onChange={(e) => onChange({ officialBallUrl: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Court Description</label>
        <DescriptionRteEditor
          value={settings.courtDescription}
          onChange={(html) => onChange({ courtDescription: html })}
          placeholder="Describe the courts shown on the player website (surface, indoor/outdoor details, etc.)"
          minHeight={100}
          showExpand={false}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Paddle Policy</label>
        <DescriptionRteEditor
          value={settings.paddlePolicyText}
          onChange={(html) => onChange({ paddlePolicyText: html })}
          placeholder="Paddle rules shown on the player website Details tab"
          minHeight={160}
          showExpand
        />
      </div>
    </div>
  );
}
