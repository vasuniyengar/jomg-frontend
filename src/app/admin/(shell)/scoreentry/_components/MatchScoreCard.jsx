"use client";

import Link from "next/link";
import {
  DB_GAME,
  MLP_GAMES,
  dreambreakerActive,
  gamesWon,
  matchClinched,
  mlpLineupFromPlayers,
} from "./mlpScoring";
import styles from "../scoreentry.module.css";

function statusMeta(match, mlpState, court, isMlp) {
  if (!isMlp || !mlpState) {
    if (match.status === "completed") {
      return { label: "Complete", color: "#00c84a", bg: "rgba(0,200,80,0.12)" };
    }
    if (match.status === "ongoing") {
      return { label: "● Live", color: "#e0a000", bg: "rgba(224,160,0,0.12)" };
    }
    if (court) {
      return {
        label: `Scheduled · ${court}`,
        color: "#3b9eff",
        bg: "rgba(59,158,255,0.12)",
      };
    }
    return { label: "Not started", color: "var(--text-ter)", bg: "var(--badge-bg)" };
  }

  const savedCount = mlpState.games.slice(0, 4).filter((g) => g.saved).length;
  const w = gamesWon(mlpState);
  const dbActive = dreambreakerActive(mlpState);
  const dbSaved = mlpState.games[4].saved;

  if (savedCount === 0) {
    if (court) {
      return {
        label: `Scheduled · ${court}`,
        color: "#3b9eff",
        bg: "rgba(59,158,255,0.12)",
      };
    }
    return { label: "Not started", color: "var(--text-ter)", bg: "var(--badge-bg)" };
  }
  if (savedCount < 4) {
    return {
      label: `${savedCount}/4 games`,
      color: "#e0a000",
      bg: "rgba(224,160,0,0.12)",
    };
  }
  if (dbActive && !dbSaved) {
    return { label: "Dreambreaker", color: "#ff5555", bg: "rgba(255,68,68,0.12)" };
  }
  return { label: "Complete", color: "#00c84a", bg: "rgba(0,200,80,0.12)" };
}

function teamSeedLabel(seed, name) {
  if (seed != null && seed !== "") return `#${seed} ${name}`;
  return name || "TBD";
}

