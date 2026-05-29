"use client";

import styles from "../checkin.module.css";

export default function BracketQueueSection() {
  return (
    <section className={styles.queueSection}>
      <div className={styles.queueSectionTitle}>Next Brackets in Queue for Today</div>
      <div className={styles.queueEmpty}>
        No queued brackets yet. Matches will appear here when scheduling is active.
      </div>
    </section>
  );
}
