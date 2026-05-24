import { apiRequest } from "./api";

export async function fetchPlayersForCheckIn(tournamentId, { bracketId, checkInStatus } = {}) {
  const params = new URLSearchParams();
  if (bracketId) params.set("bracketId", String(bracketId));
  if (checkInStatus) params.set("checkInStatus", checkInStatus);
  const qs = params.toString();
  const path = qs
    ? `/api/players/tournaments/${tournamentId}?${qs}`
    : `/api/players/tournaments/${tournamentId}`;
  const response = await apiRequest(path);
  return response?.data || [];
}

export async function checkInPlayer({ tournamentId, bracketId, playerId, eventId }) {
  const response = await apiRequest("/api/host/checkin", {
    method: "PUT",
    body: { tournamentId, bracketId, playerId, eventId },
  });
  return response?.data;
}

export async function undoCheckIn({ tournamentId, bracketId, playerId }) {
  const response = await apiRequest("/api/host/uncheckin", {
    method: "PUT",
    body: { tournamentId, bracketId, playerId },
  });
  return response?.data;
}

export async function checkInAllPlayers(tournamentId, bracketId, { playerIds, eventId }) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/check-in-all`,
    {
      method: "PUT",
      body: { playerIds, eventId },
    }
  );
  return response?.data;
}
