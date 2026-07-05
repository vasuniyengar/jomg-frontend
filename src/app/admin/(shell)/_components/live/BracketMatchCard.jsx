"use client";

import live from "../../_styles/livePlay.module.css";

function teamLabel(team, fallback = "TBD") {
  if (!team) return fallback;
  if (team.teamName) return team.teamName;
  if (typeof team === "string") return team;
  return fallback;
}

function scoreClass(isLoser) {
  return isLoser ? live.bracketScoreLoser : live.bracketScore;
}

export default function BracketMatchCard({
  team1,
  team2,
  score1,
  score2,
  seed1,
  seed2,
  status,
  liveLabel,
  winnerTeamId,
  team1Id,
  team2Id,
}) {
  const isLive = status === "ongoing";
  const isDone = status === "completed";
  const t1Won =
    isDone && winnerTeamId && team1Id && Number(winnerTeamId) === Number(team1Id);
  const t2Won =
    isDone && winnerTeamId && team2Id && Number(winnerTeamId) === Number(team2Id);
  const t1Lost = isDone && winnerTeamId && team1Id && !t1Won;
  const t2Lost = isDone && winnerTeamId && team2Id && !t2Won;

  return (
    <div
      className={`${live.bracketMatchCard}${isLive ? ` ${live.bracketMatchCardLive}` : ""}`}
    >
      {isLive && liveLabel ? (
        <div className={live.bracketLiveLabel}>{liveLabel}</div>
      ) : null}
      <div className={live.bracketRow} style={{ padding: "4px 0" }}>
        {seed1 != null ? <div className={live.bracketSeed}>{seed1}</div> : null}
        <div
          className={`${live.bracketPlayer}${t1Won || (isLive && !t1Lost) ? ` ${live.bracketPlayerWinner}` : ""}`}
        >
          {teamLabel(team1)}
        </div>
        <div className={scoreClass(t1Lost)}>{score1 ?? "—"}</div>
      </div>
      <div className={live.bracketRow} style={{ padding: "4px 0", border: "none" }}>
        {seed2 != null ? <div className={live.bracketSeed}>{seed2}</div> : null}
        <div className={`${live.bracketPlayer}${t2Won || (isLive && !t2Lost) ? ` ${live.bracketPlayerWinner}` : ""}`}>
          {teamLabel(team2, "BYE")}
        </div>
        <div className={scoreClass(t2Lost)}>{score2 ?? "—"}</div>
      </div>
    </div>
  );
}
