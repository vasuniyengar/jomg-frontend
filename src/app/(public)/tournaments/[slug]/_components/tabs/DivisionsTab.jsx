"use client";

import { useMemo, useState } from "react";
import { fetchPublicDivisionDetail } from "@/lib/publicTournament";
import TeamRow from "../shared/TeamRow";
import DivisionDetail from "./DivisionDetail";

export default function DivisionsTab({ data, slug, preview = false }) {
  const [selectedDayId, setSelectedDayId] = useState(data.days[0]?.id ?? "");
  const [selectedDivisionId, setSelectedDivisionId] = useState(null);
  const [divisionDetails, setDivisionDetails] = useState(data.details || {});
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  const selectedDay = useMemo(
    () => data.days.find((d) => d.id === selectedDayId) ?? data.days[0],
    [data.days, selectedDayId]
  );

  const divisionDetail = selectedDivisionId
    ? divisionDetails?.[selectedDivisionId] ?? null
    : null;

  const openDivision = async (division) => {
    if (!division.hasDetail) return;
    setSelectedDivisionId(division.id);
    window.scrollTo(0, 0);

    if (!slug) return;

    setLoadingDetail(true);
    setDetailError("");
    try {
      const detail = await fetchPublicDivisionDetail(slug, division.id, { preview });
      setDivisionDetails((prev) => ({ ...prev, [division.id]: detail }));
    } catch (err) {
      setDetailError(err.message || "Failed to load division detail");
    } finally {
      setLoadingDetail(false);
    }
  };

  if (selectedDivisionId) {
    return (
      <div className="o3-pane active">
        {loadingDetail && !divisionDetail ? (
          <div className="dv-empty">Loading division…</div>
        ) : null}
        {detailError ? (
          <div className="dv-empty" style={{ color: "#ef4444" }}>
            {detailError}
          </div>
        ) : null}
        {divisionDetail ? (
          <DivisionDetail
            detail={divisionDetail}
            onBack={() => setSelectedDivisionId(null)}
          />
        ) : null}
      </div>
    );
  }

  if (!data.days?.length) {
    return (
      <div className="o3-pane active">
        <p className="dv-note">{data.note}</p>
        <div className="dv-empty">No public divisions are available for this tournament.</div>
      </div>
    );
  }

  return (
    <div className="o3-pane active">
      <p className="dv-note">{data.note}</p>
      <div className="tl-days">
        {data.days.map((day) => (
          <button
            type="button"
            key={day.id}
            className={`tl-day${selectedDayId === day.id ? " active" : ""}`}
            onClick={() => setSelectedDayId(day.id)}
          >
            <div className="tl-day-l">{day.label}</div>
            <div className="tl-day-s">{day.subtitle}</div>
          </button>
        ))}
      </div>

      <div className="tl-pane active">
        <div className="tl-track">
          {(selectedDay?.divisions || []).map((division) => (
            <details className="tl-stop" key={division.id} open>
              <summary className="tl-head">
                <div className="tl-timeCol">
                  <div className="tl-sl">Start Time</div>
                  <div className="tl-time">{division.time}</div>
                </div>
                <div className="tl-main">
                  <div className="tl-name">{division.name}</div>
                  <div className="tl-sub">{division.sub}</div>
                </div>
                <div className="tl-stats">
                  <div>
                    <div className="tl-sn">{division.teamCount}</div>
                    <div className="tl-sl">Teams</div>
                  </div>
                  <div>
                    <div className="tl-sn">{division.playerCount}</div>
                    <div className="tl-sl">Players</div>
                  </div>
                </div>
                <div className="tl-chev">▾</div>
              </summary>
              <div className="tl-body">
                <div className="tl-bar">
                  <span className="tl-bar-l">{division.barLabel}</span>
                  <button
                    type="button"
                    className="tl-viewdv"
                    disabled={!division.hasDetail}
                    onClick={() => openDivision(division)}
                  >
                    View full division →
                  </button>
                </div>
                {division.previewTeam ? (
                  <TeamRow team={division.previewTeam} />
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
