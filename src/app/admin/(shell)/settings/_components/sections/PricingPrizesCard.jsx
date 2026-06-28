"use client";

import {
  advanceTierBadgeStyle,
  computeBundleSavingsPreview,
  newTierId,
} from "@/lib/tournamentSettings";
import styles from "../../settings.module.css";
import { SectionEyebrow, SectionPushHeader, ToggleRow, MiniToggle } from "../SettingsUi";

function PayForRow({ title, description, option, onChange }) {
  return (
    <ToggleRow title={title} description={description}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          className="form-select"
          style={{ fontSize: 11, padding: "4px 8px", height: "auto" }}
          disabled={!option.enabled}
          value={option.mode}
          onChange={(e) => onChange({ enabled: option.enabled, mode: e.target.value })}
        >
          <option value="optional">Optional</option>
          <option value="mandatory">Mandatory</option>
        </select>
        <MiniToggle
          checked={option.enabled}
          onChange={(enabled) => onChange({ enabled, mode: option.mode })}
          label={title}
        />
      </div>
    </ToggleRow>
  );
}

function PrizeInput({ label, placeholder, field, pricing, patchPricing }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        type="number"
        min={0}
        placeholder={placeholder}
        value={pricing.prizes[field]}
        onChange={(e) => {
          const raw = e.target.value;
          patchPricing({
            prizes: {
              ...pricing.prizes,
              [field]: raw === "" ? "" : Math.max(0, Number(raw) || 0),
            },
          });
        }}
      />
    </div>
  );
}

