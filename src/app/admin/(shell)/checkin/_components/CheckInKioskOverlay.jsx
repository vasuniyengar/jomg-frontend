"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../checkin.module.css";
import DrivePbMark from "./DrivePbMark";
import {
  divisionAccentColor,
  filterKioskPlayers,
  initialsFromName,
  uniquePlayersFromRows,
} from "./checkinUtils";

function formatCheckInTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function CheckInKioskOverlay({
  rows,
  tournamentName,
  stats,
  search,
  onSearchChange,
  onClose,
  onOpenStaff,
  onCheckInPlayer,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const players = useMemo(() => uniquePlayersFromRows(rows), [rows]);
  const filtered = useMemo(() => filterKioskPlayers(players, search), [players, search]);

  const pendingPlayers = useMemo(() => {
    const q = search.trim();
    const list = q
      ? filtered
      : filtered.filter((p) => !p.checkedIn).sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filtered, search]);

  const hiddenCheckedCount = useMemo(
    () => players.filter((p) => p.checkedIn).length,
    [players]
  );

  const pct = stats.total ? Math.round((stats.checked / stats.total) * 100) : 0;
  const dashOffset = stats.total ? (stats.checked / stats.total) * 100 : 0;

  if (!mounted) return null;

  const content = (
    <div className={styles.checkinOverlay} role="dialog" aria-modal aria-label="Self check-in">
      <div className={styles.kioskOverlayHeader}>
        <div className={styles.kioskOverlayHeaderLeft}>
          <DrivePbMark size={24} />
          <div>
            <div className={styles.kioskOverlayBrand}>DRIVE PB · Player Arrival</div>
            <div className={styles.kioskOverlayEvent}>
              {tournamentName || "Tournament"}
            </div>
          </div>
        </div>
        <div className={styles.kioskOverlayProgress}>
          <div className={styles.kioskOverlayProgressText}>
            <div className={styles.kioskProgressLabel}>Checked In</div>
            <div className={styles.kioskProgressValue}>
              {stats.checked}
              <span className={styles.kioskProgressTotal}>/{stats.total}</span>
            </div>
          </div>
          <div className={styles.kioskProgressRing} aria-hidden>
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#00c84a"
                strokeWidth="3"
                strokeDasharray={`${dashOffset.toFixed(1)} 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span className={styles.kioskProgressRingPct}>{pct}%</span>
          </div>
        </div>
        <div className={styles.checkinOverlayHeaderActions}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenStaff}>
            Staff View
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Exit
          </button>
        </div>
      </div>

      <div className={styles.kioskOverlaySearchBar}>
        <input
          className={`form-input ${styles.kioskOverlaySearch}`}
          placeholder="Search by name or division…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className={styles.kioskOverlayGridWrap}>
        <div className={styles.kioskPlayerGrid}>
          {pendingPlayers.map((player) => {
            const isIn = player.checkedIn;
            const todayDivs = player.registrations;

            return (
              <button
                key={player.playerId}
                type="button"
                className={`${styles.kioskPlayerCard} ${isIn ? styles.kioskPlayerCardDone : ""}`}
                disabled={isIn}
                onClick={() => !isIn && onCheckInPlayer(player)}
              >
                <div
                  className={styles.kioskPlayerCardAvatar}
                  style={
                    isIn
                      ? {
                          background: "rgba(0,200,80,0.15)",
                          borderColor: "rgba(0,200,80,0.4)",
                          color: "#00c84a",
                        }
                      : undefined
                  }
                >
                  {isIn ? "✓" : initialsFromName(player.name)}
                </div>
                <div className={styles.kioskPlayerCardBody}>
                  <div className={styles.kioskPlayerCardName}>{player.name}</div>
                  <div className={styles.kioskPlayerCardChips}>
                    {todayDivs.map((r) => (
                      <span
                        key={`${r.bracketId}-${r.playerId}`}
                        className={styles.kioskDivChip}
                        style={{
                          background: `${divisionAccentColor(r.bracketId)}22`,
                          borderColor: `${divisionAccentColor(r.bracketId)}55`,
                          color: divisionAccentColor(r.bracketId),
                        }}
                      >
                        {r.bracketName}
                      </span>
                    ))}
                  </div>
                  <div className={styles.kioskPlayerCardEmail}>{player.email}</div>
                  {isIn ? (
                    <div className={styles.kioskPlayerCardChecked}>
                      Checked in {formatCheckInTime(player.checkInTime)}
                    </div>
                  ) : (
                    <div className={styles.kioskPlayerCardCta}>Check In →</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {!search.trim() && hiddenCheckedCount > 0 ? (
          <p className={styles.kioskCheckedFooter}>
            {hiddenCheckedCount} player{hiddenCheckedCount !== 1 ? "s" : ""} already checked in
            and hidden
          </p>
        ) : null}
      </div>

      <div className={styles.kioskOverlayFooter}>
        Tap your name to check in · Staff at the welcome desk can help
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
