"use client";

import CheckInRow from "../../_components/live/CheckInRow";
import live from "../../_styles/livePlay.module.css";
import styles from "../checkin.module.css";
import BracketQueueSection from "./BracketQueueSection";

export default function ArrivalLanding({
  checkedIn,
  notArrived,
  loading,
  onOpenStaff,
  onOpenKiosk,
  onCheckIn,
  onCheckInTeam,
  onUndo,
}) {
  return (
    <>
      <div className={styles.landingCards}>
        <button type="button" className={styles.landingCard} onClick={onOpenStaff}>
          <div className={styles.landingCardIcon}>🗂</div>
          <div className={styles.landingCardText}>
            <div className={styles.landingCardTitle}>Staff View</div>
            <div className={styles.landingCardDesc}>
              Manage check-ins division by division. Check in players manually.
            </div>
          </div>
          <span className={styles.landingCardArrow} aria-hidden>
            →
          </span>
        </button>

        <button
          type="button"
          className={`${styles.landingCard} ${styles.landingCardPrimary}`}
          onClick={onOpenKiosk}
        >
          <div className={`${styles.landingCardIcon} ${styles.landingCardIconPrimary}`}>👋</div>
          <div className={styles.landingCardText}>
            <div className={`${styles.landingCardTitle} ${styles.landingCardTitlePrimary}`}>
              Self Check-In Station
            </div>
            <div className={styles.landingCardDesc}>
              Tablet kiosk for players to check themselves in.
            </div>
          </div>
          <span className={styles.landingCardArrow} aria-hidden>
            →
          </span>
        </button>
      </div>

      {loading ? <p style={{ fontSize: 13, color: "var(--text-sec)", marginBottom: 16 }}>Loading…</p> : null}

      <div className={live.checkinTwoCol}>
        <div>
          <div className={live.checkinColHeader}>
            Checked In <span style={{ color: "#00c84a" }}>●</span>
            <span className={`${live.checkinColCount} ${live.checkinColCountIn}`}>
              {checkedIn.length}
            </span>
          </div>
          {checkedIn.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-sec)" }}>No one checked in yet.</p>
          ) : (
            checkedIn.map((row) => (
              <CheckInRow
                key={`${row.playerId}-${row.bracketId}`}
                row={row}
                onUndo={onUndo}
              />
            ))
          )}
        </div>
        <div>
          <div className={live.checkinColHeader}>
            Not Yet Arrived <span style={{ color: "#ff5555" }}>●</span>
            <span
              className={`${live.checkinColCount} ${live.checkinColCountOut}`}
              style={{
                color: "#ff5555",
                background: "rgba(255, 68, 68, 0.12)",
                border: "1px solid rgba(255, 68, 68, 0.3)",
              }}
            >
              {notArrived.length}
            </span>
          </div>
          {notArrived.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-sec)" }}>Everyone has checked in.</p>
          ) : (
            notArrived.map((row) => (
              <CheckInRow
                key={`${row.playerId}-${row.bracketId}`}
                row={row}
                onCheckIn={onCheckIn}
                onCheckInTeam={onCheckInTeam}
              />
            ))
          )}
        </div>
      </div>

      <BracketQueueSection />
    </>
  );
}
