"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { addPlayerByHost } from "@/lib/divisions";
import styles from "../reglist.module.css";

const EMPTY = {
  firstname: "",
  lastname: "",
  email: "",
  phoneNumber: "",
  age: "30",
  gender: "male",
  partner: "",
  duprRating: "",
  duprId: "",
  clubName: "",
  paymentStatus: "unpaid",
  sendPaymentEmail: true,
  bracketId: "",
};

function RequiredStar() {
  return (
    <span style={{ color: "#ef4444", marginLeft: 4 }} aria-hidden="true">
      *
    </span>
  );
}

export default function AddPlayerModal({
  open,
  onClose,
  tournamentId,
  divisions = [],
  tournamentClubName = "",
  onAdded,
}) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY,
      clubName: tournamentClubName || "",
      bracketId: "",
    });
    setError("");
  }, [open, tournamentClubName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tournamentId || !form.bracketId) {
      setError("Select a division");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        age: Number(form.age) || 30,
        gender: form.gender,
        partner: form.partner.trim() || undefined,
        duprId: form.duprId.trim(),
        clubName: form.clubName.trim() || tournamentClubName || undefined,
        paymentStatus: form.paymentStatus,
        sendPaymentEmail:
          form.paymentStatus === "unpaid" ? form.sendPaymentEmail : false,
      };
      if (form.duprRating !== "") {
        payload.duprRating = Number(form.duprRating);
      }
      await addPlayerByHost(tournamentId, Number(form.bracketId), payload);
      await onAdded?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add player");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-player-title"
      onClick={onClose}
    >
      <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="add-player-title" className={styles.modalTitle}>
            Add Player
          </h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error ? (
              <div className="bulk-upload-error" style={{ whiteSpace: "pre-wrap" }}>
                {error}
              </div>
            ) : null}
            <div className="form-group">
              <label className="form-label">
                Division
                <RequiredStar />
              </label>
              <select
                className="form-select"
                required
                value={form.bracketId}
                onChange={(e) => setForm((f) => ({ ...f, bracketId: e.target.value }))}
              >
                <option value="">Select division…</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {!divisions.length ? (
                <p className="form-hint" style={{ marginTop: 6 }}>
                  Create divisions first under Manage Divisions.
                </p>
              ) : null}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">
                  First name
                  <RequiredStar />
                </label>
                <input
                  className="form-input"
                  required
                  minLength={2}
                  value={form.firstname}
                  onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Last name
                  <RequiredStar />
                </label>
                <input
                  className="form-input"
                  required
                  minLength={2}
                  value={form.lastname}
                  onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Email
                <RequiredStar />
              </label>
              <input
                className="form-input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
         <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            className="form-input"
            value={form.phoneNumber}
            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
          />
</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">
                  Age
                  <RequiredStar />
                </label>
                <input
                  className="form-input"
                  type="number"
                  min={18}
                  max={120}
                  required
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">DUPR</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  max={8}
                  step="0.01"
                  placeholder="Optional"
                  value={form.duprRating}
                  onChange={(e) => setForm((f) => ({ ...f, duprRating: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">DUPR ID</label>
                <input
                  className="form-input"
                  placeholder="Optional"
                  value={form.duprId}
                  onChange={(e) => setForm((f) => ({ ...f, duprId: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Club</label>
              <input
                className="form-input"
                placeholder={tournamentClubName || "Club name"}
                value={form.clubName}
                onChange={(e) => setForm((f) => ({ ...f, clubName: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Partner name (doubles)</label>
              <input
                className="form-input"
                placeholder="Optional — full name"
                value={form.partner}
                onChange={(e) => setForm((f) => ({ ...f, partner: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment status</label>
              <select
                className="form-select"
                value={form.paymentStatus}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentStatus: e.target.value }))
                }
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {form.paymentStatus === "unpaid" ? (
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.sendPaymentEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sendPaymentEmail: e.target.checked }))
                  }
                />
                Send payment email after adding
              </label>
            ) : null}
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md" disabled={saving}>
              {saving ? "Adding…" : "Add Player"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}