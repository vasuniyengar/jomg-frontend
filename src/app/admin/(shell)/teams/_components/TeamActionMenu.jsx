"use client";

import { useEffect, useRef } from "react";
import styles from "../teams.module.css";

export default function TeamActionMenu({
  team,
  row,
  locked,
  open,
  onToggle,
  onClose,
  onMoveSeed,
  onMovePool,
  onEditRoster,
  onSetStatus,
  onWithdraw,
  onForfeit,
  onReactivate,
  onCustomName,
  onRemove,
  onUnpublish,
}) {
  const ref = useRef(null);
  const isPool = (row?.format || "").toLowerCase().includes("pool");
  const isDoubles = row?.type === "Doubles" || row?.type === "Mixed Doubles";
  const isMlp = row?.type === "MLP";
  const inactive = team.status === "withdrawn" || team.status === "forfeited";

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const item = (label, icon, onClick, danger = false, disabled = false) => {
    if (disabled) {
      return (
        <div key={label} className={styles.menuItemDisabled}>
          <span style={{ width: 16, textAlign: "center", opacity: 0.5 }}>{icon}</span>
          {label}
        </div>
      );
    }
    return (
      <div
        key={label}
        className={`${styles.menuItem}${danger ? ` ${styles.menuItemDanger}` : ""}`}
        onClick={() => {
          onClose();
          onClick();
        }}
      >
        <span style={{ width: 16, textAlign: "center", fontSize: 12 }}>{icon}</span>
        {label}
      </div>
    );
  };

  return (
    <div className={styles.menuWrap} ref={ref}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ padding: "6px 10px", fontSize: 14 }}
        title="Team actions"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        ≡
      </button>
      {open ? (
        <div className={styles.menuPanel}>
          {locked ? (
            <>
              <div style={{ padding: "14px 16px", fontSize: 11, color: "var(--text-sec)", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                  Roster locked
                </div>
                This team is in a published bracket. Unpublish first to edit.
              </div>
              <div className={styles.menuDivider} />
              {item("Unpublish bracket…", "🔓", onUnpublish)}
            </>
          ) : (
            <>
              {isPool ? item("Move to pool…", "🗂", onMovePool, false, inactive) : null}
              {item("Move to seed…", "↕", onMoveSeed, false, inactive)}
              <div className={styles.menuDivider} />
              {isMlp && !inactive ? item("Edit roster…", "✏️", onEditRoster) : null}
              {isDoubles && team.players?.length === 2
                ? item("Replace partner…", "🔁", () => onSetStatus("partner"), false, inactive)
                : null}
              {isDoubles && team.partnerNeeded
                ? item("Add partner…", "➕", () => onSetStatus("partner"))
                : null}
              {item("Set status…", "◎", () => onSetStatus("modal"))}
              {team.status !== "withdrawn"
                ? item("Withdraw team", "⏸", onWithdraw, false, false)
                : null}
              {team.status !== "forfeited"
                ? item("Mark as forfeit…", "⚠", onForfeit, false, false)
                : null}
              {inactive ? item("Reactivate team", "↻", onReactivate) : null}
              <div className={styles.menuDivider} />
              {item("Custom team name…", "✎", onCustomName)}
              {item("Remove from division", "🗑", onRemove, true)}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
