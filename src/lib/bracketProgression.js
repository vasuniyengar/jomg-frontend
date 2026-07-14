import { apiRequest } from "./api";

export async function fetchPools(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/pools`
  );
  return response?.data || [];
}

export async function fetchPoolDetails(tournamentId, bracketId, poolId) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/pools/${poolId}`
  );
  return response?.data;
}

export async function createRoundRobin(tournamentId, bracketId, { teamsPerPool = 6, force = false } = {}) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/create-round-robin`,
    {
      method: "POST",
      body: { teamsPerPool, force },
    }
  );
  return response?.data;
}

export async function fetchPlayoffRounds(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/playoffs`
  );
  return response?.data || [];
}

export async function fetchOrCreatePlayoffs(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/create-playoffs`,
    { method: "POST" }
  );
  return response?.data || [];
}

export async function fetchFinalStandings(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/final-standings`
  );
  return response?.standings || [];
}

export async function fetchMatchDetails(matchId) {
  const response = await apiRequest(`/api/host/matches/${matchId}/match-details`);
  return response?.data;
}

export async function updateMatchScore(
  bracketId,
  matchId,
  { scoreTeam1, scoreTeam2, mlp = false, dreamBreaker } = {}
) {
  const body = {
    scoreTeam1,
    scoreTeam2,
  };
  if (mlp) body.mlp = true;
  if (typeof dreamBreaker === "boolean") body.dreamBreaker = dreamBreaker;

  const response = await apiRequest(
    `/api/host/${bracketId}/matches/${matchId}/update-match-score`,
    {
      method: "PUT",
      body,
    }
  );
  return response;
}

/**
 * Apply standings points after a completed pool match.
 * MLP: +3 per regulation game won; Dream Breaker +2 / +1
 */
export async function applyStandingsPoints(bracketId, matchId, { dreamBreaker } = {}) {
  const response = await apiRequest(
    `/api/host/${bracketId}/matches/${matchId}/apply-standings-points`,
    {
      method: "PUT",
      body: typeof dreamBreaker === "boolean" ? { dreamBreaker } : {},
    }
  );
  return response;
}

/** Reset a pool match score and recompute standings points for both teams. */
export async function resetMatchScore(matchId) {
  const response = await apiRequest(
    `/api/host/matches/${matchId}/reset-match-score`,
    { method: "PUT" }
  );
  return response;
}

/** Persist court assignment for a match (updates all games in an MLP series). */
export async function updateCourtAssignment(matchId, courtAssignment) {
  const response = await apiRequest(
    `/api/host/matches/${matchId}/court-assignment`,
    {
      method: "PUT",
      body: { courtAssignment: courtAssignment || null },
    }
  );
  return response;
}

function mapPoolMatch(m, pool, round, bracketId) {
  return {
    matchId: m.id,
    bracketId: Number(bracketId),
    poolId: pool.id,
    poolName: pool.poolName || pool.name,
    roundId: round.id || round.roundId || null,
    roundNumber: round.roundNumber,
    roundType: "pool",
    status: m.status || "pending",
    scoreTeam1: Number(m.scoreTeam1) || 0,
    scoreTeam2: Number(m.scoreTeam2) || 0,
    gameType: m.gameType ?? null,
    courtAssignment: m.courtAssignment || null,
    winnerTeamId: m.winnerTeamId || null,
    team1Id: m.team1?.id || m.Team1?.id || null,
    team2Id: m.team2?.id || m.Team2?.id || null,
    team1Name: formatTeamName(m.team1 || m.Team1),
    team2Name: formatTeamName(m.team2 || m.Team2),
    team1Seed: m.team1?.seed || m.Team1?.seed || null,
    team2Seed: m.team2?.seed || m.Team2?.seed || null,
  };
}

/** Collapse 5 game rows (WD/MD/X1/X2/DB) into one series card for Score Entry. */
export function groupPoolMatchesIntoSeries(flatMatches = []) {
  const bySeries = new Map();

  for (const m of flatMatches) {
    const key = `${m.poolId}:${m.roundId ?? m.roundNumber}:${m.team1Id}:${m.team2Id}`;
    if (!bySeries.has(key)) {
      bySeries.set(key, {
        seriesKey: key,
        matchId: m.matchId,
        bracketId: m.bracketId,
        poolId: m.poolId,
        poolName: m.poolName,
        roundId: m.roundId,
        roundNumber: m.roundNumber,
        roundType: m.roundType,
        team1Id: m.team1Id,
        team2Id: m.team2Id,
        team1Name: m.team1Name,
        team2Name: m.team2Name,
        team1Seed: m.team1Seed,
        team2Seed: m.team2Seed,
        courtAssignment: m.courtAssignment || null,
        games: [],
      });
    }
    const series = bySeries.get(key);
    if (!series.courtAssignment && m.courtAssignment) {
      series.courtAssignment = m.courtAssignment;
    }
    series.games.push({
      matchId: m.matchId,
      gameType: m.gameType ?? null,
      status: m.status,
      scoreTeam1: m.scoreTeam1,
      scoreTeam2: m.scoreTeam2,
      winnerTeamId: m.winnerTeamId,
      courtAssignment: m.courtAssignment || null,
    });
  }

  const seriesList = [];
  for (const series of bySeries.values()) {
    series.games.sort(
      (a, b) => (a.gameType || 0) - (b.gameType || 0) || a.matchId - b.matchId
    );
    series.matchId = series.games[0]?.matchId || series.matchId;
    const completed = series.games.filter((g) => g.status === "completed");
    let homeWins = 0;
    let awayWins = 0;
    for (const g of completed) {
      if (g.scoreTeam1 > g.scoreTeam2) homeWins += 1;
      else if (g.scoreTeam2 > g.scoreTeam1) awayWins += 1;
    }
    series.scoreTeam1 = homeWins;
    series.scoreTeam2 = awayWins;
    series.winnerTeamId =
      homeWins >= 3
        ? series.team1Id
        : awayWins >= 3
          ? series.team2Id
          : null;
    if (homeWins >= 3 || awayWins >= 3) series.status = "completed";
    else if (completed.length > 0) series.status = "ongoing";
    else series.status = "not_started";
    series.isSeries = series.games.length > 1;
    seriesList.push(series);
  }

  seriesList.sort(
    (a, b) =>
      (a.roundNumber || 0) - (b.roundNumber || 0) ||
      (a.matchId || 0) - (b.matchId || 0)
  );
  return seriesList;
}

