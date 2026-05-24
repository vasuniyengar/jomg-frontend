"use client";

import live from "../../_styles/livePlay.module.css";

function formatCheckInTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function CheckInRow({ row, onCheckIn, onUndo }) {
  const checkedIn = row.checkInStatus === "checked_in";

  return (
    <div
      className={`${live.checkinRow} ${
        checkedIn ? live.checkinRowCheckedIn : live.checkinRowNotChecked
      }`}
    >
      <div className={`${live.checkinDot} ${checkedIn ? live.checkinDotIn : live.checkinDotOut}`} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className={live.checkinPlayerName}>{row.name}</div>
        <div className={live.checkinPartner}>{row.email}</div>
      </div>
      <span className={live.checkinTeam}>{row.bracketName}</span>
      {checkedIn ? (
        <span className={live.checkinTime}>{formatCheckInTime(row.checkInTime) || "—"}</span>
      ) : null}
      {checkedIn ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ fontSize: 11, padding: "4px 10px", color: "var(--text-ter)" }}
          onClick={() => onUndo?.(row)}
        >
          Undo
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ fontSize: 11, padding: "4px 12px" }}
          onClick={() => onCheckIn?.(row)}
        >
          Check in
        </button>
      )}
    </div>
  );
}
