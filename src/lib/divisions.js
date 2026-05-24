import { apiRequest } from "./api";

export async function fetchBracketMeta() {
  const response = await apiRequest("/api/tournaments/bracket-meta");
  return response?.data || {};
}

export async function fetchDivisions(tournamentId) {
  const response = await apiRequest(`/api/tournaments/${tournamentId}/divisions`);
  return response?.data || [];
}

export async function createDivision(tournamentId, payload) {
  const response = await apiRequest(`/api/tournaments/${tournamentId}/divisions`, {
    method: "POST",
    body: payload,
  });
  return response?.data;
}

export async function updateDivision(tournamentId, bracketId, payload) {
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/divisions/${bracketId}`,
    { method: "PUT", body: payload }
  );
  return response?.data;
}

export async function deleteDivision(tournamentId, bracketId) {
  return apiRequest(`/api/tournaments/${tournamentId}/divisions/${bracketId}`, {
    method: "DELETE",
  });
}

export const MAX_PAYMENT_EMAILS = 3;

export async function resendPaymentEmails(tournamentId, registrationIds) {
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/players/resend-payment-emails`,
    {
      method: "POST",
      body: { registrationIds },
    }
  );
  return response?.data;
}

export async function bulkUploadPlayers(tournamentId, rows, sendEmails = true) {
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/players/bulk-upload`,
    {
      method: "POST",
      body: { rows, sendEmails },
    }
  );
  return response?.data;
}

export async function fetchRegisteredPlayers(tournamentId) {
  const response = await apiRequest(`/api/players/tournaments/${tournamentId}`);
  return response?.data || [];
}

export const DIVISION_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];
