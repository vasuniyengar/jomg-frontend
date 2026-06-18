"use client";

import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import { DIVISION_COLORS } from "@/lib/divisions";
import styles from "../../draw/draw.module.css";


// ─── Helpers ────────────────────────────────────────────────────────────────

function toDateInput(value) {
  if (!value) return "";
  const s = typeof value === "string" ? value : new Date(value).toISOString();
  return s.slice(0, 10);
}

function MatchStatusPill({ status }) {
  const cls =
    status === "completed"
      ? "pill-success"
      : status === "bye"
      ? "pill-default"
      : status === "in_progress"
      ? "pill-warning"
      : "pill-default";
  return (
    <span className={`pill ${cls}`}>
      {status === "bye" ? "Bye" : status.replace("_", " ")}
    </span>
  );
}

// ─── Score submission modal ──────────────────────────────────────────────────

function ScoreModal({ match, roundName, seed1, seed2, onClose, onSubmit, submitting, error }) {
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  const team1Name = match.team1?.teamName ?? "TBD";
  const team2Name = match.team2?.teamName ?? "TBD";

  const handleSubmit = () => {
    const s1 = Number(score1);
    const s2 = Number(score2);
    if (score1 === "" || score2 === "") return;
    if (s1 === s2) return;
    onSubmit(match.matchId, s1, s2);
  };

  const valid = score1 !== "" && score2 !== "" && Number(score1) !== Number(score2);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "20px 24px",
          width: 320,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-sec)",
            marginBottom: 16,
          }}
        >
          Submit score — {roundName}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {/* Team 1 row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {seed1 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-sec)", width: 18, flexShrink: 0 }}>
                #{seed1}
              </span>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1, color: "var(--text-primary, #fff)" }}>
              {team1Name}
            </span>
            <input
              type="number"
              min="0"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              placeholder="0"
              style={{
                width: 56,
                textAlign: "center",
                fontSize: 16,
                fontWeight: 700,
                padding: "5px 6px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Team 2 row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {seed2 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-sec)", width: 18, flexShrink: 0 }}>
                #{seed2}
              </span>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1, color: "var(--text-primary, #fff)" }}>
              {team2Name}
            </span>
            <input
              type="number"
              min="0"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              placeholder="0"
              style={{
                width: 56,
                textAlign: "center",
                fontSize: 16,
                fontWeight: 700,
                padding: "5px 6px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-input, var(--card-bg))",
                color: "var(--text-primary)"
              }}
            />
          </div>
        </div>

        {/* Tie warning */}
        {score1 !== "" && score2 !== "" && Number(score1) === Number(score2) && (
          <div style={{ fontSize: 12, color: "var(--color-danger, #e05252)", marginBottom: 12 }}>
            Scores cannot be tied.
          </div>
        )}

        {error && (
          <div style={{ fontSize: 12, color: "var(--color-danger, #e05252)", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-ghost btn-sm"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            {submitting ? "Saving…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Single match card ───────────────────────────────────────────────────────

function MatchCard({ match, roundName, seed1, seed2, matchRef, onMatchClick }) {
  const isBye = match.isBye || match.status === "bye";
  const isClickable =
    !isBye &&
    match.status !== "completed" &&
    match.status !== "pending" &&
    match.team1 &&
    match.team2;

  const team1Name = match.team1?.teamName ?? "TBD";
  const team2Name = match.team2?.teamName ?? "TBD";

  return (
    <div
      ref={matchRef}
      onClick={isClickable ? () => onMatchClick(match) : undefined}
      style={{
        width: 200,
        flexShrink: 0,
        cursor: isClickable ? "pointer" : "default",
        borderRadius: 8,
        border: `1px solid ${isClickable ? "var(--primary)" : "var(--border, rgba(255,255,255,0.08))"}`,
        overflow: "hidden",
        background: "var(--card-bg)",
        minHeight: 80,
      }}
    >
      {/* Round eyebrow */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--border, rgba(255,255,255,0.08))",
          background: "var(--surface-raised, rgba(255,255,255,0.03))",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-ter)",
          fontFamily: "var(--font-display, inherit)",
        }}
      >
        {roundName}
      </div>

      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Team 1 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          {seed1 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-ter)", fontFamily: "var(--font-display, inherit)", minWidth: 18 }}>
              #{seed1}
            </span>
          )}
          <span
            style={{
              fontWeight: match.winnerTeamId === match.team1?.teamId ? 700 : 500,
              fontSize: 13,
              color: match.winnerTeamId && match.winnerTeamId !== match.team1?.teamId
                ? "var(--text-ter)"
                : "var(--text)",
              flex: 1,
              fontStyle: !match.team1 ? "italic" : "normal",
            }}
          >
            {team1Name}
          </span>
          {match.status === "completed" && (
            <span style={{ fontSize: 13, fontWeight: 700 }}>{match.scoreTeam1}</span>
          )}
        </div>

        {/* vs / bye */}
        <div style={{ fontSize: 10, color: "var(--text-ter)", paddingLeft: seed1 ? 24 : 0, fontStyle: "italic" }}>
          {isBye ? "— bye —" : "vs"}
        </div>

        {/* Team 2 */}
        {!isBye && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            {seed2 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-ter)", fontFamily: "var(--font-display, inherit)", minWidth: 18 }}>
                #{seed2}
              </span>
            )}
            <span
              style={{
                fontWeight: match.winnerTeamId === match.team2?.teamId ? 700 : 500,
                fontSize: 13,
                color: match.winnerTeamId && match.winnerTeamId !== match.team2?.teamId
                  ? "var(--text-ter)"
                  : "var(--text)",
                flex: 1,
                fontStyle: !match.team2 ? "italic" : "normal",
              }}
            >
              {team2Name}
            </span>
            {match.status === "completed" && (
              <span style={{ fontSize: 13, fontWeight: 700 }}>{match.scoreTeam2}</span>
            )}
          </div>
        )}

        {/* Status */}
        <div style={{ fontSize: 10, color: "var(--text-ter)", paddingLeft: seed1 ? 24 : 0, marginTop: 2 }}>
          {isClickable ? "click to score" : match.status === "completed" ? "Final" : "pending"}
        </div>
      </div>
    </div>
  );
}

