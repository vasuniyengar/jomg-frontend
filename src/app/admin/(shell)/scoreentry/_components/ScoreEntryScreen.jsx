"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import live from "../../_styles/livePlay.module.css";
import {
  fetchMatchDetails,
  listMatchesForBracket,
  updateMatchScore,
} from "@/lib/bracketProgression";
import { fetchDivisions } from "@/lib/divisions";
import { roundTypeLabel } from "@/lib/scoring";

function winnerName(score1, score2, name1, name2) {
  if (score1 > score2) return name1;
  if (score2 > score1) return name2;
  return "—";
}

export default function ScoreEntryScreen() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [divisions, setDivisions] = useState([]);
  const [bracketId, setBracketId] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [matches, setMatches] = useState({ poolMatches: [], playoffMatches: [] });
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [matchDetail, setMatchDetail] = useState(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [matchNotes, setMatchNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const printTriggered = useRef(false);

  useEffect(() => {
    if (showPrint && !printTriggered.current) {
      printTriggered.current = true;
      const t = setTimeout(() => {
        window.print();
        printTriggered.current = false;
      }, 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [showPrint]);

  const allMatches = useMemo(() => {
    const list = [...matches.poolMatches, ...matches.playoffMatches];
    if (stageFilter === "pool") return matches.poolMatches;
    if (stageFilter === "playoff") return matches.playoffMatches;
    return list;
  }, [matches, stageFilter]);

  const selectedMeta = useMemo(
    () => allMatches.find((m) => String(m.matchId) === String(selectedMatchId)),
    [allMatches, selectedMatchId]
  );

  const isLive = selectedMeta?.status === "ongoing";

  const loadDivisions = useCallback(async () => {
    if (!tournamentId) return;
    const divs = await fetchDivisions(tournamentId);
    setDivisions(divs);
    if (!bracketId && divs[0]) setBracketId(String(divs[0].id));
  }, [tournamentId, bracketId]);

  const loadMatches = useCallback(async () => {
    if (!tournamentId || !bracketId) return;
    setLoading(true);
    setError("");
    try {
      const data = await listMatchesForBracket(tournamentId, bracketId);
      setMatches(data);
      const first = [...data.poolMatches, ...data.playoffMatches][0];
      if (first && !selectedMatchId) setSelectedMatchId(String(first.matchId));
    } catch (err) {
      setError(err.message || "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [tournamentId, bracketId, selectedMatchId]);

  const loadMatch = useCallback(async () => {
    if (!selectedMatchId) {
      setMatchDetail(null);
      return;
    }
    try {
      const detail = await fetchMatchDetails(selectedMatchId);
      setMatchDetail(detail);
      setScore1(Number(detail.scoreTeam1) || 0);
      setScore2(Number(detail.scoreTeam2) || 0);
    } catch (err) {
      setError(err.message || "Failed to load match");
    }
  }, [selectedMatchId]);

  useEffect(() => {
    loadDivisions();
  }, [loadDivisions]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  const handleSave = async () => {
    if (!selectedMeta || !bracketId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateMatchScore(bracketId, selectedMatchId, {
        scoreTeam1: score1,
        scoreTeam2: score2,
      });
      setMessage("Score saved.");
      await loadMatches();
      await loadMatch();
    } catch (err) {
      setError(err.message || "Failed to save score");
    } finally {
      setSaving(false);
    }
  };

  const teamName = (idx) => {
    const t = matchDetail?.teams?.[idx];
    if (!t) return selectedMeta?.[idx === 0 ? "team1Name" : "team2Name"] || "Team";
    return (
      t.teamName ||
      t.players?.map((p) => `${p.firstname} ${p.lastname}`).join(" / ") ||
      `Team ${t.id}`
    );
  };

  const n1 = teamName(0);
  const n2 = teamName(1);
  const finalWinner = winnerName(score1, score2, n1, n2);

  if (!tournamentId) {
    return (
      <div className="screen active">
        <div className="page-title">Score Entry</div>
        <div className="content">
          <p>Select a tournament first.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`screen active ${showPrint ? live.noPrint : ""}`}>
        <div className="page-header">
          <div className="page-title-group">
            <div className="page-eyebrow">Phase 4 · Live Play</div>
            <div className="page-title">Score Entry</div>
            <div className="page-sub">Enter & confirm match scores in real time</div>
          </div>
          <div className="page-actions">
            <select
              className="form-select"
              style={{ width: 200, padding: "8px 12px", fontSize: 13 }}
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              disabled={loading || !allMatches.length}
            >
              {allMatches.map((m) => (
                <option key={m.matchId} value={m.matchId}>
                  {m.poolName ? `${m.poolName} · ` : ""}
                  {roundTypeLabel(m.roundType)} — {m.team1Name} vs {m.team2Name}
                </option>
              ))}
            </select>
            <TournamentPicker tournamentId={tournamentId} />
          </div>
        </div>

        <div className="content">
          {error ? <div className={live.errorBanner}>{error}</div> : null}
          {message ? (
            <div className="alert alert-info" style={{ marginBottom: 12 }}>
              {message}
            </div>
          ) : null}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <select
              className="form-select"
              style={{ maxWidth: 240 }}
              value={bracketId}
              onChange={(e) => {
                setBracketId(e.target.value);
                setSelectedMatchId("");
              }}
            >
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ maxWidth: 140 }}
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="all">All stages</option>
              <option value="pool">Pool</option>
              <option value="playoff">Playoff</option>
            </select>
          </div>

          {isLive ? (
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              ● Live · {selectedMeta?.poolName || "Court —"} ·{" "}
              {roundTypeLabel(selectedMeta?.roundType)}
              {matchDetail?.scoringSetup ? ` · ${matchDetail.scoringSetup}` : ""}
            </div>
          ) : null}

          {selectedMeta ? (
            <div className={live.scoreEntryGrid}>
              <div className={live.scoreTeam}>
                <div className={live.scoreTeamName}>{n1.toUpperCase()}</div>
                <div className={live.scoreTeamMeta}>
                  {selectedMeta.poolName || roundTypeLabel(selectedMeta.roundType)}
                </div>
                <div className={live.scoreInputWrap}>
                  <button
                    type="button"
                    className={live.scoreBtn}
                    onClick={() => setScore1((s) => Math.max(0, s - 1))}
                  >
                    −
                  </button>
                  <div className={live.scoreNum}>{score1}</div>
                  <button
                    type="button"
                    className={live.scoreBtn}
                    onClick={() => setScore1((s) => s + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={live.scoreVs}>
                <span style={{ letterSpacing: 0 }}>FINAL</span>
              </div>
              <div className={live.scoreTeam}>
                <div className={live.scoreTeamName}>{n2.toUpperCase()}</div>
                <div className={live.scoreTeamMeta}>
                  {matchDetail?.scoringSetup || "Match total"}
                </div>
                <div className={live.scoreInputWrap}>
                  <button
                    type="button"
                    className={live.scoreBtn}
                    onClick={() => setScore2((s) => Math.max(0, s - 1))}
                  >
                    −
                  </button>
                  <div className={live.scoreNum}>{score2}</div>
                  <button
                    type="button"
                    className={live.scoreBtn}
                    onClick={() => setScore2((s) => s + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>{loading ? "Loading matches…" : "No matches available. Generate pools first."}</p>
          )}

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Game History</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>{n1}</th>
                    <th>{n2}</th>
                    <th>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Final</td>
                    <td
                      style={{
                        color: score1 >= score2 ? "var(--primary-text)" : "var(--text-ter)",
                        fontWeight: score1 > score2 ? 700 : 400,
                      }}
                    >
                      {score1}
                    </td>
                    <td
                      style={{
                        color: score2 >= score1 ? "var(--primary-text)" : "var(--text-ter)",
                        fontWeight: score2 > score1 ? 700 : 400,
                      }}
                    >
                      {score2}
                    </td>
                    <td>
                      {isLive ? (
                        <span className="pill pill-live">● Live</span>
                      ) : (
                        <span className="pill pill-done">{finalWinner}</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Match Actions</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-md"
                  style={{ justifyContent: "center" }}
                  onClick={handleSave}
                  disabled={saving || !selectedMatchId}
                >
                  {saving ? "Saving…" : "✓ Confirm Final Score & Advance"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  style={{ justifyContent: "center" }}
                  disabled
                  title="Coming soon"
                >
                  ↩ Correct Previous Game Score
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  style={{ justifyContent: "center" }}
                  disabled
                  title="Coming soon"
                >
                  ⏸ Suspend Match
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-md"
                  style={{ justifyContent: "center" }}
                  disabled
                  title="Coming soon"
                >
                  ⚠️ Report Dispute
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-md"
                  style={{ justifyContent: "center" }}
                  onClick={() => setShowPrint(true)}
                  disabled={!selectedMatchId}
                >
                  Print score sheet
                </button>
              </div>
              <div className="divider" />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Match Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Optional: injuries, disputes, delays..."
                  value={matchNotes}
                  onChange={(e) => setMatchNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPrint && selectedMeta ? (
        <div className={live.printSheet}>
          <h1>Match Score Sheet</h1>
          <div className={live.printMeta}>
            <div>
              {roundTypeLabel(selectedMeta.roundType)}
              {selectedMeta.poolName ? ` · ${selectedMeta.poolName}` : ""}
            </div>
            <div>Scoring: {matchDetail?.scoringSetup || "—"}</div>
          </div>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <strong style={{ fontSize: 16 }}>{n1}</strong>
            <span style={{ margin: "0 16px" }}>vs</span>
            <strong style={{ fontSize: 16 }}>{n2}</strong>
          </div>
          <div className={live.printScores}>
            <span>{score1}</span>
            <span>—</span>
            <span>{score2}</span>
          </div>
          <p style={{ fontSize: 12 }}>Final match totals (games not tracked in v1).</p>
          <div className={live.printSig}>Official signature</div>
          <button
            type="button"
            className={`btn btn-ghost btn-sm ${live.noPrint}`}
            style={{ marginTop: 16 }}
            onClick={() => setShowPrint(false)}
          >
            Close print view
          </button>
        </div>
      ) : null}
    </>
  );
}
