"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import CheckInRow from "../../_components/live/CheckInRow";
import live from "../../_styles/livePlay.module.css";
import {
  checkInAllPlayers,
  checkInPlayer,
  fetchPlayersForCheckIn,
  undoCheckIn,
} from "@/lib/checkin";
import { fetchDivisions } from "@/lib/divisions";
import { tournamentAdminPath } from "@/lib/tournaments";

function flattenRegistrations(players, bracketId) {
  const rows = [];
  for (const p of players || []) {
    for (const ev of p.events || []) {
      if (bracketId && String(ev.bracketId) !== String(bracketId)) continue;
      rows.push({
        playerId: p.playerId,
        name: p.name,
        email: p.email,
        bracketId: ev.bracketId,
        bracketName: ev.bracketName,
        eventId: ev.eventId,
        checkInStatus: ev.checkInStatus,
        checkInTime: ev.checkInTime,
        registrationId: ev.registrationId,
      });
    }
  }
  return rows;
}

export default function CheckInScreen() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [divisions, setDivisions] = useState([]);
  const [bracketId, setBracketId] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const loadDivisions = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const divs = await fetchDivisions(tournamentId);
      setDivisions(divs);
      if (!bracketId && divs[0]) setBracketId(String(divs[0].id));
    } catch {
      setDivisions([]);
    }
  }, [tournamentId, bracketId]);

  const load = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setError("");
    try {
      const players = await fetchPlayersForCheckIn(tournamentId, {
        bracketId: bracketId || undefined,
      });
      setRows(flattenRegistrations(players, bracketId));
    } catch (err) {
      setError(err.message || "Failed to load players");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, bracketId]);

  useEffect(() => {
    loadDivisions();
  }, [loadDivisions]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.bracketName.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const checkedIn = useMemo(
    () => filtered.filter((r) => r.checkInStatus === "checked_in"),
    [filtered]
  );
  const notArrived = useMemo(
    () => filtered.filter((r) => r.checkInStatus !== "checked_in"),
    [filtered]
  );

  const stats = useMemo(() => {
    const total = rows.length;
    const checked = rows.filter((r) => r.checkInStatus === "checked_in").length;
    const pct = total ? Math.round((checked / total) * 100) : 0;
    return { total, checked, pct };
  }, [rows]);

  const handleCheckIn = async (row) => {
    setError("");
    try {
      await checkInPlayer({
        tournamentId: Number(tournamentId),
        bracketId: row.bracketId,
        playerId: row.playerId,
        eventId: row.eventId,
      });
      setMessage(`${row.name} checked in.`);
      load();
    } catch (err) {
      setError(err.message || "Check-in failed");
    }
  };

  const handleUndo = async (row) => {
    setError("");
    try {
      await undoCheckIn({
        tournamentId: Number(tournamentId),
        bracketId: row.bracketId,
        playerId: row.playerId,
      });
      setMessage(`${row.name} check-in removed.`);
      load();
    } catch (err) {
      setError(err.message || "Undo failed");
    }
  };

  const handleCheckInAll = async () => {
    if (!bracketId) return;
    const pending = rows.filter((r) => r.checkInStatus !== "checked_in");
    if (!pending.length) return;
    setError("");
    try {
      await checkInAllPlayers(tournamentId, bracketId, {
        playerIds: pending.map((r) => r.playerId),
        eventId: pending[0]?.eventId,
      });
      setMessage(`Checked in ${pending.length} players.`);
      load();
    } catch (err) {
      setError(err.message || "Bulk check-in failed");
    }
  };

  if (!tournamentId) {
    return (
      <div className="screen active">
        <div className="page-header">
          <div className="page-title">Arrival Center</div>
        </div>
        <div className="content">
          <p>Select a tournament from My Tournaments first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 4 · Live Play</div>
          <div className="page-title">Arrival Center</div>
          <div className="page-sub">
            Team check-in ·{" "}
            <span style={{ color: "#00c84a" }}>
              ● {stats.checked} of {stats.total} checked in ({stats.pct}%)
            </span>
          </div>
        </div>
        <div className="page-actions">
          <input
            className="form-input"
            placeholder="Search player or division…"
            style={{ width: 220, padding: "8px 14px", fontSize: 13 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TournamentPicker tournamentId={tournamentId} />
          <Link
            href={tournamentAdminPath("/admin/bracket", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            Bracket Progression →
          </Link>
        </div>
      </div>

      <div className="content">
        {error ? <div className={live.errorBanner}>{error}</div> : null}
        {message ? (
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            {message}
          </div>
        ) : null}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          <select
            className="form-select"
            style={{ maxWidth: 280 }}
            value={bracketId}
            onChange={(e) => setBracketId(e.target.value)}
          >
            <option value="">All divisions</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleCheckInAll}
            disabled={!bracketId || loading}
          >
            Check in all pending
          </button>
        </div>

        {loading ? <p>Loading…</p> : null}

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
                  onUndo={handleUndo}
                />
              ))
            )}
          </div>
          <div>
            <div className={live.checkinColHeader}>
              Not Yet Arrived
              <span className={`${live.checkinColCount} ${live.checkinColCountOut}`}>
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
                  onCheckIn={handleCheckIn}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
