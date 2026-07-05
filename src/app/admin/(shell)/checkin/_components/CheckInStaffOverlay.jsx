"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../checkin.module.css";
import DrivePbMark from "./DrivePbMark";
import {
  divisionAccentColor,
  filterCheckInRows,
  groupRowsByDivision,
  initialsFromName,
} from "./checkinUtils";

function formatCheckInTime(iso) {
  if (!iso) return "Checked In";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Checked In";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function CheckInStaffOverlay({
  rows,
  divisions,
  tournamentName,
  search,
  onSearchChange,
  onClose,
  onOpenKiosk,
  onCheckInSingle,
  onCheckInTeam,
  onUndo,
}) {
  const [openBrackets, setOpenBrackets] = useState(() => new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const filtered = useMemo(() => filterCheckInRows(rows, search), [rows, search]);
  const divisionGroups = useMemo(() => groupRowsByDivision(filtered), [filtered]);

  const toggleBracket = (id) => {
    setOpenBrackets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!mounted) return null;

  const content = (
    <div className={styles.checkinOverlay} role="dialog" aria-modal aria-label="Staff check-in">
      <div className={styles.checkinOverlayHeader}>
        <DrivePbMark size={22} />
        <div className={styles.checkinOverlayHeaderMeta}>
          <div className={styles.checkinOverlayTitle}>Staff View — Divisions Today</div>
          <div className={styles.checkinOverlaySub}>
            {tournamentName || "Tournament"} · {divisionGroups.length} active division
            {divisionGroups.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className={styles.checkinOverlayHeaderActions}>
          <input
            className={`form-input ${styles.staffOverlaySearch}`}
            placeholder="Search player or division…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenKiosk}>
            Player View
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Exit
          </button>
        </div>
      </div>

      <div className={styles.checkinOverlayBody}>
        {divisionGroups.length === 0 ? (
          <p className={styles.kioskEmpty}>No players match your search.</p>
        ) : (
          divisionGroups.map((group) => {
            const color = divisionAccentColor(group.bracketId);
            const divMeta = divisions.find((d) => String(d.id) === String(group.bracketId));
            const checkedCount = group.players.filter(
              (p) => p.checkInStatus === "checked_in"
            ).length;
            const allIn =
              checkedCount === group.players.length && group.players.length > 0;
            const isOpen = openBrackets.has(group.bracketId);

            return (
              <div
                key={group.bracketId}
                className={styles.kioskBracketCard}
                style={isOpen ? { borderColor: `${color}55` } : undefined}
              >
                <button
                  type="button"
                  className={styles.kioskBracketHeader}
                  onClick={() => toggleBracket(group.bracketId)}
                >
                  <span
                    className={styles.kioskBracketDot}
                    style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
                  />
                  <span className={styles.kioskBracketMeta}>
                    <span className={styles.kioskBracketName}>{group.bracketName}</span>
                    <span className={styles.kioskBracketSub}>
                      {divMeta?.roundName || divMeta?.format || "Division"} ·{" "}
                      {group.players.length} players
                    </span>
                  </span>
                  <span
                    className={`${styles.kioskBracketPill} ${allIn ? styles.kioskBracketPillDone : ""}`}
                  >
                    {allIn ? "All In" : `${checkedCount}/${group.players.length} checked in`}
                  </span>
                  <span
                    className={styles.kioskChevron}
                    style={{ transform: isOpen ? "rotate(180deg)" : undefined }}
                  >
                    ▾
                  </span>
                </button>

                {isOpen ? (
                  <div className={styles.kioskPlayerList}>
                    {[...group.players]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((row) => {
                        const checkedIn = row.checkInStatus === "checked_in";
                        const hasPartner = Boolean(row.partnerId && row.partnerName);

                        return (
                          <div
                            key={`${row.playerId}-${row.bracketId}`}
                            className={`${styles.kioskPlayerRow} ${checkedIn ? styles.kioskPlayerRowIn : ""}`}
                          >
                            <div
                              className={styles.kioskAvatar}
                              style={
                                checkedIn
                                  ? {
                                      background: "rgba(0,200,80,0.15)",
                                      borderColor: "rgba(0,200,80,0.35)",
                                      color: "#00c84a",
                                    }
                                  : undefined
                              }
                            >
                              {initialsFromName(row.name)}
                            </div>
                            <div className={styles.kioskPlayerInfo}>
                              <div className={styles.kioskPlayerName}>{row.name}</div>
                              <div className={styles.kioskPlayerSub}>
                                {row.partnerName ? `w/ ${row.partnerName}` : row.email}
                              </div>
                            </div>
                            {checkedIn ? (
                              <div className={styles.kioskPlayerActions}>
                                <span className={styles.kioskTimeIn}>
                                  {formatCheckInTime(row.checkInTime)}
                                </span>
                                <button
                                  type="button"
                                  className={styles.staffUndoBtn}
                                  onClick={() => onUndo(row)}
                                >
                                  Undo
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ fontWeight: 800 }}
                                onClick={() =>
                                  hasPartner ? onCheckInTeam(row) : onCheckInSingle(row)
                                }
                              >
                                Check In
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
