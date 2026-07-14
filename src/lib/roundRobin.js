import { apiRequest } from "./api";

export async function createRoundRobin({ tournamentId, bracketId, teamsPerPool }) {
  const response = await apiRequest("/api/round-robin/roundrobin", {
    method: "POST",
    body: {
      tournamentId: Number(tournamentId),
      bracketId: Number(bracketId),
      teamsPerPool: Number(teamsPerPool) || 4,
    },
  });
  return response?.data;
}

export async function fetchRoundRobinPools(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/round-robin/${tournamentId}/brackets/${bracketId}/pools`
  );
  return response?.data?.pools || [];
}

export async function deleteRoundRobin(tournamentId, bracketId) {
  return apiRequest(`/api/round-robin/${tournamentId}/brackets/${bracketId}`, {
    method: "DELETE",
  });
}

export async function publishRoundRobin(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/round-robin/${tournamentId}/brackets/${bracketId}/publish`,
    { method: "PATCH" }
  );
  return response?.data;
}

export async function unpublishRoundRobin(tournamentId, bracketId) {
  const response = await apiRequest(
    `/api/round-robin/${tournamentId}/brackets/${bracketId}/unpublish`,
    { method: "PATCH" }
  );
  return response?.data;
}