function mapPlayoffMatch(m, round, bracketId) {
  const matchId = m.matchId || m.id;
  if (!matchId) return null;
  const team1 = m.Team1 || m.team1;
  const team2 = m.Team2 || m.team2;
  const hasScores =
    m.scoreTeam1 != null ||
    m.scoreTeam2 != null ||
    m.winnerTeamId != null;
  const status =
    m.status ||
    (m.winnerTeamId
      ? "completed"
      : hasScores && (Number(m.scoreTeam1) || Number(m.scoreTeam2))
        ? "ongoing"
        : "pending");
  return {
    matchId,
    bracketId: Number(bracketId),
    poolId: null,
    poolName: null,
    roundNumber: round.roundNumber,
    roundType: round.type || "playoff",
    status,
    scoreTeam1: Number(m.scoreTeam1) || 0,
    scoreTeam2: Number(m.scoreTeam2) || 0,
    winnerTeamId: m.winnerTeamId || null,
    team1Id: team1?.id || team1?.team1Id || null,
    team2Id: team2?.id || team2?.team2Id || null,
    team1Name: team1?.teamName || formatTeamName(team1) || "TBD",
    team2Name: team2?.teamName || formatTeamName(team2) || "TBD",
    team1Seed: team1?.seed || null,
    team2Seed: team2?.seed || null,
  };
}

/** Full pool details + playoffs for Score Entry (v60-style pool grid). */
export async function loadScoreEntryBracket(tournamentId, bracketId) {
  const poolsMeta = await fetchPools(tournamentId, bracketId);
  const pools = [];

  for (const pool of poolsMeta) {
    const detail = await fetchPoolDetails(tournamentId, bracketId, pool.id);
    const flatMatches = [];
    for (const round of detail?.rounds || []) {
      for (const m of round.matches || []) {
        flatMatches.push(mapPoolMatch(m, detail || pool, round, bracketId));
      }
    }
    const matches = groupPoolMatchesIntoSeries(flatMatches);
    pools.push({
      id: detail?.id || pool.id,
      poolName: detail?.poolName || pool.poolName || pool.name || `Pool ${pool.id}`,
      scoring: detail?.scoring || "",
      teams: detail?.teams || [],
      matches,
      flatMatches,
    });
  }

  let playoffRounds = [];
  try {
    playoffRounds = await fetchPlayoffRounds(tournamentId, bracketId);
  } catch {
    playoffRounds = [];
  }

  const playoffMatches = [];
  for (const round of playoffRounds || []) {
    for (const m of round.matches || []) {
      const mapped = mapPlayoffMatch(m, round, bracketId);
      if (mapped) playoffMatches.push(mapped);
    }
  }

  const poolMatches = pools.flatMap((p) => p.matches);
  return { pools, poolMatches, playoffMatches, playoffRounds };
}

/** Flatten pool + playoff matches for score-entry picker. */
export async function listMatchesForBracket(tournamentId, bracketId) {
  const data = await loadScoreEntryBracket(tournamentId, bracketId);
  return {
    poolMatches: data.poolMatches,
    playoffMatches: data.playoffMatches,
  };
}

export function classifyDivisionProgress(poolMatches = [], playoffMatches = []) {
  const all = [...poolMatches, ...playoffMatches];
  if (!all.length) return "not_started";
  const completed = all.filter((m) => m.status === "completed").length;
  const ongoing = all.filter((m) => m.status === "ongoing").length;
  if (completed === all.length) return "completed";
  if (completed > 0 || ongoing > 0) return "in_progress";
  return "not_started";
}

function formatTeamName(team) {
  if (!team) return "TBD";
  if (team.teamName) return team.teamName;
  const players = team.TeamPlayers || team.players || [];
  if (players.length) {
    return players
      .map((p) => {
        if (typeof p === "string") return p;
        const u = p.User || p;
        return [u.firstname, u.lastname].filter(Boolean).join(" ");
      })
      .filter(Boolean)
      .join(" / ");
  }
  return `Team ${team.id || team.team1Id || team.team2Id || ""}`.trim();
}

function teamLabel(teamBlock) {
  if (!teamBlock?.players?.length) return "TBD";
  return teamBlock.players.map((p) => `${p.firstname} ${p.lastname}`).join(" / ");
}
