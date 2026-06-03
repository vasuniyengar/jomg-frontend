"use client";

import {
  displayStatus,
  tournamentAdminPath,
} from "@/lib/tournaments";
import Link from "next/link";

const STEPS = ["draft", "active", "ongoing", "completed"];

const STEP_META = {
  draft: { label: "Draft" },
  active: { label: "Published" },
  ongoing: { label: "Live" },
  completed: { label: "Done" },
};

export default function StatusControlModal({
  open,
  onClose,
  tournamentId,
  status,
  settingsConfirmed,
  slug,
  onStatusChange,
  updating,
}) {
  if (!open) return null;

  const currentIdx = STEPS.indexOf(status);
  const isPublished =
    status === "active" || status === "ongoing" || status === "completed";
  const isLive = status === "ongoing";
  const isCompleted = status === "completed";

  const handlePublishToggle = async (checked) => {
    if (checked) {
      if (!settingsConfirmed) return;
      await onStatusChange("active");
    } else {
      await onStatusChange("draft");
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          maxWidth: 580,
          width: "100%",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
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
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              Tournament Status
            </div>
            <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 2 }}>
              Control publishing visibility and event-day state
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "18px 24px", overflowY: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr",
              gap: 6,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            {STEPS.map((s, i) => {
              const isDone = i < currentIdx;
              const isCurrent = i === currentIdx;
              const meta = STEP_META[s];
              const color = isDone
                ? "#10b981"
                : isCurrent
                  ? "var(--primary-text)"
                  : "var(--text-ter)";
              return (
                <span key={s} style={{ display: "contents" }}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "8px 4px",
                      background: isDone
                        ? "rgba(16,185,129,0.15)"
                        : isCurrent
                          ? "var(--primary-dim)"
                          : "var(--badge-bg)",
                      border: `1px solid ${
                        isDone
                          ? "rgba(16,185,129,0.35)"
                          : isCurrent
                            ? "var(--primary-border)"
                            : "var(--border)"
                      }`,
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ fontSize: 14, color }}>{isDone ? "✓" : isCurrent ? "●" : "○"}</div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: isCurrent ? 800 : 600,
                        textTransform: "uppercase",
                        color,
                        marginTop: 3,
                      }}
                    >
                      {meta.label}
                    </div>
                  </div>
                  {i < STEPS.length - 1 ? (
                    <div style={{ color: isDone ? "#10b981" : "var(--border-mid)", fontSize: 12 }}>
                      →
                    </div>
                  ) : null}
                </span>
              );
            })}
          </div>

          <div
            style={{
              padding: 16,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              marginBottom: 12,
              opacity: isCompleted ? 0.55 : 1,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>Publish Tournament</div>
                <div style={{ fontSize: 12, color: "var(--text-sec)", marginTop: 4 }}>
                  Make your tournament page live for player registration.
                </div>
              </div>
              <label className="mini-toggle">
                <input
                  type="checkbox"
                  checked={isPublished}
                  disabled={isLive || isCompleted || updating}
                  onChange={(e) => handlePublishToggle(e.target.checked)}
                />
                <span className="mini-slider" />
              </label>
            </div>
            {!isPublished && !settingsConfirmed ? (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  fontSize: 12,
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                Before publishing:{" "}
                <Link
                  href={tournamentAdminPath("/admin/settings", tournamentId)}
                  style={{ color: "#f59e0b", textDecoration: "underline" }}
                  onClick={onClose}
                >
                  Confirm tournament settings
                </Link>
                .
              </div>
            ) : null}
            {isPublished && slug ? (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-sec)" }}>
                Public slug: <code>{slug}</code>
              </div>
            ) : null}
          </div>

          <div
            style={{
              padding: 16,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              marginBottom: 12,
              opacity: isPublished ? 1 : 0.55,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Start Tournament (Go Live)</div>
            <div style={{ fontSize: 12, color: "var(--text-sec)", marginBottom: 12 }}>
              Mark as live on event day when brackets are ready. Enables live operations.
            </div>
            <button
              type="button"
              className="btn btn-primary btn-md"
              disabled={!isPublished || isLive || isCompleted || updating}
              onClick={() => onStatusChange("ongoing")}
            >
              {isLive ? "✓ Live" : "Start →"}
            </button>
          </div>

          <div
            style={{
              padding: 16,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              opacity: isLive ? 1 : 0.55,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Complete Tournament</div>
            <button
              type="button"
              className="btn btn-ghost btn-md"
              disabled={!isLive || isCompleted || updating}
              onClick={() => {
                if (
                  window.confirm(
                    "Mark this tournament as completed? Results will be locked."
                  )
                ) {
                  onStatusChange("completed");
                }
              }}
            >
              {isCompleted ? "✓ Completed" : "Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
