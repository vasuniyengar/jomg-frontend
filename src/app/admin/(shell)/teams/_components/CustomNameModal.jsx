"use client";

import { useEffect, useState } from "react";
import styles from "../teams.module.css";

export default function CustomNameModal({ open, teamName, current, onCancel, onConfirm }) {
  const [value, setValue] = useState(current || "");
  const [saving, setSaving] = useState(false);    

  useEffect(() => {
    if (open) {
      setValue(current || "");
      setSaving(false);                                  
    }
  }, [open, current]);

  if (!open) return null;

  const handleSave = async () => {                       
    setSaving(true);
    try {
      await onConfirm(value.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onCancel();  
      }}
    >
      <div className={`${styles.modalPanel} ${styles.modalPanelSm}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>Custom team name</div>
            <div className={styles.modalSubtitle}>{teamName}</div>
          </div>
        </div>
        <div className={styles.modalBody}>
          <input
            className="form-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Austin Aces"
            disabled={saving}                              
          />
        </div>
        <div className={styles.modalFooter}>
          <div />
          <div className={styles.modalFooterActions}>
            <button
              type="button"
              className="btn btn-ghost btn-md"
              onClick={onCancel}
              disabled={saving}                           
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={handleSave}                          
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}