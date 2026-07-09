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

export async function fetchRegisteredPlayers(
  tournamentId,
  { paymentStatus, bracketId, unassignedOnly } = {}
) {
  const params = new URLSearchParams();
  if (paymentStatus) params.set("paymentStatus", paymentStatus);
  if (bracketId) params.set("bracketId", String(bracketId));
  if (unassignedOnly) params.set("unassignedOnly", "true");
  const qs = params.toString();
  const path = qs
    ? `/api/players/tournaments/${tournamentId}?${qs}`
    : `/api/players/tournaments/${tournamentId}`;
  const response = await apiRequest(path);
  return response?.data || [];
}

export async function updateRegistrationPayment(
  tournamentId,
  registrationId,
  { paymentStatus, syncPartner = true }
) {
  const regId = Number(registrationId);
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/registrations/${regId}/payment`,
    {
      method: "PATCH",
      body: { paymentStatus, syncPartner },
    }
  );
  return response?.data;
}

export async function bulkUpdateRegistrationPayments(
  tournamentId,
  { registrationIds, paymentStatus, syncPartner = true }
) {
  const ids = (registrationIds || [])
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/registrations/payment-bulk`,
    {
      method: "PATCH",
      body: { registrationIds: ids, paymentStatus, syncPartner },
    }
  );
  return response?.data;
}

export async function updateRegistration(tournamentId, registrationId, payload) {
  const tid = Number(tournamentId);
  const regId = Number(registrationId);
  if (!Number.isInteger(tid) || tid <= 0) {
    throw new Error("Invalid tournament id");
  }
  if (!Number.isInteger(regId) || regId <= 0) {
    throw new Error("Invalid registration id — refresh the player list and try again");
  }
  const path = `/api/tournaments/${tid}/registrations/${regId}`;
  const response = await apiRequest(
    path,
    {
      method: "PATCH",
      body: payload,
    }
  );
  return response?.data;
}

export async function addPlayerByHost(tournamentId, bracketId, data) {
  const response = await apiRequest(
    `/api/host/tournaments/${tournamentId}/brackets/${bracketId}/add-player`,
    {
      method: "POST",
      body: { data },
    }
  );
  return response?.data;
}

/** v60 division card palette (FINAL Admin-journey-v60.html) */
export const DIVISION_COLORS = [
  "#AAFF00",
  "#5B8CFF",
  "#FFD700",
  "#888888",
  "#FF6B6B",
  "#A78BFA",
  "#34D399",
  "#FB923C",
  "#F472B6",
  "#38BDF8",
];
