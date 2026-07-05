"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import TournamentSwitcher from "../../_components/TournamentSwitcher";
import MatchScoreCard from "./MatchScoreCard";
import {
  emptyMlpMatchState,
  finalGamesWon,
  hydrateCompletedState,
  isMlpDivision,
} from "./mlpScoring";
import {
  classifyDivisionProgress,
  fetchFinalStandings,
  fetchOrCreatePlayoffs,
  loadScoreEntryBracket,
  updateMatchScore,
} from "@/lib/bracketProgression";
import { fetchDivisions } from "@/lib/divisions";
import { fetchTournamentById, tournamentAdminPath } from "@/lib/tournaments";
import { mergeTournamentSettings } from "@/lib/tournamentSettings";
import styles from "../scoreentry.module.css";

function divisionStatusMeta(progress) {
  if (progress === "completed") {
    return { label: "Completed", color: "#00c84a", phase: "complete" };
  }
  if (progress === "in_progress") {
    return { label: "In progress", color: "var(--primary-text)", phase: "live" };
  }
  return { label: "Yet to start", color: "#e0a000", phase: "pending" };
}

function playerDisplayName(player) {
  if (!player) return "";
  if (typeof player === "string") return player;
  return [player.firstname, player.lastname].filter(Boolean).join(" ") || "—";
}

