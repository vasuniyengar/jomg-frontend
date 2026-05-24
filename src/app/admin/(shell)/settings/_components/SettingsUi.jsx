"use client";

import styles from "../settings.module.css";

export function MiniToggle({ checked, onChange, label, className = "" }) {
  return (
    <label className={`mini-toggle ${className}`.trim()} aria-label={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="mini-slider" />
    </label>
  );
}

export function ToggleRow({ title, description, checked, onChange, children }) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      {children || <MiniToggle checked={checked} onChange={onChange} label={title} />}
    </div>
  );
}

export function SectionPushHeader({ sectionKey, settings, onChange }) {
  const on = settings.sectionPush?.[sectionKey];
  const labelId = `lbl-${sectionKey}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-sec)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Apply to all divisions
        </div>
        <div id={labelId} style={{ fontSize: 10, color: "var(--text-ter)", marginTop: 1 }}>
          {on ? "ON — overwrites all divisions on save" : "OFF — applies to new divisions only"}
        </div>
      </div>
      <MiniToggle
        checked={!!on}
        onChange={(v) =>
          onChange({
            sectionPush: { ...settings.sectionPush, [sectionKey]: v },
          })
        }
        label={`Apply ${sectionKey} to all divisions`}
      />
    </div>
  );
}

export function CardBadge({ children }) {
  return <span className={styles.cardBadge}>{children}</span>;
}

export function SectionEyebrow({ children, optional }) {
  return (
    <div className={styles.sectionEyebrowRow}>
      <span className={styles.sectionEyebrow}>{children}</span>
      {optional ? <span className={styles.optionalBadge}>OPTIONAL</span> : null}
    </div>
  );
}
