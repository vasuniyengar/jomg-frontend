"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import TournamentSwitcher from "../../_components/TournamentSwitcher";
import live from "../../_styles/livePlay.module.css";
import {
  checkInPlayer,
  checkInPlayers,
  fetchPlayersForCheckIn,
  undoCheckIn,
} from "@/lib/checkin";
import { fetchDivisions } from "@/lib/divisions";
import { fetchTournamentById, tournamentAdminPath } from "@/lib/tournaments";
import ArrivalLanding from "./ArrivalLanding";
import CheckInKioskOverlay from "./CheckInKioskOverlay";
import CheckInStaffOverlay from "./CheckInStaffOverlay";
import {
  filterCheckInRows,
  flattenRegistrations,
  playerIdsForTeamCheckIn,
} from "./checkinUtils";

export default function CheckInScreen() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [overlay, setOverlay] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [tournamentName, setTournamentName] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [kioskSearch, setKioskSearch] = useState("");

  const loadDivisions = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const divs = await fetchDivisions(tournamentId);
      setDivisions(divs);
    } catch {
      setDivisions([]);
    }
  }, [tournamentId]);

  const loadTournament = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const t = await fetchTournamentById(tournamentId);
      setTournamentName(t?.name || "");
    } catch {
      setTournamentName("");
    }
  }, [tournamentId]);

  const load = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setError("");
    try {
      const players = await fetchPlayersForCheckIn(tournamentId);
      setRows(flattenRegistrations(players, ""));
    } catch (err) {
      setError(err.message || "Failed to load players");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadDivisions();
    loadTournament();
  }, [loadDivisions, loadTournament]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => filterCheckInRows(rows, search),
    [rows, search]
  );

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

  const handleCheckInTeam = async (row) => {
    setError("");
    const playerIds = playerIdsForTeamCheckIn(row);
    try {
      await checkInPlayers(tournamentId, row.bracketId, {
        playerIds,
        eventId: row.eventId,
      });
      const label =
        playerIds.length > 1 && row.partnerName
          ? `${row.name} & ${row.partnerName}`
          : row.name;
      setMessage(`${label} checked in.`);
      load();
    } catch (err) {
      setError(err.message || "Check-in failed");
    }
  };

  const handleCheckInPlayerAll = async (player) => {
    setError("");
    try {
      const pending = player.registrations.filter(
        (r) => r.checkInStatus !== "checked_in"
      );
      for (const row of pending) {
        const playerIds = playerIdsForTeamCheckIn(row);
        if (playerIds.length > 1) {
          await checkInPlayers(tournamentId, row.bracketId, {
            playerIds,
            eventId: row.eventId,
          });
        } else {
          await checkInPlayer({
            tournamentId: Number(tournamentId),
            bracketId: row.bracketId,
            playerId: row.playerId,
            eventId: row.eventId,
          });
        }
      }
      setMessage(`${player.name} checked in.`);
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

  if (!tournamentId) {
    return <TournamentPicker label="Arrival Center" />;
  }

  return (
    <div className="screen active">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 4 · Control Hub</div>
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
            placeholder="Search player or team…"
            style={{ width: 220, padding: "8px 14px", fontSize: 13 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost btn-md"
            title="Coming soon"
            disabled
          >
            Welcome Screen
          </button>
          <TournamentSwitcher tournamentId={tournamentId} />
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

        <ArrivalLanding
          checkedIn={checkedIn}
          notArrived={notArrived}
          loading={loading}
          onOpenStaff={() => setOverlay("staff")}
          onOpenKiosk={() => setOverlay("kiosk")}
          onCheckIn={handleCheckIn}
          onCheckInTeam={handleCheckInTeam}
          onUndo={handleUndo}
        />
      </div>

      {overlay === "staff" ? (
        <CheckInStaffOverlay
          rows={rows}
          divisions={divisions}
          tournamentName={tournamentName}
          search={staffSearch}
          onSearchChange={setStaffSearch}
          onClose={() => setOverlay(null)}
          onOpenKiosk={() => setOverlay("kiosk")}
          onCheckInSingle={handleCheckIn}
          onCheckInTeam={handleCheckInTeam}
          onUndo={handleUndo}
        />
      ) : null}

      {overlay === "kiosk" ? (
        <CheckInKioskOverlay
          rows={rows}
          tournamentName={tournamentName}
          stats={stats}
          search={kioskSearch}
          onSearchChange={setKioskSearch}
          onClose={() => setOverlay(null)}
          onOpenStaff={() => setOverlay("staff")}
          onCheckInPlayer={handleCheckInPlayerAll}
        />
      ) : null}
    </div>
  );
}
