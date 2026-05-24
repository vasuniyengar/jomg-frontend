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

export async function updateMatchScore(bracketId, matchId, { scoreTeam1, scoreTeam2 }) {
  const response = await apiRequest(
    `/api/host/${bracketId}/matches/${matchId}/update-match-score`,
    {
      method: "PUT",
      body: { scoreTeam1, scoreTeam2 },
    }
  );
  return response;
}

/** Flatten pool + playoff matches for score-entry picker. */
export async function listMatchesForBracket(tournamentId, bracketId) {
  const pools = await fetchPools(tournamentId, bracketId);
  const poolMatches = [];

  for (const pool of pools) {
    const detail = await fetchPoolDetails(tournamentId, bracketId, pool.id);
    for (const round of detail?.rounds || []) {
      for (const m of round.matches || []) {
        poolMatches.push({
          matchId: m.id,
          bracketId: Number(bracketId),
          poolId: pool.id,
          poolName: detail.poolName,
          roundNumber: round.roundNumber,
          roundType: "pool",
          status: m.status,
          scoreTeam1: m.scoreTeam1,
          scoreTeam2: m.scoreTeam2,
          team1Name: formatTeamName(m.team1),
          team2Name: formatTeamName(m.team2),
        });
      }
    }
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
      if (!m.matchId && !m.Team1) continue;
      playoffMatches.push({
        matchId: m.matchId,
        bracketId: Number(bracketId),
        poolId: null,
        roundNumber: round.roundNumber,
        roundType: round.type,
        status: m.status || "pending",
        scoreTeam1: m.scoreTeam1,
        scoreTeam2: m.scoreTeam2,
        team1Name: m.Team1?.teamName || teamLabel(m.Team1),
        team2Name: m.Team2?.teamName || teamLabel(m.Team2) || "TBD",
      });
    }
  }

  return { poolMatches, playoffMatches };
}

function formatTeamName(team) {
  if (!team) return "TBD";
  if (team.teamName) return team.teamName;
  const players = team.TeamPlayers || team.players || [];
  if (players.length) {
    return players
      .map((p) => {
        const u = p.User || p;
        return [u.firstname, u.lastname].filter(Boolean).join(" ");
      })
      .join(" / ");
  }
  return `Team ${team.id}`;
}

function teamLabel(teamBlock) {
  if (!teamBlock?.players?.length) return "TBD";
  return teamBlock.players.map((p) => `${p.firstname} ${p.lastname}`).join(" / ");
}
