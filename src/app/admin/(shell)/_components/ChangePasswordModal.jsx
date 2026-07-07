"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";

export default function ChangePasswordModal({ onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      onSuccess?.();
    } catch (error) {
      setErrorMessage(error.message || "Unable to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        display: "flex",
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 375,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <div
          style={{
            padding: "20px 24px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              id="change-password-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              Change Password
            </div>
            <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>
              You will be signed out after updating your password.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "18px 24px 24px" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="current-password">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          <p style={{ fontSize: 11, color: "var(--text-ter)", marginBottom: 16 }}>
            Use 8–30 characters with at least one letter and one number.
          </p>

          {errorMessage ? (
            <div
              style={{
                marginBottom: 14,
                color: "#ff7b7b",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