export default function PricingPrizesCard({
  settings,
  entryFee,
  onSettingsChange,
  onEntryFeeChange,
  onEnableSectionPush,
}) {
  const pricing = settings.pricing;

  const patchPricing = (patch) => {
    onSettingsChange({ pricing: { ...pricing, ...patch } });
  };

  const addAdvanceTier = () => {
    patchPricing({
      advanceTiers: [
        ...pricing.advanceTiers,
        { id: newTierId(), label: "New Tier", pricePerPlayer: entryFee || 0, activeUntil: "" },
      ],
    });
  };

  const removeAdvanceTier = (id) => {
    patchPricing({
      advanceTiers: pricing.advanceTiers.filter((t) => t.id !== id),
    });
  };

  const updateAdvanceTier = (id, field, value) => {
    patchPricing({
      advanceTiers: pricing.advanceTiers.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
  };

  const addBundle = () => {
    const maxCount = pricing.bundles.reduce((m, b) => Math.max(m, b.divisionCount), 1);
    patchPricing({
      bundles: [
        ...pricing.bundles,
        { id: newTierId(), divisionCount: maxCount + 1, mode: "pct", value: 10 },
      ],
    });
  };

  const removeBundle = (id) => {
    patchPricing({ bundles: pricing.bundles.filter((b) => b.id !== id) });
  };

  const updateBundle = (id, patch) => {
    patchPricing({
      bundles: pricing.bundles.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  };

  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <div>
          <span className="card-title">Pricing &amp; Prizes</span>
          <div className={styles.cardSectionTitle}>
            Entry fee, advance pricing, bundles &amp; prizes
          </div>
        </div>
        <SectionPushHeader
          sectionKey="pricing"
          settings={settings}
          onChange={onSettingsChange}
          onEnablePush={onEnableSectionPush}
        />
      </div>

      <SectionEyebrow>Entry Fee</SectionEyebrow>
      <div className="form-group" style={{ maxWidth: 320 }}>
        <label className="form-label">Entry Fee per Player ($)</label>
        <input
          className="form-input"
          type="number"
          min={0}
          step={1}
          value={entryFee}
          onChange={(e) => onEntryFeeChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>

      <div className={styles.payForBlock}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Checkout Payment Options</div>
        <div style={{ fontSize: 11, color: "var(--text-sec)", lineHeight: 1.5, marginBottom: 10 }}>
          One player can cover a partner&apos;s or team&apos;s entry at sign-up.
        </div>
        <PayForRow
          title="Pay for your Partner"
          description="Doubles — one player pays both entries"
          option={pricing.payForPartner}
          onChange={(opt) => patchPricing({ payForPartner: opt })}
        />
        <PayForRow
          title="Pay for the Team"
          description="Team formats — captain pays roster entry"
          option={pricing.payForTeam}
          onChange={(opt) => patchPricing({ payForTeam: opt })}
        />
      </div>

      <SectionEyebrow optional>Advance Pricing (time-based tiers)</SectionEyebrow>
      <div className={styles.tierList}>
        {pricing.advanceTiers.map((tier, i) => (
          <div key={tier.id} className={styles.advanceTierRow}>
            <div
              className={styles.advanceTierBadge}
              style={{ background: advanceTierBadgeStyle(i) }}
            >
              {i + 1}
            </div>
            <div className={styles.advanceTierGrid}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tier Label</label>
                <input
                  className="form-input"
                  value={tier.label}
                  onChange={(e) => updateAdvanceTier(tier.id, "label", e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Price per Player ($)</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={tier.pricePerPlayer}
                  onChange={(e) =>
                    updateAdvanceTier(tier.id, "pricePerPlayer", Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Active Until</label>
                <input
                  className="form-input"
                  type="date"
                  value={tier.activeUntil ? tier.activeUntil.slice(0, 10) : ""}
                  onChange={(e) => updateAdvanceTier(tier.id, "activeUntil", e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className={styles.tierRemove}
              onClick={() => removeAdvanceTier(tier.id)}
              title="Remove tier"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={addAdvanceTier}>
        + Add Pricing Tier
      </button>

      <SectionEyebrow optional>Multi-Division Bundle Discounts</SectionEyebrow>
      <div className={styles.tierList}>
        {pricing.bundles.map((bundle) => (
          <div key={bundle.id} className={styles.bundleRow}>
            <div className={styles.bundleCount}>
              <span className={styles.bundleCountNum}>{bundle.divisionCount}</span>
              <span className={styles.bundleCountLabel}>divisions</span>
            </div>
            <div className={styles.bundleFields}>
              <div className="form-group" style={{ margin: 0, width: 100 }}>
                <label className="form-label">Mode</label>
                <select
                  className="form-select"
                  value={bundle.mode}
                  onChange={(e) => updateBundle(bundle.id, { mode: e.target.value })}
                >
                  <option value="pct">% off</option>
                  <option value="flat">Flat $</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, width: 140 }}>
                <label className="form-label">
                  {bundle.mode === "flat" ? "Bundle price ($)" : "Discount (%)"}
                </label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={bundle.value}
                  onChange={(e) =>
                    updateBundle(bundle.id, { value: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className={styles.bundleSavings}>
                <span style={{ fontSize: 11, color: "var(--text-sec)" }}>
                  {computeBundleSavingsPreview(entryFee, bundle)}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.tierRemove}
              onClick={() => removeBundle(bundle.id)}
              title="Remove bundle"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={addBundle}>
        + Add Bundle Tier
      </button>

      <SectionEyebrow>Prize Money (per division)</SectionEyebrow>
      <div className={styles.grid3}>
        <PrizeInput
          label="1st Prize ($)"
          placeholder="e.g. 500"
          field="first"
          pricing={pricing}
          patchPricing={patchPricing}
        />
        <PrizeInput
          label="2nd Prize ($)"
          placeholder="e.g. 250"
          field="second"
          pricing={pricing}
          patchPricing={patchPricing}
        />
        <PrizeInput
          label="3rd Prize ($)"
          placeholder="e.g. 100"
          field="third"
          pricing={pricing}
          patchPricing={patchPricing}
        />
      </div>
      <ToggleRow
        title="Medals & Trophy Awards"
        description="Physical awards at ceremony"
        checked={pricing.prizes.medalsAwards}
        onChange={(v) =>
          patchPricing({ prizes: { ...pricing.prizes, medalsAwards: v } })
        }
      />

      <SectionEyebrow>Payment Instructions</SectionEyebrow>
      <div className="form-group" style={{ maxWidth: 420 }}>
        <label className="form-label">Payment mobile number</label>
        <input
          className="form-input"
          type="tel"
          placeholder="e.g. (512) 555-0100"
          value={settings.paymentPhone || ""}
          onChange={(e) => onSettingsChange({ paymentPhone: e.target.value })}
        />
        <p className="form-hint">
          Shown in bulk registration emails for manual payment. Stored in plain text for Phase 1.
        </p>
      </div>
    </div>
  );
}