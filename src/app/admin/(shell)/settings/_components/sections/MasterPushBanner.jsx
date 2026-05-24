"use client";

import styles from "../../settings.module.css";
import { MiniToggle } from "../SettingsUi";

export default function MasterPushBanner({ settings, onChange }) {
  return (
    <div className={styles.masterPush}>
      <div className={styles.masterPushRow}>
        <div>
          <div className={styles.masterPushTitle}>🔁 Push All Settings to Every Division</div>
          <div className={styles.masterPushDesc}>
            When <strong>ON</strong> — every setting on this page is copied into all divisions,
            overwriting any per-division values.
            <br />
            When <strong>OFF</strong> — settings here act as defaults only for{" "}
            <em>new</em> divisions.
          </div>
          <span className={styles.masterPushStatus}>
            {settings.masterPush
              ? "ON — will overwrite all division settings on save"
              : "OFF — existing divisions keep their own settings"}
          </span>
        </div>
        <MiniToggle
          checked={settings.masterPush}
          onChange={(v) => onChange({ masterPush: v })}
          label="Push all settings to every division"
          className={styles.masterToggle}
        />
      </div>
    </div>
  );
}
