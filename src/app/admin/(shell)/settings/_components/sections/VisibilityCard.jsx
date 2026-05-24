"use client";

import { useState } from "react";
import styles from "../../settings.module.css";
import { CardBadge, ToggleRow } from "../SettingsUi";

export default function VisibilityCard({
  settings,
  onSettingsChange,
  passwordConfirm = "",
  onPasswordConfirmChange,
}) {
  const v = settings.visibility;
  const [showPw, setShowPw] = useState(false);

  const patch = (patchVis) => {
    onSettingsChange({ visibility: { ...v, ...patchVis } });
  };

  const setPublic = (checked) => {
    patch({
      publicTournamentPage: checked,
      privateOnly: checked ? false : v.privateOnly,
    });
  };

  const setPrivate = (checked) => {
    patch({
      privateOnly: checked,
      publicTournamentPage: checked ? false : v.publicTournamentPage,
    });
  };

  const showMutexHint = v.publicTournamentPage && v.privateOnly;

  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <div>
          <span className="card-title">Visibility &amp; Communications</span>
          <div className={styles.cardSectionTitle}>Tournament-level only</div>
        </div>
        <CardBadge>Tournament-wide</CardBadge>
      </div>
      <div className={styles.toggleGrid} style={{ marginTop: 14 }}>
        <ToggleRow
          title="Public Tournament Page"
          description="Visible to players on app"
          checked={v.publicTournamentPage}
          onChange={setPublic}
        />
        <ToggleRow
          title="Private Only"
          description="Invite-only — not listed publicly"
          checked={v.privateOnly}
          onChange={setPrivate}
        />
        <ToggleRow
          title="Show Divisions Publicly"
          description="Anyone can view standings & brackets"
          checked={v.showDivisionsPublicly}
          onChange={(checked) => patch({ showDivisionsPublicly: checked })}
        />
        <ToggleRow
          title="Spectator Scoreboard"
          description="Display on venue screens"
          checked={v.spectatorScoreboard}
          onChange={(checked) => patch({ spectatorScoreboard: checked })}
        />
        <ToggleRow
          title="Password Protected"
          description={
            v.passwordProtected ? "Require code to register" : "Open registration"
          }
          checked={v.passwordProtected}
          onChange={(checked) => patch({ passwordProtected: checked })}
        />
        <ToggleRow
          title="Waitlist Enabled"
          description="Auto-queue after capacity"
          checked={v.waitlistEnabled}
          onChange={(checked) => patch({ waitlistEnabled: checked })}
        />
      </div>
      {showMutexHint ? (
        <div className={styles.visMutexHint}>
          Public Tournament Page and Private Only cannot both be on — one was turned off.
        </div>
      ) : null}
      {v.passwordProtected ? (
        <div className={styles.pwField}>
          <div className={styles.grid2}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Registration Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={v.registrationPassword}
                  onChange={(e) => {
                    patch({ registrationPassword: e.target.value });
                  }}
                  style={{ paddingRight: 72 }}
                />
                <button
                  type="button"
                  className={styles.pwEyeBtn}
                  onClick={() => setShowPw((s) => !s)}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type={showPw ? "text" : "password"}
                placeholder="Re-enter password"
                value={passwordConfirm}
                onChange={(e) => onPasswordConfirmChange?.(e.target.value)}
              />
              {passwordConfirm && v.registrationPassword !== passwordConfirm ? (
                <p className="form-hint" style={{ color: "#ff8a80" }}>
                  Passwords do not match
                </p>
              ) : (
                <p className="form-hint">&nbsp;</p>
              )}
            </div>
          </div>
          <p className="form-hint">Stored for Phase 1 without hashing — use a dedicated registration code.</p>
        </div>
      ) : null}
    </div>
  );
}

export function validateVisibilityPassword(visibility) {
  if (!visibility?.passwordProtected) return null;
  const pw = visibility.registrationPassword || "";
  if (pw.length < 6) return "Registration password must be at least 6 characters";
  return null;
}
