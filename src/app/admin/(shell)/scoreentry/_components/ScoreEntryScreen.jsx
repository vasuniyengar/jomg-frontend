"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TournamentPicker from "../../_components/TournamentPicker";
import TournamentSwitcher from "../../_components/TournamentSwitcher";
import {
  classifyDivisionProgress,
  fetchOrCreatePlayoffs,
  loadScoreEntryBracket,
  updateMatchScore,
} from "@/lib/bracketProgression";
import { fetchDivisions } from "@/lib/divisions";
import { roundTypeLabel } from "@/lib/scoring";
import { tournamentAdminPath } from "@/lib/tournaments";
import styles from "../scoreentry.module.css";

function statusMeta(status) {
  if (status === "completed") {
    return { label: "Complete", color: "#00c84a", bg: "rgba(0,200,80,0.12)" };
  }
  if (status === "ongoing") {
    return { label: "● Live", color: "#e0a000", bg: "rgba(224,160,0,0.12)" };
  }
  return { label: "Not started", color: "var(--text-ter)", bg: "var(--badge-bg)" };
}

function divisionStatusMeta(progress) {
  if (progress === "completed") {
    return { label: "Completed", color: "#00c84a", phase: "complete" };
  }
  if (progress === "in_progress") {
    return { label: "In progress", color: "var(--primary-text)", phase: "live" };
  }
  return { label: "Yet to start", color: "#e0a000", phase: "pending" };
}

function teamSeedLabel(seed, name) {
  if (seed != null && seed !== "") return `#${seed} ${name}`;
  return name || "TBD";
}

