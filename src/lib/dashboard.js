import { apiRequest } from "./api";
import { fetchHostTournaments } from "./tournaments";

export { fetchHostTournaments };

export async function fetchTournamentDashboard(tournamentId) {
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/dashboard`
  );
  return response?.data;
}

export async function updateTournamentStatus(tournamentId, status) {
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/status`,
    {
      method: "PATCH",
      body: { status },
    }
  );
  return response?.data;
}

export async function pushTournamentSettings(tournamentId, payload) {
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/settings/push`,
    {
      method: "POST",
      body: payload,
    }
  );
  return response?.data;
}

export function fillHealthClass(pct) {
  if (pct >= 70) return "healthy";
  if (pct >= 40) return "watch";
  return "low";
}

export function ringStrokeColor(pct) {
  if (pct >= 70) return "#10b981";
  if (pct >= 40) return "#f59e0b";
  return "#ef4444";
}

export function ringDashOffset(pct) {
  const circumference = 188.5;
  return circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;
}

export function buildDashboardSummary(tournaments) {
  const list = Array.isArray(tournaments) ? tournaments : [];
  const first = list[0] || null;

  let registeredPlayers = 0;
  let capacityPlayers = 0;
  let draftCount = 0;
  let activeCount = 0;
  let ongoingCount = 0;
  let completedCount = 0;

  for (const tournament of list) {
    const status = tournament?.status;
    if (status === "draft") draftCount += 1;
    if (status === "active") activeCount += 1;
    if (status === "ongoing") ongoingCount += 1;
    if (status === "completed") completedCount += 1;

    const brackets = tournament?.Brackets || [];
    for (const bracket of brackets) {
      registeredPlayers += Number(bracket?.totalPlayersRegistered || 0);
      capacityPlayers += Number(bracket?.totalCapacityOfPlayers || 0);
    }
  }

  const checkInRate =
    capacityPlayers > 0
      ? Math.round((registeredPlayers / capacityPlayers) * 100)
      : 0;

  return {
    firstTournament: first,
    registeredPlayers,
    capacityPlayers,
    checkInRate,
    draftCount,
    activeCount,
    ongoingCount,
    completedCount,
  };
}