function SimpleScoreCard({
  match,
  expanded,
  onToggle,
  draft,
  onDraftChange,
  onSave,
  saving,
  readOnly,
  court,
}) {
  const st = statusMeta(match, null, court, false);
  const s1 = draft?.scoreTeam1 ?? match.scoreTeam1 ?? 0;
  const s2 = draft?.scoreTeam2 ?? match.scoreTeam2 ?? 0;
  const phase =
    match.roundType === "pool" ? "Round Robin" : match.roundType || "Playoff";

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
        {court ? <span className={styles.courtChip}>🏟 {court}</span> : null}
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

function MlpGameRow({
  gi,
  game,
  homePair,
  awayPair,
  isDb,
  disabled,
  clinchedLock,
  submitBlocked,
  readOnly,
  onScoreChange,
  onSubmit,
  onReset,
}) {
  const rowSaved = game.saved;
  const rowBg = rowSaved
    ? "rgba(0,200,80,0.06)"
    : isDb
      ? "rgba(255,68,68,0.05)"
      : "var(--card)";
  const rowBorder = rowSaved
    ? "rgba(0,200,80,0.35)"
    : isDb
      ? "rgba(255,68,68,0.3)"
      : "var(--border)";

  return (
    <div
      className={styles.gameRow}
      style={{
        borderColor: rowBorder,
        background: rowBg,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <div className={styles.gameLabelCol}>
        <div className={styles.gameLabel}>{game.label || (isDb ? DB_GAME.label : "")}</div>
        {isDb && disabled && !rowSaved ? (
          <div className={styles.gameHint}>only if tied 2–2</div>
        ) : clinchedLock ? (
          <div className={styles.gameHint}>match decided</div>
        ) : (
          <div className={styles.gameHint}>{rowSaved ? "saved" : ""}</div>
        )}
      </div>

      <div className={styles.gameLineupCol}>
        {isDb ? (
          <div className={styles.gameDbHint}>Singles relay — winner takes the match</div>
        ) : (
          <>
            <div className={styles.lineupLine}>{homePair}</div>
            <div className={styles.lineupLine}>{awayPair}</div>
          </>
        )}
      </div>

      <div className={styles.gameScoreCol}>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className={styles.gameScoreInput}
          value={game.a}
          disabled={readOnly || disabled}
          onChange={(e) => onScoreChange(gi, "a", e.target.value)}
        />
        <span className={styles.gameScoreDash}>–</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className={styles.gameScoreInput}
          value={game.b}
          disabled={readOnly || disabled}
          onChange={(e) => onScoreChange(gi, "b", e.target.value)}
        />
      </div>

      {rowSaved ? (
        <button
          type="button"
          className={styles.gameSavedBtn}
          disabled={readOnly}
          onClick={() => onReset(gi)}
        >
          ✓ Saved
        </button>
      ) : (
        <button
          type="button"
          className={`btn btn-sm ${styles.gameSubmitBtn}`}
          disabled={readOnly || disabled || submitBlocked}
          title={submitBlocked ? "Assign a court before submitting" : "Submit this game"}
          onClick={() => onSubmit(gi)}
        >
          Submit
        </button>
      )}

      <button
        type="button"
        className={styles.gameResetBtn}
        disabled={readOnly || (!rowSaved && game.a === "" && game.b === "")}
        title="Reset this game's score"
        onClick={() => onReset(gi)}
      >
        ↺
      </button>
    </div>
  );
}

export default function MatchScoreCard({
  match,
  matchIndex,
  expanded,
  onToggle,
  mlpState,
  onMlpStateChange,
  onMlpComplete,
  onMatchReset,
  onGameSave,
  onGameReset,
  onCourtChange,
  team1Players = [],
  team2Players = [],
  courts = [],
  courtsAvailable = true,
  livePlayHref,
  draft,
  onDraftChange,
  onSave,
  saving,
  readOnly,
  isMlp,
}) {
  if (!isMlp) {
    return (
      <SimpleScoreCard
        match={match}
        expanded={expanded}
        onToggle={onToggle}
        draft={draft}
        onDraftChange={onDraftChange}
        onSave={onSave}
        saving={saving}
        readOnly={readOnly}
        court={mlpState?.court}
      />
    );
  }

  const st = mlpState;
  const court = st?.court || "";
  const lineupHome = mlpLineupFromPlayers(team1Players);
  const lineupAway = mlpLineupFromPlayers(team2Players);
  const w = gamesWon(st);
  const savedCount = st.games.slice(0, 4).filter((g) => g.saved).length;
  const dbActive = dreambreakerActive(st);
  const clinched = matchClinched(st);
  const isPlayoff = match.roundType && match.roundType !== "pool";
  const submitGated = !isPlayoff && !court;
  const meta = statusMeta(match, st, court, true);
  const phaseLabel = isPlayoff ? "Playoff" : "Round Robin";
  // Series rows are persisted per game — allow all regulation games even after clinch
  const lockAfterClinch = !match.isSeries;

  const setGameScore = (gi, side, val) => {
    const n = parseInt(val, 10);
    const games = st.games.map((g, i) =>
      i === gi ? { ...g, [side]: isNaN(n) ? "" : Math.max(0, n) } : g
    );
    onMlpStateChange({ ...st, games });
  };

  const submitGame = async (gi) => {
    if (submitGated) {
      window.alert(
        "Assign a court before submitting this game.\n\nUse the court picker at the top of the match card."
      );
      return;
    }
    const g = st.games[gi];
    if (g.a === "" || g.b === "") {
      window.alert("Enter both scores before submitting this game.");
      return;
    }
    if (parseInt(g.a, 10) === parseInt(g.b, 10)) {
      window.alert("A game cannot end in a tie — check the score.");
      return;
    }

    // Persisted series: each row is its own Match
    if (match.isSeries && typeof onGameSave === "function") {
      const gameMatchId = g.matchId || match.games?.[gi]?.matchId;
      if (!gameMatchId) {
        window.alert("This game is missing a match id — regenerate the draw.");
        return;
      }
      const ok = await onGameSave(match, gameMatchId, g.a, g.b);
      if (!ok) return;
      return;
    }

    const games = st.games.map((gm, i) => (i === gi ? { ...gm, saved: true } : gm));
    const next = { ...st, games };
    onMlpStateChange(next);
    const done = await onMlpComplete(match, next);
    if (done) return;
    onMlpStateChange(next);
  };

  const resetGame = async (gi) => {
    if (readOnly) return;

    const g = st.games[gi];
    if (match.isSeries && typeof onGameReset === "function") {
      const gameMatchId = g?.matchId || match.games?.[gi]?.matchId;
      if (gameMatchId && (g?.saved || match.games?.[gi]?.status === "completed")) {
        await onGameReset(match, gameMatchId);
        return;
      }
    }

    const games = st.games.map((row, i) =>
      i === gi ? { ...row, a: "", b: "", saved: false } : row
    );
    const next = { ...st, games };
    onMlpStateChange(next);

    const matchWasSaved =
      match.status === "completed" ||
      match.status === "ongoing" ||
      Number(match.scoreTeam1) > 0 ||
      Number(match.scoreTeam2) > 0;

    if (!match.isSeries && matchWasSaved && typeof onMatchReset === "function") {
      await onMatchReset(match);
    }
  };

  const submitAll = async () => {
    if (submitGated) {
      window.alert("Assign a court before submitting.");
      return;
    }
    const teamGames = st.games.slice(0, 4);
    const missing = teamGames.find((g) => g.a === "" || g.b === "");
    if (missing) {
      window.alert("Enter all four team game scores before submitting together.");
      return;
    }
    const tied = teamGames.find((g) => parseInt(g.a, 10) === parseInt(g.b, 10));
    if (tied) {
      window.alert("A game cannot end in a tie — check the scores.");
      return;
    }
    const wAfter = gamesWon({
      ...st,
      games: teamGames.map((g) => ({ ...g, saved: true })),
    });
    if (wAfter.home === 2 && wAfter.away === 2) {
      const db = st.games[4];
      if (db.a === "" || db.b === "") {
        window.alert("Games are tied 2–2 — enter and submit the Dreambreaker.");
        return;
      }
    }

    if (match.isSeries && typeof onGameSave === "function") {
      const toSave = [];
      for (let i = 0; i < 4; i++) {
        toSave.push(i);
      }
      if (wAfter.home === 2 && wAfter.away === 2) toSave.push(4);
      for (const gi of toSave) {
        const g = st.games[gi];
        if (g.saved) continue;
        const gameMatchId = g.matchId || match.games?.[gi]?.matchId;
        if (!gameMatchId) continue;
        const ok = await onGameSave(match, gameMatchId, g.a, g.b);
        if (!ok) return;
      }
      return;
    }

    const games = st.games.map((g, i) => (i < 4 ? { ...g, saved: true } : g));
    const next = { ...st, games };
    onMlpStateChange(next);
    await onMlpComplete(match, next);
  };

  const allTeamGamesFilled = st.games.slice(0, 4).every((g) => g.a !== "" && g.b !== "");

  const renderGame = (gi, gDef, isDb) => {
    const game = { ...st.games[gi], label: gDef.label };
    const clinchedLock = lockAfterClinch && clinched && !game.saved;
    const disabled =
      (isDb && !dbActive && !game.saved) || clinchedLock || readOnly;
    const homePair = isDb
      ? "Dreambreaker lineup"
      : (lineupHome[gDef.key] || ["—", "—"]).join(" & ");
    const awayPair = isDb
      ? "Dreambreaker lineup"
      : (lineupAway[gDef.key] || ["—", "—"]).join(" & ");

    return (
      <MlpGameRow
        key={gDef.key}
        gi={gi}
        game={game}
        homePair={homePair}
        awayPair={awayPair}
        isDb={isDb}
        disabled={disabled}
        clinchedLock={clinchedLock}
        submitBlocked={submitGated && !game.saved}
        readOnly={readOnly}
        onScoreChange={setGameScore}
        onSubmit={submitGame}
        onReset={resetGame}
      />
    );
  };

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
            {phaseLabel}
            {matchIndex != null ? ` · Match ${matchIndex}` : ""}
            {match.roundNumber ? ` · Round ${match.roundNumber}` : ""}
            {savedCount > 0 || match.status === "completed"
              ? ` · games ${w.home}–${w.away}`
              : ""}
          </div>
        </div>
        {court ? <span className={styles.courtChip}>🏟 {court}</span> : null}
        <span
          className={styles.statusPill}
          style={{ color: meta.color, background: meta.bg }}
        >
          {meta.label}
        </span>
        <span
          className={`${styles.chevron}${expanded ? ` ${styles.chevronOpen}` : ""}`}
        >
          ▾
        </span>
      </button>

      {expanded ? (
        <div className={styles.matchBody}>
          <div
            className={styles.duprRow}
            style={{
              borderColor: st.duprOn ? "var(--primary-border)" : "var(--border)",
              background: st.duprOn ? "var(--primary-dim)" : "var(--badge-bg)",
            }}
          >
            <span className="dupr-badge" style={{ fontSize: 9 }}>
              DUPR
            </span>
            <div className={styles.duprCopy}>
              <div className={styles.duprTitle}>DUPR Recorded</div>
              <div className={styles.duprSub}>
                {st.duprOn
                  ? "This match's games will be submitted to DUPR."
                  : "This match will NOT be submitted to DUPR."}
              </div>
            </div>
            <label className="mini-toggle" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={st.duprOn}
                disabled={readOnly}
                onChange={() => onMlpStateChange({ ...st, duprOn: !st.duprOn })}
              />
              <span className="mini-slider" />
            </label>
          </div>

          {!courtsAvailable && !isPlayoff ? (
            <div className={styles.courtWarn}>
              <span>📍</span>
              <div className={styles.courtWarnCopy}>
                <div className={styles.courtWarnTitle}>Court Assignment</div>
                <div className={styles.courtWarnSub}>
                  No courts assigned to this division yet — submit is disabled until a
                  court is assigned.
                </div>
              </div>
              {livePlayHref ? (
                <Link href={livePlayHref} className={styles.courtWarnLink}>
                  Open Live Play →
                </Link>
              ) : null}
            </div>
          ) : (
            <div
              className={styles.courtRow}
              style={{
                borderColor: court ? "rgba(59,158,255,0.4)" : "var(--border)",
                background: court ? "rgba(59,158,255,0.08)" : "var(--badge-bg)",
              }}
            >
              <span>🏟</span>
              <div className={styles.courtCopy}>
                <div className={styles.courtTitle}>
                  Court Assignment
                  {court ? <span className={styles.courtChipInline}>🏟 {court}</span> : null}
                </div>
                <div className={styles.courtSub}>
                  {court
                    ? "Court assigned — scores can be submitted."
                    : "Assign a court before submitting scores."}
                </div>
              </div>
              <select
                className={`form-select ${styles.courtSelect}`}
                value={court}
                disabled={readOnly}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const nextCourt = e.target.value;
                  onMlpStateChange({ ...st, court: nextCourt });
                  if (typeof onCourtChange === "function") {
                    onCourtChange(match, nextCourt);
                  }
                }}
              >
                <option value="">— Unassigned —</option>
                {courts.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {MLP_GAMES.map((g, gi) => renderGame(gi, g, false))}
          {renderGame(4, DB_GAME, true)}

          <div className={styles.submitAllBar}>
            <div className={styles.submitAllHint}>
              {submitGated
                ? "⚠ Assign a court before submitting any score."
                : dbActive
                  ? "Games tied 2–2 — enter the Dreambreaker."
                  : allTeamGamesFilled
                    ? "All 4 games entered — submit together."
                    : "Submit each game as you go, or enter all and submit together."}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={readOnly || submitGated || saving}
              onClick={submitAll}
            >
              {saving ? "Saving…" : "Submit all games"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