function groupMatchesByRound(matches) {
  const map = new Map();
  for (const m of matches) {
    const r = m.roundNumber || 1;
    if (!map.has(r)) map.set(r, []);
    map.get(r).push(m);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

function teamPlayersById(pools) {
  const byId = {};
  for (const pool of pools) {
    for (const t of pool.teams || []) {
      byId[t.id] = t.players || [];
    }
  }
  return byId;
}

function TeamsTab({ pools }) {
  const teams = [];
  pools.forEach((pool, poolIndex) => {
    (pool.teams || []).forEach((t) => {
      teams.push({
        id: t.id,
        teamName: t.teamName || `Team ${t.id}`,
        poolName: pool.poolName || `Pool ${poolIndex + 1}`,
        players: t.players || [],
        stats: t.stats || null,
      });
    });
  });

  if (!teams.length) {
    return (
      <div className={styles.emptyState}>
        No teams in this division yet. Assign teams to pools first.
      </div>
    );
  }

  return (
    <div className={styles.teamsList}>
      {teams.map((t, i) => (
        <div key={`${t.poolName}-${t.id}`} className={styles.teamRow}>
          <span className={styles.teamIndex}>{i + 1}</span>
          <div className={styles.teamInfo}>
            <div className={styles.teamName}>
              {t.teamName}
              <span className={styles.teamPoolBadge}>{t.poolName}</span>
            </div>
            <div className={styles.teamPlayers}>
              {t.players.length
                ? t.players.map(playerDisplayName).filter(Boolean).join(" · ")
                : "No players listed"}
            </div>
          </div>
          <div className={styles.teamRecord}>
            Record
            <br />
            <strong>
              {t.stats?.wins ?? 0}–{t.stats?.losses ?? 0}
            </strong>
          </div>
        </div>
      ))}
    </div>
  );
}

function StandingsSubTabs({ active, onChange }) {
  return (
    <div className={styles.standingsSubTabs}>
      {[
        { k: "pool", label: "Pool Overview" },
        { k: "bracket", label: "Bracket Standings" },
      ].map((t) => (
        <button
          key={t.k}
          type="button"
          className={`${styles.standingsSubBtn}${active === t.k ? ` ${styles.standingsSubBtnOn}` : ""}`}
          onClick={() => onChange(t.k)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function PoolOverviewTab({ pools, onScoreMatches }) {
  return (
    <div className={styles.standingsStack}>
      {pools.map((pool) => {
        const teams = [...(pool.teams || [])].sort((a, b) => {
          const aw = a.stats?.wins ?? 0;
          const bw = b.stats?.wins ?? 0;
          if (bw !== aw) return bw - aw;
          return (b.stats?.pointDifference ?? 0) - (a.stats?.pointDifference ?? 0);
        });
        const played = pool.matches.filter((m) => m.status === "completed").length;
        const total = pool.matches.length;
        const statusTxt =
          played === total
            ? "All games played"
            : `${played} of ${total} matches played`;
        const statusColor = played === total ? "#00c84a" : "#e0a000";

        return (
          <div key={pool.id} className={styles.poolOverviewCard}>
            <div className={styles.poolOverviewHead}>
              <div className={styles.poolOverviewTitle}>{pool.poolName}</div>
              <div className={styles.poolMeta}>
                {pool.scoring || "Pool play"}
              </div>
              <div className={styles.poolOverviewActions}>
                <span
                  className={styles.poolProgress}
                  style={{ color: statusColor }}
                >
                  {statusTxt}
                </span>
                <button
                  type="button"
                  className={styles.scoreMatchesBtn}
                  onClick={onScoreMatches}
                >
                  Score Matches →
                </button>
              </div>
            </div>
            <table className={styles.poolOverviewTable}>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>W</th>
                  <th>L</th>
                  <th>PF</th>
                  <th>PA</th>
                  <th>PD</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => {
                  const pd = t.stats?.pointDifference ?? 0;
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className={styles.standingsTeamCell}>
                          <span className={styles.standingsRank}>{i + 1}</span>
                          <strong>{t.teamName || `Team ${t.id}`}</strong>
                        </div>
                      </td>
                      <td className={styles.standingsNum}>{t.stats?.wins ?? 0}</td>
                      <td className={styles.standingsMuted}>{t.stats?.losses ?? 0}</td>
                      <td className={styles.standingsMuted}>{t.stats?.pointsFor ?? 0}</td>
                      <td className={styles.standingsMuted}>{t.stats?.pointsAgainst ?? 0}</td>
                      <td
                        className={styles.standingsPd}
                        style={{
                          color:
                            pd > 0 ? "#00c84a" : pd < 0 ? "#ff5555" : "var(--text-sec)",
                        }}
                      >
                        {pd > 0 ? "+" : ""}
                        {pd}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={styles.matchStatusStrip}>
              <div className={styles.matchStatusLabel}>Match Status</div>
              {pool.matches.map((m, idx) => {
                const done = m.status === "completed";
                const lbl = done ? "Completed" : "Pending";
                const lblColor = done ? "#00c84a" : "#e0a000";
                const lblBg = done ? "rgba(0,200,80,0.12)" : "rgba(224,160,0,0.12)";
                return (
                  <div key={m.matchId} className={styles.matchStatusRow}>
                    <span className={styles.matchStatusRound}>
                      R{m.roundNumber || 1}
                    </span>
                    <span className={styles.matchStatusTeams}>
                      {m.team1Name}{" "}
                      <span className={styles.matchVs}>vs</span> {m.team2Name}
                    </span>
                    {done ? (
                      <span className={styles.matchStatusScore}>
                        games {m.scoreTeam1}–{m.scoreTeam2}
                      </span>
                    ) : null}
                    <span
                      className={styles.matchStatusPill}
                      style={{ color: lblColor, background: lblBg }}
                    >
                      {lbl}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BracketStandingsTab({ standings, loading }) {
  if (loading) {
    return <div className={styles.emptyState}>Loading bracket standings…</div>;
  }
  if (!standings.length) {
    return (
      <div className={styles.emptyState}>
        Bracket standings will appear after playoffs are generated and played.
      </div>
    );
  }

  return (
    <div className={styles.bracketStandingsCard}>
      <table className={styles.poolOverviewTable}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Medal</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr key={s.teamId || s.finalRank}>
              <td className={styles.standingsNum}>{s.finalRank ?? "—"}</td>
              <td>
                <strong>{s.teamName || "—"}</strong>
              </td>
              <td className={styles.standingsMuted}>{s.medal || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ScoreEntryScreen() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [divisions, setDivisions] = useState([]);
  const [bracketId, setBracketId] = useState("");
  const [progressByDiv, setProgressByDiv] = useState({});
  const [pools, setPools] = useState([]);
  const [playoffMatches, setPlayoffMatches] = useState([]);
  const [tab, setTab] = useState("rr");
  const [standingsSub, setStandingsSub] = useState("pool");
  const [bracketStandings, setBracketStandings] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [poolCols, setPoolCols] = useState(2);
  const [expandedId, setExpandedId] = useState("");
  const [drafts, setDrafts] = useState({});
  const [matchStates, setMatchStates] = useState({});
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [filling, setFilling] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedDivision = useMemo(
    () => divisions.find((d) => String(d.id) === String(bracketId)) || null,
    [divisions, bracketId]
  );

  const progress = progressByDiv[bracketId] || "not_started";
  const status = divisionStatusMeta(progress);
  const readOnly = progress === "completed";
  const isMlp = isMlpDivision(selectedDivision, pools);
  const playersByTeamId = useMemo(() => teamPlayersById(pools), [pools]);
  const duprDefault = Boolean(
    selectedDivision?.duprRecorded ?? selectedDivision?.organizerInfo?.duprRecorded ?? true
  );

  const livePlayHref = tournamentId
    ? tournamentAdminPath("/admin/control", tournamentId)
    : null;

  const poolGridClass =
    poolCols === 1
      ? styles.poolGrid1
      : poolCols === 3
        ? styles.poolGrid3
        : poolCols === 4
          ? styles.poolGrid4
          : styles.poolGrid2;

  const buckets = useMemo(() => {
    const inProgress = [];
    const notStarted = [];
    const completed = [];
    for (const d of divisions) {
      const p = progressByDiv[String(d.id)] || "not_started";
      if (p === "completed") completed.push(d);
      else if (p === "in_progress") inProgress.push(d);
      else notStarted.push(d);
    }
    return { inProgress, notStarted, completed };
  }, [divisions, progressByDiv]);

  const loadCourts = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const tournament = await fetchTournamentById(tournamentId);
      const { settings } = mergeTournamentSettings(tournament.organizerInfo);
      const n = Math.max(1, Number(settings.numCourts) || 8);
      setCourts(Array.from({ length: n }, (_, i) => `Court ${i + 1}`));
    } catch {
      setCourts(Array.from({ length: 8 }, (_, i) => `Court ${i + 1}`));
    }
  }, [tournamentId]);

  const loadDivisions = useCallback(async () => {
    if (!tournamentId) return;
    const divs = await fetchDivisions(tournamentId);
    setDivisions(divs);

    const progressMap = {};
    await Promise.all(
      divs.map(async (d) => {
        try {
          const data = await loadScoreEntryBracket(tournamentId, d.id);
          progressMap[String(d.id)] = classifyDivisionProgress(
            data.poolMatches,
            data.playoffMatches
          );
        } catch {
          progressMap[String(d.id)] = "not_started";
        }
      })
    );
    setProgressByDiv(progressMap);

    setBracketId((current) => {
      if (current && divs.some((d) => String(d.id) === String(current))) {
        return current;
      }
      if (!divs.length) return "";
      const prefer =
        divs.find((d) => progressMap[String(d.id)] === "in_progress") ||
        divs.find((d) => progressMap[String(d.id)] === "not_started") ||
        divs[0];
      return String(prefer.id);
    });
  }, [tournamentId]);

  const initMatchStates = useCallback(
    (allMatches, duprOn) => {
      const next = {};
      for (const m of allMatches) {
        if (m.status === "completed") {
          next[m.matchId] = hydrateCompletedState(m, duprOn);
        } else {
          next[m.matchId] = emptyMlpMatchState(duprOn);
        }
      }
      setMatchStates(next);
    },
    []
  );

  const loadBracket = useCallback(async () => {
    if (!tournamentId || !bracketId) return;
    setLoading(true);
    setError("");
    try {
      const data = await loadScoreEntryBracket(tournamentId, bracketId);
      setPools(data.pools);
      setPlayoffMatches(data.playoffMatches);
      const p = classifyDivisionProgress(data.poolMatches, data.playoffMatches);
      setProgressByDiv((prev) => ({ ...prev, [String(bracketId)]: p }));

      const all = [...data.poolMatches, ...data.playoffMatches];
      setDrafts((prev) => {
        const next = { ...prev };
        for (const m of all) {
          next[m.matchId] = {
            scoreTeam1: m.scoreTeam1,
            scoreTeam2: m.scoreTeam2,
          };
        }
        return next;
      });
      initMatchStates(all, duprDefault);
    } catch (err) {
      setError(err.message || "Failed to load matches");
      setPools([]);
      setPlayoffMatches([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, bracketId, duprDefault, initMatchStates]);

  const loadBracketStandings = useCallback(async () => {
    if (!tournamentId || !bracketId) return;
    setStandingsLoading(true);
    try {
      const list = await fetchFinalStandings(tournamentId, bracketId);
      setBracketStandings(list);
    } catch {
      setBracketStandings([]);
    } finally {
      setStandingsLoading(false);
    }
  }, [tournamentId, bracketId]);

  useEffect(() => {
    loadDivisions();
    loadCourts();
  }, [loadDivisions, loadCourts]);

  useEffect(() => {
    loadBracket();
  }, [loadBracket]);

  useEffect(() => {
    if (tab === "st" && standingsSub === "bracket") {
      loadBracketStandings();
    }
  }, [tab, standingsSub, loadBracketStandings]);

  const selectDivision = (id) => {
    if (!id) return;
    setBracketId(String(id));
    setExpandedId("");
    setMessage("");
    setTab("rr");
    setStandingsSub("pool");
  };

  const handleSave = async (match, scoreTeam1, scoreTeam2) => {
    const draft = drafts[match.matchId] || {
      scoreTeam1: match.scoreTeam1,
      scoreTeam2: match.scoreTeam2,
    };
    const s1 = scoreTeam1 ?? draft.scoreTeam1;
    const s2 = scoreTeam2 ?? draft.scoreTeam2;
    setSavingId(String(match.matchId));
    setError("");
    setMessage("");
    try {
      await updateMatchScore(bracketId, match.matchId, {
        scoreTeam1: Number(s1) || 0,
        scoreTeam2: Number(s2) || 0,
      });
      setMessage(`Score saved — ${match.team1Name} vs ${match.team2Name}`);
      await loadBracket();
    } catch (err) {
      setError(err.message || "Failed to save score");
    } finally {
      setSavingId("");
    }
  };

  const handleMlpComplete = async (match, st) => {
    const w = finalGamesWon(st);
    if (w.home < 3 && w.away < 3) return false;
    await handleSave(match, w.home, w.away);
    return true;
  };

  const handleGeneratePlayoffs = async () => {
    if (!tournamentId || !bracketId) return;
    setGenerating(true);
    setError("");
    setMessage("");
    try {
      await fetchOrCreatePlayoffs(tournamentId, bracketId);
      setMessage("Playoff bracket ready.");
      setTab("po");
      await loadBracket();
    } catch (err) {
      setError(err.message || "Could not create playoffs");
    } finally {
      setGenerating(false);
    }
  };

  const handleFillScores = async () => {
    if (!bracketId || readOnly) return;
    if (
      !window.confirm(
        "Fill all pool matches with random demo scores?\n\nThis will overwrite any unsaved pool results."
      )
    ) {
      return;
    }
    setFilling(true);
    setError("");
    try {
      for (const pool of pools) {
        for (const m of pool.matches) {
          if (m.status === "completed") continue;
          const goesDb = Math.random() < 0.25;
          let h = goesDb ? 2 : 3;
          let a = goesDb ? 2 : 1;
          if (!goesDb && Math.random() < 0.5) [h, a] = [a, h];
          if (goesDb) {
            if (Math.random() < 0.5) h = 3;
            else a = 3;
          }
          await updateMatchScore(bracketId, m.matchId, {
            scoreTeam1: h,
            scoreTeam2: a,
          });
        }
      }
      setMessage("Demo scores filled — open Playoffs to generate the bracket.");
      setTab("po");
      await loadBracket();
    } catch (err) {
      setError(err.message || "Failed to fill scores");
    } finally {
      setFilling(false);
    }
  };

  const allPoolMatchesDone =
    pools.length > 0 &&
    pools.every((p) => p.matches.every((m) => m.status === "completed"));

  if (!tournamentId) {
    return <TournamentPicker label="Score Entry" />;
  }

  const renderPicker = (bucket, kind) => {
    const owns = bucket.some((d) => String(d.id) === String(bracketId));
    const labelClass =
      kind === "active"
        ? styles.pickerLabelActive
        : kind === "yts"
          ? styles.pickerLabelYts
          : styles.pickerLabelDone;
    const selectClass =
      kind === "active"
        ? styles.pickerSelectActive
        : kind === "yts"
          ? styles.pickerSelectYts
          : styles.pickerSelectDone;
    const placeholder =
      kind === "active"
        ? `● In-Progress (${bucket.length})`
        : kind === "yts"
          ? `○ Yet to start (${bucket.length})`
          : `✓ Completed (${bucket.length})`;

    if (!bucket.length && kind !== "active") return null;

    return (
      <div className={styles.pickerGroup} key={kind}>
        <div className={`${styles.pickerLabel} ${labelClass}`}>
          {kind === "active"
            ? "● In-Progress"
            : kind === "yts"
              ? "○ Yet to start"
              : "✓ Completed"}
        </div>
        <select
          className={`form-select ${styles.pickerSelect}${owns ? ` ${selectClass}` : ""}`}
          value={owns ? String(bracketId) : ""}
          disabled={!bucket.length}
          onChange={(e) => selectDivision(e.target.value)}
        >
          {!owns ? <option value="">{placeholder}</option> : null}
          {bucket.length ? (
            bucket.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))
          ) : (
            <option value="">— None in progress —</option>
          )}
        </select>
      </div>
    );
  };

  const renderMatchCard = (m, matchIndex) => (
    <MatchScoreCard
      key={m.matchId}
      match={m}
      matchIndex={matchIndex}
      expanded={String(expandedId) === String(m.matchId)}
      onToggle={() =>
        setExpandedId((id) =>
          String(id) === String(m.matchId) ? "" : String(m.matchId)
        )
      }
      isMlp={isMlp}
      mlpState={matchStates[m.matchId] || emptyMlpMatchState(duprDefault)}
      onMlpStateChange={(next) =>
        setMatchStates((prev) => ({ ...prev, [m.matchId]: next }))
      }
      onMlpComplete={handleMlpComplete}
      team1Players={playersByTeamId[m.team1Id] || []}
      team2Players={playersByTeamId[m.team2Id] || []}
      courts={courts}
      courtsAvailable={courts.length > 0}
      livePlayHref={livePlayHref}
      draft={drafts[m.matchId]}
      onDraftChange={(next) =>
        setDrafts((prev) => ({ ...prev, [m.matchId]: next }))
      }
      onSave={() => handleSave(m)}
      saving={String(savingId) === String(m.matchId)}
      readOnly={readOnly}
    />
  );

  return (
    <div className={`screen active ${styles.page}`}>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 4 · Control Hub</div>
          <div className="page-title">Score Entry</div>
          <div className="page-sub">
            Pick a division, then enter MLP match scores pool by pool
          </div>
        </div>
        <div className="page-actions" style={{ alignItems: "flex-end" }}>
          {renderPicker(buckets.inProgress, "active")}
          {renderPicker(buckets.notStarted, "yts")}
          {renderPicker(buckets.completed, "done")}
          <Link
            href={tournamentAdminPath("/admin/divisions", tournamentId)}
            className="btn btn-ghost btn-md"
            title="Edit this division's settings — scoring, DUPR, format"
          >
            ⚙ Manage Division
          </Link>
          <div className={styles.poolLayoutToggle}>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.poolLayoutBtn}${poolCols === n ? ` ${styles.poolLayoutBtnOn}` : ""}`}
                onClick={() => setPoolCols(n)}
                title={`${n} pool${n > 1 ? "s" : ""} per row`}
              >
                {n} {n === 1 ? "pool" : "pools"}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-md"
            disabled={readOnly || filling || !pools.length}
            onClick={handleFillScores}
            title="Fill all pool matches with random results — for demo / testing the playoff flow"
          >
            {filling ? "Filling…" : "⚡ Fill Scores"}
          </button>
          <TournamentSwitcher tournamentId={tournamentId} />
        </div>
      </div>

      <div className="content">
        {error ? <div className={styles.errorBanner}>{error}</div> : null}
        {message ? <div className={styles.successBanner}>{message}</div> : null}

        {selectedDivision ? (
          <>
            <div className={styles.divTitleRow}>
              <span className={styles.divSwatch} />
              <h2 className={styles.divTitle}>{selectedDivision.name}</h2>
              {selectedDivision.duprRecorded ? (
                <span className="dupr-badge" style={{ fontSize: 10, alignSelf: "center" }}>
                  DUPR
                </span>
              ) : null}
              <span className={styles.divMeta}>
                {[selectedDivision.skillLevel, selectedDivision.ageGroup]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>

            <div
              className={styles.statusBanner}
              style={{ borderLeft: `3px solid ${status.color}` }}
            >
              <span
                className={`${styles.statusDot}${status.phase !== "complete" ? ` ${styles.statusDotPulse}` : ""}`}
                style={{ background: status.color }}
              />
              <div className={styles.statusEyebrow}>Division Status</div>
              <div className={styles.statusLabel} style={{ color: status.color }}>
                {status.label}
              </div>
            </div>

            <div className={styles.tabBar}>
              {[
                { k: "rr", label: "Round Robin" },
                { k: "st", label: "Standings" },
                {
                  k: "po",
                  label: `Playoffs${allPoolMatchesDone && !playoffMatches.length ? " •" : ""}`,
                },
                { k: "tm", label: "Teams" },
              ].map((t) => (
                <button
                  key={t.k}
                  type="button"
                  className={`${styles.tabBtn}${tab === t.k ? ` ${styles.tabBtnOn}` : ""}`}
                  onClick={() => setTab(t.k)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "rr" ? (
              loading ? (
                <div className={styles.emptyState}>Loading pools…</div>
              ) : !pools.length ? (
                <div className={styles.emptyState}>
                  No pools to score yet. Generate a pool schedule from Bracket
                  Progression first.
                </div>
              ) : (
                <>
                  {allPoolMatchesDone && !playoffMatches.length ? (
                    <div
                      className={styles.playoffCard}
                      style={{ marginBottom: 18, padding: 20 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ fontSize: 30 }}>🏆</div>
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <div
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: 15,
                              fontWeight: 800,
                            }}
                          >
                            Round robin complete — generate playoffs
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--text-sec)",
                              marginTop: 3,
                            }}
                          >
                            All pool matches have saved results. Generate the playoff bracket
                            to continue scoring.
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-md"
                          onClick={handleGeneratePlayoffs}
                          disabled={generating}
                        >
                          {generating ? "Working…" : "Generate Playoff Bracket"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className={`${styles.poolGrid} ${poolGridClass}`}>
                    {pools.map((pool) => (
                      <div key={pool.id} className={styles.poolCard}>
                        <div className={styles.poolHead}>
                          <div className={styles.poolName}>{pool.poolName}</div>
                          <div className={styles.poolMeta}>
                            {pool.teams?.length || 0} teams · {pool.matches.length} matches
                          </div>
                        </div>
                        <div className={styles.poolBody}>
                          {pool.matches.length ? (
                            groupMatchesByRound(pool.matches).map(([round, matches]) => (
                              <div key={round}>
                                {matches.map((m, idx) =>
                                  renderMatchCard(m, idx + 1)
                                )}
                              </div>
                            ))
                          ) : (
                            <div className={styles.emptyState}>
                              No matches in this pool.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            ) : null}

            {tab === "st" ? (
              !pools.length ? (
                <div className={styles.emptyState}>No standings yet.</div>
              ) : (
                <>
                  <StandingsSubTabs
                    active={standingsSub}
                    onChange={setStandingsSub}
                  />
                  {standingsSub === "pool" ? (
                    <PoolOverviewTab
                      pools={pools}
                      onScoreMatches={() => setTab("rr")}
                    />
                  ) : (
                    <BracketStandingsTab
                      standings={bracketStandings}
                      loading={standingsLoading}
                    />
                  )}
                </>
              )
            ) : null}

            {tab === "po" ? (
              playoffMatches.length ? (
                <div className={styles.playoffCard}>
                  <div className={styles.playoffHead}>
                    <div className={styles.playoffTitle}>🏆 Playoffs</div>
                    <div className={styles.playoffSub}>
                      Single elimination · enter scores as matches finish
                    </div>
                  </div>
                  <div className={styles.poolBody}>
                    {Object.entries(
                      playoffMatches.reduce((acc, m) => {
                        const key = m.roundType || "playoff";
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(m);
                        return acc;
                      }, {})
                    ).map(([roundName, matches]) => (
                      <div key={roundName}>
                        <div className={styles.roundLabel}>{roundName}</div>
                        {matches.map((m, idx) => renderMatchCard(m, idx + 1))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : allPoolMatchesDone ? (
                <div className={styles.emptyState}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🏆</div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      fontWeight: 800,
                      marginBottom: 4,
                      color: "var(--text)",
                    }}
                  >
                    Round robin complete
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    Generate the playoff bracket to start scoring playoff matches.
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-md"
                    onClick={handleGeneratePlayoffs}
                    disabled={generating}
                  >
                    {generating ? "Working…" : "Generate Playoff Bracket"}
                  </button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>🏆</div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      fontWeight: 800,
                      marginBottom: 4,
                      color: "var(--text)",
                    }}
                  >
                    Playoffs not ready
                  </div>
                  Finish all Round Robin matches first — the playoff bracket can be generated
                  once every pool match has a saved result.
                </div>
              )
            ) : null}

            {tab === "tm" ? <TeamsTab pools={pools} /> : null}
          </>
        ) : (
          <div className={styles.emptyState}>
            {loading
              ? "Loading divisions…"
              : "No published divisions with pools to score yet."}
          </div>
        )}
      </div>
    </div>
  );
}
