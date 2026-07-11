import { apiRequest } from "./api";

export async function generateBracketTeams(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/generate-teams`,
    { method: "POST" }
  );
  return response;
}

export async function createBracketTeam(tournamentId, bracketId, { playerIds, partnerNeeded = false }) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/create-team`,
    {
      method: "POST",
      body: { playerIds, partnerNeeded },
    }
  );
  return response;
}

export async function updateBracketTeamStatus(tournamentId, bracketId, teamId, status) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/teams/${teamId}/status`,
    {
      method: "PATCH",
      body: { status },
    }
  );
  return response?.data;
}

export async function deleteBracketTeam(tournamentId, bracketId, teamId) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/teams/${teamId}`,
    { method: "DELETE" }
  );
  return response;
}

export async function fetchBracketTeams(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/pools/teams`
  );
  return response?.data || [];
}

export async function updateBracketTeamName(tournamentId, bracketId, teamId, teamName) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/teams/${teamId}/team-name`,
    {
      method: "PATCH",
      body: { teamName },
    }
  );
  return response?.data;
}