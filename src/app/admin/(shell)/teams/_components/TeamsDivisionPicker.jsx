"use client";

import styles from "../teams.module.css";
import { divisionSelectLabel, formatDivisionDay } from "@/lib/teamsUi";

export default function TeamsDivisionPicker({
  rows,
  selectedId,
  onSelect,
}) {
  const sorted = [...rows];
  const idx = sorted.findIndex((r) => String(r.id) === String(selectedId));
  const prevId = idx > 0 ? sorted[idx - 1].id : null;
  const nextId = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1].id : null;
  const current = sorted.find((r) => String(r.id) === String(selectedId));

  const byDay = {};
  const noDay = [];
  sorted.forEach((d) => {
    if (d.startDate) {
      (byDay[d.startDate] = byDay[d.startDate] || []).push(d);
    } else {
      noDay.push(d);
    }
  });
  const dayKeys = Object.keys(byDay).sort();

  return (
    <div className={styles.divTabs} id="teams-div-tabs">
      <div className={styles.divTabsLabel}>Division</div>
      <select
        className={styles.divSelect}
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        {dayKeys.map((day) => (
          <optgroup key={day} label={formatDivisionDay(day)}>
            {byDay[day].map((d) => (
              <option key={d.id} value={d.id}>
                {divisionSelectLabel(d)}
              </option>
            ))}
          </optgroup>
        ))}
        {noDay.length ? (
          <optgroup label="No date set">
            {noDay.map((d) => (
              <option key={d.id} value={d.id}>
                {divisionSelectLabel(d)}
              </option>
            ))}
          </optgroup>
        ) : null}
      </select>

      {current ? (
        <div className={styles.divSummary}>
          <span className={styles.divDot} style={{ background: current.color }} aria-hidden />
          <div>
            <div style={{ fontSize: 11, color: "var(--text-sec)" }}>
              <strong style={{ color: "var(--text)" }}>{current.teamCount}</strong>/
              {current.max} {current.entryWord} · {current.format}
            </div>
            <div className="progress-bar" style={{ width: 160, height: 4, marginTop: 3 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${current.max ? Math.min(100, Math.round((current.teamCount / current.max) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.divNav}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!prevId}
          onClick={() => prevId && onSelect(prevId)}
          title="Previous division"
        >
          ◀
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!nextId}
          onClick={() => nextId && onSelect(nextId)}
          title="Next division"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
