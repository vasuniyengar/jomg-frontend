"use client";

import { useEffect, useState } from "react";

const SECTION_LABELS = {
  pricing: "Pricing & Prizes",
  playRules: "Tournament Play Rules",
  dupr: "DUPR Integration",
};

export default function OverrideConfirmModal({
  open,
  section,
  divisions,
  onConfirm,
  onCancel,
  pushing,
}) {
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (open && divisions?.length) {
      setSelected(
        new Set(
          divisions.filter((d) => !d.poolStarted).map((d) => d.id)
        )
      );
    }
  }, [open, divisions]);

  if (!open) return null;

  const editable = (divisions || []).filter((d) => !d.poolStarted);
  const sectionKey = section === "playrules" ? "playRules" : section;

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (on) => {
    if (on) setSelected(new Set(editable.map((d) => d.id)));
    else setSelected(new Set());
  };

  return (
    <div
      style={{
        display: "flex",
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 370,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          maxWidth: 560,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px 24px 12px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800 }}>
            Override per-division settings?
          </div>
          <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 6 }}>
            Applying <strong>{SECTION_LABELS[sectionKey] || section}</strong> to selected
            divisions. Unchecked divisions keep their own values.
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleAll(true)}>
              Select all
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleAll(false)}>
              Clear
            </button>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-ter)" }}>
              {selected.size} of {editable.length} selected
            </span>
          </div>
        </div>
        <div style={{ padding: "8px 24px", overflowY: "auto", flex: 1 }}>
          {editable.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-sec)" }}>
              No editable divisions (pool play may have started).
            </p>
          ) : (
            editable.map((d) => (
              <label
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  marginBottom: 6,
                  background: "var(--badge-bg)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(d.id)}
                  onChange={() => toggle(d.id)}
                />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</span>
              </label>
            ))
          )}
        </div>
        <div
          style={{
            padding: "14px 24px 18px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button type="button" className="btn btn-ghost btn-md" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-md"
            disabled={pushing || selected.size === 0}
            onClick={() =>
              onConfirm({
                sections: [sectionKey],
                bracketIds: [...selected],
              })
            }
          >
            {pushing ? "Applying…" : "Override Selected →"}
          </button>
        </div>
      </div>
    </div>
  );
}
