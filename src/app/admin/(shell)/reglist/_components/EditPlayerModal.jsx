"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { updateRegistration } from "@/lib/divisions";
import styles from "../reglist.module.css";

const STATUS_OPTIONS = [
  { value: "registered", label: "Registered" },
  { value: "completed", label: "Completed" },
  { value: "withdraw", label: "Withdrawn" },
  { value: "not_registered", label: "Not registered" },
];

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstname: "", lastname: "" };
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(" "),
  };
}

export default function EditPlayerModal({
  open,
  onClose,
  tournamentId,
  player,
  divisions = [],
  onSaved,
}) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !player) return;
    const { firstname, lastname } = splitName(player.name);
    setForm({
      firstname: player.firstname || firstname,
      lastname: player.lastname || lastname,
      email: player.email || "",
      phoneNumber: player.phone === "—" ? "" : player.phone || "",
      age: player.age === "—" ? "30" : String(player.age || "30"),
      gender: player.gender === "F" ? "female" : "male",
      bracketId: player.bracketId ? String(player.bracketId) : "",
      clubName: player.clubName || "",
      partner: player.partner === "—" ? "" : player.partner || "",
      duprRating: player.duprRaw ?? "",
      duprId: player.duprId || "",
      rosterNumber: player.rosterNumber || "",
      playerRole: player.playerRole || "starter",
      status: player.registrationStatus || "registered",
    });
    setError("");
  }, [open, player]);

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

  if (!open || !mounted || !form || !player?.registrationId) return null;

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
        bracketId: Number(form.bracketId),
        clubName: form.clubName.trim(),
        partner: form.partner.trim() || undefined,
        rosterNumber: form.rosterNumber.trim() || undefined,
        playerRole: form.playerRole || undefined,
        status: form.status,
        duprId: form.duprId.trim() || undefined,
      };
      if (form.duprRating !== "") {
        payload.duprRating = Number(form.duprRating);
      }
      await updateRegistration(tournamentId, player.registrationId, payload);
      await onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update player");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-player-title"
      onClick={onClose}
    >
      <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="edit-player-title" className={styles.modalTitle}>
            Edit Player
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
              <label className="form-label">Division</label>
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
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">First name</label>
                <input
                  className="form-input"
                  required
                  minLength={2}
                  value={form.firstname}
                  onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
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
              <label className="form-label">Email</label>
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
                required
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Age</label>
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
            </div>
            <div className="form-group">
              <label className="form-label">DUPR ID</label>
              <input
                className="form-input"
                placeholder="Optional account ID"
                value={form.duprId}
                onChange={(e) => setForm((f) => ({ ...f, duprId: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Club</label>
              <input
                className="form-input"
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Roster #</label>
                <input
                  className="form-input"
                  value={form.rosterNumber}
                  onChange={(e) => setForm((f) => ({ ...f, rosterNumber: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={form.playerRole}
                  onChange={(e) => setForm((f) => ({ ...f, playerRole: e.target.value }))}
                >
                  <option value="starter">Starter</option>
                  <option value="bench">Bench</option>
                  <option value="captain">Captain</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Registration status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-ghost btn-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
