"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import BracketMatchCard from "../../_components/live/BracketMatchCard";
import live from "../../_styles/livePlay.module.css";
import {
  createRoundRobin,
  fetchOrCreatePlayoffs,
  fetchPlayoffRounds,
  fetchPoolDetails,
  fetchPools,
} from "@/lib/bracketProgression";
import { fetchDivisions } from "@/lib/divisions";
import { getStageScoringLabel, roundTypeLabel } from "@/lib/scoring";
import { tournamentAdminPath } from "@/lib/tournaments";
import styles from "../bracket.module.css";

function colStaggerClass(index, total) {
  if (total <= 1 || index === 0) return "";
  if (index === total - 1) return live.bracketColStagger3;
  if (index === total - 2) return live.bracketColStagger2;
  if (index >= 1) return live.bracketColStagger1;
  return "";
}

export default function BracketProgressionScreen() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  const [divisions, setDivisions] = useState([]);
  const [bracketId, setBracketId] = useState("");
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [pools, setPools] = useState([]);
  const [activePoolId, setActivePoolId] = useState(null);
  const [poolDetail, setPoolDetail] = useState(null);
  const [playoffRounds, setPlayoffRounds] = useState([]);
  const [tab, setTab] = useState("pools");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDivisions = useCallback(async () => {
    if (!tournamentId) return;
    const divs = await fetchDivisions(tournamentId);
    setDivisions(divs);
    if (!bracketId && divs[0]) {
      setBracketId(String(divs[0].id));
      setSelectedDivision(divs[0]);
    }
  }, [tournamentId, bracketId]);

  const loadPools = useCallback(async () => {
    if (!tournamentId || !bracketId) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchPools(tournamentId, bracketId);
      setPools(list);
      if (list[0]) setActivePoolId(list[0].id);
      else {
        setActivePoolId(null);
        setPoolDetail(null);
      }
      const playoffs = await fetchPlayoffRounds(tournamentId, bracketId);
      setPlayoffRounds(playoffs);
    } catch (err) {
      setError(err.message || "Failed to load bracket");
      setPools([]);
      setPlayoffRounds([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, bracketId]);

  const loadPoolDetail = useCallback(async () => {
    if (!tournamentId || !bracketId || !activePoolId) return;
    try {
      const detail = await fetchPoolDetails(tournamentId, bracketId, activePoolId);
      setPoolDetail(detail);
    } catch (err) {
      setError(err.message || "Failed to load pool");
    }
  }, [tournamentId, bracketId, activePoolId]);

  useEffect(() => {
    loadDivisions();
  }, [loadDivisions]);

  useEffect(() => {
    const div = divisions.find((d) => String(d.id) === String(bracketId));
    setSelectedDivision(div || null);
    loadPools();
  }, [bracketId, divisions, loadPools]);

  useEffect(() => {
    loadPoolDetail();
  }, [loadPoolDetail]);

  const handleGenerateRR = async () => {
    if (!tournamentId || !bracketId) return;
    setGenerating(true);
    setError("");
    setMessage("");
    try {
      await createRoundRobin(tournamentId, bracketId, { teamsPerPool: 6, force: false });
      setMessage("Pool schedule generated.");
      await loadPools();
      setTab("pools");
    } catch (err) {
      setError(err.message || "Could not generate schedule");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreatePlayoffs = async () => {
    if (!tournamentId || !bracketId) return;
    setGenerating(true);
    setError("");
    try {
      const rounds = await fetchOrCreatePlayoffs(tournamentId, bracketId);
      setPlayoffRounds(rounds);
      setMessage("Playoff bracket ready.");
      setTab("playoffs");
    } catch (err) {
      setError(err.message || "Could not create playoffs");
    } finally {
      setGenerating(false);
    }
  };

  const scoringStages = ["pool", "playoff", "semi", "gold", "bronze"];
  const roundCount = playoffRounds.length;

  if (!tournamentId) {
    return (
      <div className="screen active">
        <div className="page-title">Bracket Progression</div>
        <div className="content">
          <p>Select a tournament first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`screen active ${styles.page}`}>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 4 · Live Play</div>
          <div className="page-title">Bracket Progression</div>
          <div className="page-sub">Live bracket updates as matches complete</div>
        </div>
        <div className="page-actions">
          <select
            className="form-select"
            style={{ padding: "8px 12px", fontSize: 13, maxWidth: 220 }}
            value={bracketId}
            onChange={(e) => setBracketId(e.target.value)}
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost btn-md" disabled title="Coming soon">
            Share Bracket
          </button>
          <TournamentPicker tournamentId={tournamentId} />
          <Link
            href={tournamentAdminPath("/admin/scoreentry", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            Score Entry →
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

        <div className={styles.toolbar}>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleGenerateRR}
            disabled={generating || !bracketId}
          >
            {generating ? "Working…" : "Generate pool schedule"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-md"
            onClick={handleCreatePlayoffs}
            disabled={generating || !pools.length}
          >
            Advance to playoffs
          </button>
          <Link
            href={tournamentAdminPath("/admin/checkin", tournamentId)}
            className="btn btn-ghost btn-md"
          >
            Check-In
          </Link>
        </div>

        {selectedDivision?.scoringLabels || selectedDivision?.scoringConfig ? (
          <div className={styles.scoringBar}>
            {scoringStages.map((stage) => (
              <span key={stage} className={styles.scoringChip}>
                <strong style={{ textTransform: "capitalize" }}>{stage}:</strong>{" "}
                {getStageScoringLabel(selectedDivision, stage === "semi" ? "semifinal" : stage) ||
                  selectedDivision.scoringLabels?.[stage] ||
                  "—"}
              </span>
            ))}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            className={`btn btn-sm ${tab === "pools" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("pools")}
          >
            Pool play
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tab === "playoffs" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("playoffs")}
          >
            Playoffs
          </button>
        </div>

        {loading ? <p>Loading…</p> : null}

        {tab === "pools" ? (
          <>
            {!pools.length && !loading ? (
              <div className="empty">
                <div className="empty-title">No pools yet</div>
                <p>Check in teams, then generate the round-robin schedule.</p>
              </div>
            ) : (
              <>
                <div className={styles.poolTabs}>
                  {pools.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`${styles.poolTab} ${
                        activePoolId === p.id ? styles.poolTabActive : ""
                      }`}
                      onClick={() => setActivePoolId(p.id)}
                    >
                      {p.poolName}
                    </button>
                  ))}
                </div>
                {poolDetail ? (
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">{poolDetail.poolName}</span>
                      <span className="pill pill-wait">{poolDetail.scoring}</span>
                    </div>
                    {poolDetail.rounds?.map((round) => (
                      <div key={round.id} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                          Round {round.roundNumber} · {round.roundStatus}
                        </div>
                        {round.matches?.map((m) => (
                          <BracketMatchCard
                            key={m.id}
                            team1={m.team1}
                            team2={m.team2}
                            score1={m.scoreTeam1}
                            score2={m.scoreTeam2}
                            status={m.status}
                            winnerTeamId={m.winnerTeamId}
                            team1Id={m.team1?.id}
                            team2Id={m.team2?.id}
                            liveLabel={
                              m.status === "ongoing" ? "● LIVE" : undefined
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : (
          <>
            {!playoffRounds.length && !loading ? (
              <div className="empty">
                <div className="empty-title">No playoff bracket</div>
                <p>Complete all pool matches, then advance to playoffs.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <div className={live.bracketColumns}>
                  {playoffRounds.map((round, ri) => {
                    const isFinal =
                      round.type === "gold" || round.type === "final";
                    return (
                      <div
                        key={`${round.type}-${round.roundNumber}`}
                        className={`${live.bracketCol} ${colStaggerClass(ri, roundCount)}`}
                      >
                        <div
                          className={`${live.bracketColTitle} ${
                            isFinal ? live.bracketColTitleFinal : ""
                          }`}
                        >
                          {isFinal ? "Final" : roundTypeLabel(round.type)}
                        </div>
                        {round.matches?.map((m, mi) => (
                          <BracketMatchCard
                            key={m.matchId || mi}
                            team1={m.Team1}
                            team2={m.Team2}
                            score1={m.scoreTeam1}
                            score2={m.scoreTeam2}
                            seed1={m.Team1?.team1Id ? "—" : "?"}
                            seed2={m.Team2 ? "—" : "?"}
                            status={m.status}
                            liveLabel={
                              m.status === "ongoing" ? "● LIVE · Court —" : undefined
                            }
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
