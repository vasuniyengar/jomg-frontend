"use client";

import Link from "next/link";
import styles from "../divisions.module.css";
import { DIVISION_COLORS } from "@/lib/divisions";
import { sanitizeDuprInput } from "@/lib/duprInput";
import { SCORING_OPTIONS, SEEDING_METHOD_OPTIONS } from "@/lib/tournamentSettings";
import { tournamentAdminPath } from "@/lib/tournaments";

const DEFAULT_ACCENT = "#AAFF00";

function PlaceholderSection({ title, children }) {
  return (
    <div className={styles.fieldDisabled} aria-hidden="true">
      <div className={styles.sectionLabel}>{title}</div>
      {children}
    </div>
  );
}

export default function DivisionFormModal({
  open,
  editing,
  form,
  setForm,
  meta,
  tournament,
  tournamentId,
  saving,
  poolStarted,
  divisionIndex,
  onClose,
  onSave,
}) {
  const paletteDefault =
    DIVISION_COLORS[Math.max(0, divisionIndex) % DIVISION_COLORS.length] || DEFAULT_ACCENT;
  const accentValue = form.accentColor || paletteDefault;

  if (!open) return null;

  const settingsHref = tournamentId
    ? tournamentAdminPath("/admin/settings", tournamentId)
    : "/admin/settings";
  const inheritFee = Number(tournament?.entryFee ?? 0);
  const feeDisabled = form.useGlobalSettings;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div
            className={styles.modalHeaderAccent}
            style={{ background: accentValue }}
            aria-hidden
          />
          <div className={styles.modalHeaderText}>
            <div className={styles.modalTitle}>
              {editing ? "Edit Division" : "Add New Division"}
            </div>
            <div className={styles.modalSubtitle}>
              Configure division settings — overrides tournament defaults
            </div>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalOverrideBanner}>
          <div>
            <div className={styles.modalOverrideTitle}>
              Override Tournament Settings for This Division
            </div>
            <div className={styles.modalOverrideHint}>
              When ON, this division uses its own scoring, format &amp; rules — ignoring
              global tournament settings
            </div>
          </div>
          <label className="mini-toggle">
            <input
              type="checkbox"
              checked={!form.useGlobalSettings}
              disabled={poolStarted}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  useGlobalSettings: !e.target.checked,
                }))
              }
            />
            <span className="mini-slider" />
          </label>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.sectionLabel}>Identity &amp; Registration</div>

          <div className="form-group">
            <label className="form-label">Division Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Mixed Doubles 3.5"
              value={form.bracketName}
              disabled={poolStarted}
              onChange={(e) => setForm((f) => ({ ...f, bracketName: e.target.value }))}
            />
          </div>

          <div className="form-group" style={{ maxWidth: 200 }}>
            <label className="form-label">Accent Color</label>
            <div className={styles.accentColorRow}>
              <input
                type="color"
                className={styles.accentColorInput}
                value={accentValue}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, accentColor: e.target.value }))
                }
              />
              <span className={styles.inheritHint}>Saved on this division</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Group</label>
              <select
                className="form-select"
                value={form.groupId}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}
              >
                <option value="">Select group…</option>
                {(meta?.groups || []).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Format</label>
              <select
                className="form-select"
                value={form.formatId}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, formatId: e.target.value }))}
              >
                <option value="">Select format…</option>
                {(meta?.formats || []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bracket format</label>
            <select
              className="form-select"
              value={form.bracketFormatId}
              disabled={poolStarted}
              onChange={(e) => setForm((f) => ({ ...f, bracketFormatId: e.target.value }))}
            >
              <option value="">Select bracket format…</option>
              {(meta?.bracketFormats || []).map((bf) => (
                <option key={bf.id} value={bf.id}>
                  {bf.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Division Starts</label>
              <input
                className="form-input"
                type="date"
                value={form.startDate}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                className="form-input"
                type="time"
                value={form.startTime}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Division Ends</label>
              <input
                className="form-input"
                type="date"
                value={form.endDate}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Min Age</label>
              <input
                className="form-input"
                type="number"
                min={0}
                max={120}
                placeholder="e.g. 18"
                value={form.minAge}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, minAge: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Age</label>
              <input
                className="form-input"
                type="number"
                min={0}
                max={120}
                placeholder="e.g. 65"
                value={form.maxAge}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, maxAge: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Skill Level</label>
              <input
                className="form-input"
                placeholder="e.g. 3.5, 4.0+, Open"
                value={form.skillLevel}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, skillLevel: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Teams</label>
              <input
                className="form-input"
                type="number"
                min={2}
                value={form.maxTeams}
                disabled={poolStarted}
                onChange={(e) => setForm((f) => ({ ...f, maxTeams: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Entry Fee ($)</label>
              <input
                className="form-input"
                type="number"
                min={0}
                value={form.registrationFee}
                disabled={poolStarted || feeDisabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, registrationFee: e.target.value }))
                }
              />
              {form.useGlobalSettings ? (
                <div className={styles.inheritHint}>
                  Inherits tournament entry fee (${inheritFee})
                </div>
              ) : null}
            </div>
          </div>

          {!form.useGlobalSettings ? (
            <div className={styles.pricingNote}>
              Custom pricing for this division. Advance tiers are managed in{" "}
              <Link href={settingsHref}>Tournament Settings → Pricing</Link>. Entry fee
              above is saved as the division base fee.
            </div>
          ) : null}

          <div className={styles.sectionLabel} style={{ marginTop: 16 }}>
            Registration
          </div>
          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Registration On</strong>
              <small>Players can sign up for this division</small>
            </div>
            <label className="mini-toggle">
              <input
                type="checkbox"
                checked={form.registrationOn}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, registrationOn: e.target.checked }))
                }
              />
              <span className="mini-slider" />
            </label>
          </div>
          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Show Division Online</strong>
              <small>Publicly visible on tournament page</small>
            </div>
            <label className="mini-toggle">
              <input
                type="checkbox"
                checked={form.showPublic}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, showPublic: e.target.checked }))
                }
              />
              <span className="mini-slider" />
            </label>
          </div>

          <div className={styles.sectionLabel}>DUPR / Skill Eligibility</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Min Individual DUPR</label>
              <input
                className="form-input"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 3.50"
                value={form.minRating}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    minRating: sanitizeDuprInput(e.target.value),
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Individual DUPR</label>
              <input
                className="form-input"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 4.50"
                value={form.maxRating}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxRating: sanitizeDuprInput(e.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Min Combined DUPR</label>
              <input
                className="form-input"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 8.00"
                value={form.duprCombinedMin}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    duprCombinedMin: sanitizeDuprInput(e.target.value),
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Combined DUPR</label>
              <input
                className="form-input"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 20.30"
                value={form.duprCombinedMax}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    duprCombinedMax: sanitizeDuprInput(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="toggle-row">
            <div className="toggle-info">
              <strong>DUPR Recorded</strong>
              <small>Matches count toward ratings (division default)</small>
            </div>
            <label className="mini-toggle">
              <input
                type="checkbox"
                checked={form.duprRecorded}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duprRecorded: e.target.checked }))
                }
              />
              <span className="mini-slider" />
            </label>
          </div>
          <div className="toggle-row">
            <div className="toggle-info">
              <strong>DUPR Enforced</strong>
              <small>Only DUPR profiles can enter</small>
            </div>
            <label className="mini-toggle">
              <input
                type="checkbox"
                checked={form.duprEnforced}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duprEnforced: e.target.checked }))
                }
              />
              <span className="mini-slider" />
            </label>
          </div>

          <div className={styles.sectionLabel} style={{ marginTop: 16 }}>
            Division Play Rules
          </div>
          <p style={{ fontSize: 11, color: "var(--text-sec)", marginBottom: 10 }}>
            {form.useGlobalSettings
              ? "Inherits tournament play rules unless overridden below."
              : "Custom play rules for this division."}
          </p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Seeding Method</label>
              <select
                className="form-select"
                value={form.seedingMethod || ""}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seedingMethod: e.target.value }))
                }
              >
                <option value="">Inherit from tournament</option>
                {SEEDING_METHOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.subsectionLabel}>Match Scoring by Stage</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pool Play Scoring</label>
              <select
                className="form-select"
                value={form.poolScoring || ""}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, poolScoring: e.target.value }))
                }
              >
                <option value="">Inherit from tournament</option>
                {SCORING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Playoff Scoring</label>
              <select
                className="form-select"
                value={form.playoffScoring || ""}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, playoffScoring: e.target.value }))
                }
              >
                <option value="">Inherit from tournament</option>
                {SCORING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.sectionLabel} style={{ marginTop: 16 }}>
            Pool Play &amp; Advancement
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teams per Pool</label>
              <input
                className="form-input"
                type="number"
                min={2}
                max={16}
                value={form.teamsPerPool}
                disabled={poolStarted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, teamsPerPool: e.target.value }))
                }
              />
            </div>
          </div>

          <div className={styles.fieldDisabled} aria-hidden="true">
            <div className={styles.sectionLabel}>MLP / Dream Breaker</div>
            <div className={styles.mlpPanel}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span className={styles.mlpPanelTitle}>MLP Format for this Division</span>
                <span className={styles.mlpBadge}>TEAM PLAY</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-sec)", lineHeight: 1.5 }}>
                Inherits MLP settings from Tournament Play Rules. Coming soon for per-division
                overrides.
              </div>
            </div>
          </div>

          <PlaceholderSection title="Prizes &amp; Awards">
            <div className="toggle-row">
              <div className="toggle-info">
                <strong>Cash Prize Money</strong>
                <small>Enable cash payouts for this division</small>
              </div>
              <label className="mini-toggle">
                <input type="checkbox" defaultChecked readOnly />
                <span className="mini-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div className="toggle-info">
                <strong>Medals &amp; Trophies</strong>
                <small>Physical awards at ceremony</small>
              </div>
              <label className="mini-toggle">
                <input type="checkbox" defaultChecked readOnly />
                <span className="mini-slider" />
              </label>
            </div>
          </PlaceholderSection>
        </div>

        <div className={styles.modalFooter}>
          <div>
            {poolStarted ? (
              <p className="form-hint" style={{ margin: 0 }}>
                Pools have started — editing is disabled.
              </p>
            ) : null}
          </div>
          <div className={styles.modalFooterActions}>
            <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={onSave}
              disabled={saving || poolStarted || !form.bracketName.trim()}
            >
              {saving ? "Saving…" : "Save Division"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