function playerDisplayName(player) {
  if (!player) return "";
  if (typeof player === "string") return player;
  return [player.firstname, player.lastname].filter(Boolean).join(" ") || "—";
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

function MatchScoreCard({
  match,
  expanded,
  onToggle,
  draft,
  onDraftChange,
  onSave,
  saving,
  readOnly,
}) {
  const st = statusMeta(match.status);
  const s1 = draft?.scoreTeam1 ?? match.scoreTeam1 ?? 0;
  const s2 = draft?.scoreTeam2 ?? match.scoreTeam2 ?? 0;
  const phase =
    match.roundType === "pool"
      ? "Round Robin"
      : roundTypeLabel(match.roundType);

  return (
    <div className={styles.matchCard}>
      <button
        type="button"
        className={`${styles.matchHeader}${expanded ? ` ${styles.matchHeaderOpen}` : ""}`}
        onClick={onToggle}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={styles.matchTitle}>
            {teamSeedLabel(match.team1Seed, match.team1Name)}{" "}
            <span className={styles.matchVs}>vs</span>{" "}
            {teamSeedLabel(match.team2Seed, match.team2Name)}
          </div>
          <div className={styles.matchSub}>
            {phase}
            {match.poolName ? ` · ${match.poolName}` : ""}
            {match.roundNumber ? ` · Round ${match.roundNumber}` : ""}
            {match.status === "completed" || match.status === "ongoing"
              ? ` · ${match.scoreTeam1}–${match.scoreTeam2}`
              : ""}
          </div>
        </div>
        <span
          className={styles.statusPill}
          style={{ color: st.color, background: st.bg }}
        >
          {st.label}
        </span>
        <span
          className={`${styles.chevron}${expanded ? ` ${styles.chevronOpen}` : ""}`}
        >
          ▾
        </span>
      </button>

      {expanded ? (
        <div className={styles.matchBody}>
          <div className={styles.scoreCourt}>
            <div className={styles.scoreSide}>
              <div className={styles.scoreSideName}>{match.team1Name}</div>
              <div className={styles.scoreSideMeta}>Team 1</div>
              <div className={styles.scoreRow}>
                <button
                  type="button"
                  className={styles.scoreStep}
                  disabled={readOnly || s1 <= 0}
                  onClick={() =>
                    onDraftChange({ scoreTeam1: Math.max(0, s1 - 1), scoreTeam2: s2 })
                  }
                >
                  −
                </button>
                <div
                  className={`${styles.scoreNum}${s1 < s2 ? ` ${styles.scoreNumLosing}` : ""}`}
                >
                  {s1}
                </div>
                <button
                  type="button"
                  className={styles.scoreStep}
                  disabled={readOnly}
                  onClick={() =>
                    onDraftChange({ scoreTeam1: s1 + 1, scoreTeam2: s2 })
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.scoreCenter}>
              <div className={styles.scoreCenterVs}>VS</div>
              <div className={styles.scoreCenterGame}>FINAL</div>
            </div>

            <div className={styles.scoreSide}>
              <div className={styles.scoreSideName}>{match.team2Name}</div>
              <div className={styles.scoreSideMeta}>Team 2</div>
              <div className={styles.scoreRow}>
                <button
                  type="button"
                  className={styles.scoreStep}
                  disabled={readOnly || s2 <= 0}
                  onClick={() =>
                    onDraftChange({ scoreTeam1: s1, scoreTeam2: Math.max(0, s2 - 1) })
                  }
                >
                  −
                </button>
                <div
                  className={`${styles.scoreNum}${s2 < s1 ? ` ${styles.scoreNumLosing}` : ""}`}
                >
                  {s2}
                </div>
                <button
                  type="button"
                  className={styles.scoreStep}
                  disabled={readOnly}
                  onClick={() =>
                    onDraftChange({ scoreTeam1: s1, scoreTeam2: s2 + 1 })
                  }
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className={styles.matchActions}>
            <button
              type="button"
              className="btn btn-primary btn-md"
              disabled={readOnly || saving}
              onClick={onSave}
            >
              {saving ? "Saving…" : "✓ Confirm Final Score & Advance"}
            </button>
          </div>
        </div>
      ) : null}
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
  const [poolCols, setPoolCols] = useState(2);
  const [expandedId, setExpandedId] = useState("");
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState("");
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
    } catch (err) {
      setError(err.message || "Failed to load matches");
      setPools([]);
      setPlayoffMatches([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, bracketId]);

  useEffect(() => {
    loadDivisions();
  }, [loadDivisions]);

  useEffect(() => {
    loadBracket();
  }, [loadBracket]);

  const selectDivision = (id) => {
    if (!id) return;
    setBracketId(String(id));
    setExpandedId("");
    setMessage("");
    setTab("rr");
  };

  const handleSave = async (match) => {
    const draft = drafts[match.matchId] || {
      scoreTeam1: match.scoreTeam1,
      scoreTeam2: match.scoreTeam2,
    };
    setSavingId(String(match.matchId));
    setError("");
    setMessage("");
    try {
      await updateMatchScore(bracketId, match.matchId, {
        scoreTeam1: Number(draft.scoreTeam1) || 0,
        scoreTeam2: Number(draft.scoreTeam2) || 0,
      });
      setMessage(`Score saved — ${match.team1Name} vs ${match.team2Name}`);
      await loadBracket();
    } catch (err) {
      setError(err.message || "Failed to save score");
    } finally {
      setSavingId("");
    }
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

  const allPoolMatchesDone =
    pools.length > 0 &&
    pools.every((p) =>
      p.matches.every((m) => m.status === "completed")
    );

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

  return (
    <div className={`screen active ${styles.page}`}>
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-eyebrow">Phase 4 · Control Hub</div>
          <div className="page-title">Score Entry</div>
          <div className="page-sub">
            Pick a division, then enter match scores pool by pool
          </div>
        </div>
        <div className="page-actions" style={{ alignItems: "flex-end" }}>
          {renderPicker(buckets.inProgress, "active")}
          {renderPicker(buckets.notStarted, "yts")}
          {renderPicker(buckets.completed, "done")}
          <Link
            href={tournamentAdminPath("/admin/divisions", tournamentId)}
            className="btn btn-ghost btn-md"
            title="Edit this division's settings"
          >
            ⚙ Manage Division
          </Link>
          <div className={styles.poolLayoutToggle}>
            {[1, 2].map((n) => (
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
                            All pool matches have saved results. Generate the
                            playoff bracket to continue scoring.
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

                  <div
                    className={`${styles.poolGrid} ${poolCols === 1 ? styles.poolGrid1 : styles.poolGrid2}`}
                  >
                    {pools.map((pool) => (
                      <div key={pool.id} className={styles.poolCard}>
                        <div className={styles.poolHead}>
                          <div className={styles.poolName}>{pool.poolName}</div>
                          <div className={styles.poolMeta}>
                            {pool.teams?.length || 0} teams ·{" "}
                            {pool.matches.length} matches
                          </div>
                        </div>
                        <div className={styles.poolBody}>
                          {pool.matches.length ? (
                            pool.matches.map((m) => (
                              <MatchScoreCard
                                key={m.matchId}
                                match={m}
                                expanded={String(expandedId) === String(m.matchId)}
                                onToggle={() =>
                                  setExpandedId((id) =>
                                    String(id) === String(m.matchId)
                                      ? ""
                                      : String(m.matchId)
                                  )
                                }
                                draft={drafts[m.matchId]}
                                onDraftChange={(next) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [m.matchId]: next,
                                  }))
                                }
                                onSave={() => handleSave(m)}
                                saving={String(savingId) === String(m.matchId)}
                                readOnly={readOnly}
                              />
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
                <div
                  className={`${styles.poolGrid} ${poolCols === 1 ? styles.poolGrid1 : styles.poolGrid2}`}
                >
                  {pools.map((pool) => {
                    const teams = [...(pool.teams || [])].sort((a, b) => {
                      const aw = a.stats?.wins ?? 0;
                      const bw = b.stats?.wins ?? 0;
                      if (bw !== aw) return bw - aw;
                      return (b.stats?.pointDifference ?? 0) - (a.stats?.pointDifference ?? 0);
                    });
                    return (
                      <div key={pool.id} className={styles.poolCard}>
                        <div className={styles.poolHead}>
                          <div className={styles.poolName}>
                            {pool.poolName} Standings
                          </div>
                        </div>
                        <div className={styles.poolBody}>
                          <table className={styles.standingsTable}>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Team</th>
                                <th>W</th>
                                <th>L</th>
                                <th>PD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teams.map((t, i) => (
                                <tr key={t.id}>
                                  <td>{i + 1}</td>
                                  <td>
                                    <strong>{t.teamName || `Team ${t.id}`}</strong>
                                  </td>
                                  <td style={{ color: "var(--primary-text)", fontWeight: 700 }}>
                                    {t.stats?.wins ?? 0}
                                  </td>
                                  <td style={{ color: "var(--text-ter)" }}>
                                    {t.stats?.losses ?? 0}
                                  </td>
                                  <td>{t.stats?.pointDifference ?? 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                        const key = roundTypeLabel(m.roundType);
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(m);
                        return acc;
                      }, {})
                    ).map(([roundName, matches]) => (
                      <div key={roundName}>
                        <div className={styles.roundLabel}>{roundName}</div>
                        {matches.map((m) => (
                          <MatchScoreCard
                            key={m.matchId}
                            match={m}
                            expanded={String(expandedId) === String(m.matchId)}
                            onToggle={() =>
                              setExpandedId((id) =>
                                String(id) === String(m.matchId)
                                  ? ""
                                  : String(m.matchId)
                              )
                            }
                            draft={drafts[m.matchId]}
                            onDraftChange={(next) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [m.matchId]: next,
                              }))
                            }
                            onSave={() => handleSave(m)}
                            saving={String(savingId) === String(m.matchId)}
                            readOnly={readOnly}
                          />
                        ))}
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
                  Finish all Round Robin matches first — the playoff bracket can
                  be generated once every pool match has a saved result.
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