// ─── Seeding table ───────────────────────────────────────────────────────────

function SeedingTable({ seeds }) {
  if (!seeds?.length) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "var(--text-sec)",
          marginBottom: 8,
        }}
      >
        Seedings
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 50 }}>Seed</th>
              <th>Team</th>
              <th style={{ width: 70, textAlign: "center" }}>Wins</th>
              <th style={{ width: 90, textAlign: "center" }}>Points For</th>
            </tr>
          </thead>
          <tbody>
            {seeds.map((s) => (
              <tr key={s.teamId}>
                <td style={{ fontWeight: 700 }}>#{s.seed}</td>
                <td style={{ fontWeight: 500 }}>{s.teamName ?? `Team ${s.teamId}`}</td>
                <td style={{ textAlign: "center" }}>{s.wins}</td>
                <td style={{ textAlign: "center" }}>{s.pointsFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Bracket view ────────────────────────────────────────────────────────────

const MATCH_HEIGHT = 80;
const BASE_GAP = 16;
const CONNECTOR_WIDTH = 40;

function BracketView({ rounds, seeds, onMatchClick }) {
  const containerRef = useRef(null);
  const matchRefs = useRef({});
  const [lines, setLines] = useState([]);

  if (!rounds?.length) return null;

  const seedMap = {};
  seeds?.forEach((s) => { seedMap[s.teamId] = s.seed; });

  useEffect(() => {
    if (!containerRef.current) return;

    const compute = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const computed = [];

      for (let ri = 0; ri < rounds.length - 1; ri++) {
        const nextRound = rounds[ri + 1];
        nextRound.matches.forEach((_, nextMatchIdx) => {
          const srcIdx1 = nextMatchIdx * 2;
          const srcIdx2 = nextMatchIdx * 2 + 1;

          const elA1 = matchRefs.current[`${ri}-${srcIdx1}`];
          const elA2 = matchRefs.current[`${ri}-${srcIdx2}`];
          const elB  = matchRefs.current[`${ri + 1}-${nextMatchIdx}`];

          if (!elA1 || !elB) return;

          const rA1 = elA1.getBoundingClientRect();
          const rB  = elB.getBoundingClientRect();

          const x1 = rA1.right - containerRect.left;
          const y1 = rA1.top + rA1.height / 2 - containerRect.top;
          const x2 = rB.left - containerRect.left;
          const y2 = rB.top + rB.height / 2 - containerRect.top;
          const midX = x1 + CONNECTOR_WIDTH / 2;

          computed.push({ x1, y1, x2: midX, y2: y1, key: `${ri}-${nextMatchIdx}-a1` });

          if (elA2) {
            const rA2 = elA2.getBoundingClientRect();
            const y1b = rA2.top + rA2.height / 2 - containerRect.top;
            const x1b = rA2.right - containerRect.left;

            computed.push({ x1: x1b, y1: y1b, x2: midX, y2: y1b, key: `${ri}-${nextMatchIdx}-a2` });
            computed.push({ x1: midX, y1, x2: midX, y2: y1b, key: `${ri}-${nextMatchIdx}-v` });

            const bridgeY = (y1 + y1b) / 2;
            computed.push({ x1: midX, y1: bridgeY, x2, y2, key: `${ri}-${nextMatchIdx}-b` });
          } else {
            computed.push({ x1: midX, y1, x2, y2, key: `${ri}-${nextMatchIdx}-b` });
          }
        });
      }

      setLines(computed);
    };

    compute();
    const raf = requestAnimationFrame(compute);
    return () => cancelAnimationFrame(raf);
  }, [rounds]);

  return (
    <div ref={containerRef} style={{ position: "relative", overflowX: "auto" }}>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {lines.map((l) => (
          <line
            key={l.key}
            x1={l.x1} y1={l.y1}
            x2={l.x2} y2={l.y2}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div
        style={{
          display: "flex",
          gap: CONNECTOR_WIDTH,
          alignItems: "flex-start",
          paddingBottom: 8,
          minWidth: "max-content",
          position: "relative",
          zIndex: 1,
        }}
      >
        {rounds.map((round, roundIndex) => {
          const gap = roundIndex === 0
            ? BASE_GAP
            : (Math.pow(2, roundIndex) - 1) * (MATCH_HEIGHT + BASE_GAP) + BASE_GAP;

          return (
            <div
              key={round.roundId}
              style={{ display: "flex", flexDirection: "column", gap }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "var(--text-sec)",
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--border)",
                  whiteSpace: "nowrap",
                  marginBottom: roundIndex === 0 ? 0 : -(gap - BASE_GAP),
                }}
              >
                {round.name}
              </div>

              {round.matches.map((match, matchIndex) => (
                <MatchCard
                  key={match.matchId ?? matchIndex}
                  match={match}
                  roundName={round.name}
                  seed1={match.team1 ? seedMap[match.team1.teamId] : null}
                  seed2={match.team2 ? seedMap[match.team2.teamId] : null}
                  matchRef={(el) => {
                    if (el) matchRefs.current[`${roundIndex}-${matchIndex}`] = el;
                  }}
                  onMatchClick={onMatchClick}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main playoff view for one bracket ──────────────────────────────────────

function PlayoffView({ bracketId, tournamentId, onGenerate, onDelete, generating }) {
  const [playoffData, setPlayoffData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Score modal state
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeRoundName, setActiveRoundName] = useState("");
  const [activeSeed1, setActiveSeed1] = useState(null);
  const [activeSeed2, setActiveSeed2] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadPlayoffs = async (cancelled = { current: false }) => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest(
        `/api/tournaments/${tournamentId}/brackets/${bracketId}/playoffs`
      );
      if (!cancelled.current) setPlayoffData(data.data ?? null);
    } catch (err) {
      if (!cancelled.current && !err.message?.includes("404")) setError(err.message);
      if (!cancelled.current) setPlayoffData(null);
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!bracketId || !tournamentId) return;
    const cancelled = { current: false };
    loadPlayoffs(cancelled);
    return () => { cancelled.current = true; };
  }, [bracketId, tournamentId]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const data = await apiRequest(
        `/api/tournaments/${tournamentId}/brackets/${bracketId}/playoffs`,
        { method: "POST" }
      );
      setPlayoffData(data.data ?? null);
      setSuccess("Playoff bracket generated.");
      if (onGenerate) onGenerate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this bracket? This cannot be undone.")) return;
    try {
      setError("");
      setSuccess("");
      await apiRequest(
        `/api/tournaments/${tournamentId}/brackets/${bracketId}/playoffs`,
        { method: "DELETE" }
      );
      setPlayoffData(null);
      setSuccess("Playoff bracket deleted.");
      if (onDelete) onDelete();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMatchClickFromBracket = (match) => {
    const seedMap = {};
    playoffData?.seeds?.forEach((s) => { seedMap[s.teamId] = s.seed; });
    const seed1 = match.team1 ? seedMap[match.team1.teamId] : null;
    const seed2 = match.team2 ? seedMap[match.team2.teamId] : null;
    const round = playoffData?.rounds?.find((r) =>
      r.matches.some((m) => m.matchId === match.matchId)
    );
    setActiveMatch(match);
    setActiveRoundName(round?.name ?? "");
    setActiveSeed1(seed1);
    setActiveSeed2(seed2);
    setSubmitError("");
  };

  const handleScoreSubmit = async (matchId, scoreTeam1, scoreTeam2) => {
    try {
      setSubmitting(true);
      setSubmitError("");
      await apiRequest(
        `/api/tournaments/${tournamentId}/brackets/${bracketId}/playoffs/advance`,
        {
          method: "POST",
          body: JSON.stringify({ matchId, scoreTeam1, scoreTeam2 }),
        }
      );
      setActiveMatch(null);
      await loadPlayoffs();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasPlayoff = !loading && playoffData?.rounds?.length > 0;
  const bracketKey = hasPlayoff
    ? playoffData.rounds.map((r) => r.roundId).join("-")
    : "empty";

  return (
    <div>
      {error && (
        <div className="bulk-upload-error" style={{ marginBottom: 12 }}>{error}</div>
      )}
      {success && (
        <div className="bulk-upload-success" style={{ marginBottom: 12 }}>{success}</div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
          padding: "12px 0",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {hasPlayoff && (
          <div style={{ fontSize: 13, color: "var(--text-sec)" }}>
            {playoffData.totalTeams} teams ·{" "}
            {playoffData.byeCount > 0 &&
              `${playoffData.byeCount} bye${playoffData.byeCount !== 1 ? "s" : ""} · `}
            bracket size {playoffData.bracketSize}
          </div>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {hasPlayoff && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--color-text-danger)" }}
            >
              Delete playoff
            </button>
          )}
          <button
            type="button"
            disabled={generating || loading || hasPlayoff}
            onClick={handleGenerate}
            className="btn btn-primary btn-sm"
          >
            {loading
              ? "Loading…"
              : generating
              ? "Generating…"
              : hasPlayoff
              ? "Already generated"
              : "Generate playoffs"}
          </button>
        </div>
      </div>

      {loading && (
        <p style={{ color: "var(--text-sec)", fontSize: 13 }}>Loading playoff bracket…</p>
      )}

      {!loading && (!playoffData || !playoffData.rounds || playoffData.rounds.length === 0) && (
        <div style={{ padding: "20px 0", color: "var(--text-sec)", fontSize: 13 }}>
          No playoff bracket yet — click <strong>Generate playoffs</strong> to seed teams from round robin results.
        </div>
      )}

      {hasPlayoff && (
        <>
          <SeedingTable seeds={playoffData.seeds} />
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "var(--text-sec)",
              marginBottom: 10,
            }}
          >
            Bracket
          </div>
          <BracketView
            key={bracketKey}
            rounds={playoffData.rounds}
            seeds={playoffData.seeds}
            onMatchClick={handleMatchClickFromBracket}
          />
        </>
      )}

      {activeMatch && (
        <ScoreModal
          match={activeMatch}
          roundName={activeRoundName}
          seed1={activeSeed1}
          seed2={activeSeed2}
          onClose={() => { setActiveMatch(null); setSubmitError(""); }}
          onSubmit={handleScoreSubmit}
          submitting={submitting}
          error={submitError}
        />
      )}
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function PlayoffBracketScreen({ tournamentId }) {
  const [brackets, setBrackets] = useState([]);
  const [selectedBracketId, setSelectedBracketId] = useState(null);
  const [loadingBrackets, setLoadingBrackets] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("tournamentId on mount:", tournamentId);
    if (!tournamentId) return;
    const load = async () => {
      try {
        setLoadingBrackets(true);
        const data = await apiRequest(`/api/host/${tournamentId}/brackets`);
        const { men = [], women = [], mixed = [] } = data.data || {};
        setBrackets([...men, ...women, ...mixed]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingBrackets(false);
      }
    };
    load();
  }, [tournamentId]);

  const handleToggle = (id) => {
    setSelectedBracketId((prev) => (prev === id ? null : id));
    setError("");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Playoff Bracket</h1>
        </div>
      </div>

      <div className="content">
        {error && (
          <div className="bulk-upload-error" style={{ marginBottom: 12 }}>{error}</div>
        )}

        {loadingBrackets ? (
          <p style={{ color: "var(--text-sec)", padding: 12 }}>Loading brackets…</p>
        ) : brackets.length === 0 ? (
          <div className="card" style={{ padding: 24, color: "var(--text-sec)" }}>
            No brackets found for this tournament.
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "var(--text-sec)",
                marginBottom: 10,
              }}
            >
              Select division
            </div>

            {brackets.map((bracket, i) => {
              const isOpen = String(bracket.id) === String(selectedBracketId);
              const pct = bracket.maxTeams
                ? Math.min(100, Math.round(((bracket.registeredCount || 0) / bracket.maxTeams) * 100))
                : 0;
              const color = DIVISION_COLORS[i % DIVISION_COLORS.length];

              return (
                <div
                  key={bracket.id}
                  className={`${styles.expandCard}${isOpen ? ` ${styles.expandCardOpen}` : ""}`}
                >
                  <div className={styles.expandHeader} onClick={() => handleToggle(String(bracket.id))}>
                    <div className={styles.colorStripe} style={{ background: color }} aria-hidden />
                    <div className={styles.rowMain}>
                      <div className={styles.rowTitle}>
                        {bracket.name}
                        <span style={{ fontSize: 11, color: "var(--text-ter)", fontWeight: 500 }}>
                          · {bracket.formatLabel || bracket.Event?.eventName || ""}
                        </span>
                      </div>
                      <div className={styles.rowMeta}>
                        <strong style={{ color: "var(--text)" }}>{bracket.formatLabel || "—"}</strong>
                        {bracket.registrationFee != null ? ` · $${Number(bracket.registrationFee)}/entry` : ""}
                        {" · "}
                        {bracket.registeredCount || 0}/{bracket.maxTeams} teams
                      </div>
                    </div>
                    <div className={styles.rowAside}>
                      <div className={styles.capacityCol}>
                        <div className={styles.capacityNum}>
                          {bracket.registeredCount || 0}
                          <span className={styles.capacityDenom}>/{bracket.maxTeams}</span>
                        </div>
                        <div className={`progress-bar ${styles.capacityBar}`}>
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`}>▾</span>
                    </div>
                  </div>

                  {/* ↓ CHANGED: always mounted, hidden with display:none when closed */}
                  <div
                    className={styles.expandBody}
                    style={{ display: isOpen ? "block" : "none" }}
                  >
                    <PlayoffView
                      key={bracket.id}
                      bracketId={String(bracket.id)}
                      tournamentId={tournamentId}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}