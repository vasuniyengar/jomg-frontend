import { apiRequest } from "./api";

export async function fetchHostTournaments() {
  const response = await apiRequest("/api/tournaments/host");
  return response?.data || [];
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
