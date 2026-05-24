import { apiRequest } from "./api";
import {
  buildOrganizerInfoFromSettings,
  mergeTournamentSettings,
} from "./tournamentSettings";

export function slugifyTournamentName(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function fetchHostTournaments({ status, search } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (search?.trim()) params.set("search", search.trim());
  const qs = params.toString();
  const path = qs ? `/api/tournaments/host?${qs}` : "/api/tournaments/host";
  const response = await apiRequest(path);
  return response?.data || [];
}

export async function fetchClubs() {
  const response = await apiRequest("/api/clubs");
  return response?.data || [];
}

export async function createTournament(payload) {
  const response = await apiRequest("/api/tournaments/create-tournament", {
    method: "POST",
    body: payload,
  });
  return response?.data;
}

export async function fetchTournamentById(tournamentId) {
  const response = await apiRequest(`/api/tournaments/${tournamentId}`);
  return response?.data;
}

export async function updateTournament(tournamentId, payload) {
  const response = await apiRequest(`/api/tournaments/update/${tournamentId}`, {
    method: "PUT",
    body: payload,
  });
  return response?.tournamentData || response?.data;
}

export function tournamentAdminPath(path, tournamentId) {
  if (!tournamentId) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}tournamentId=${tournamentId}`;
}

export function parseOrganizerPayload(organizerInfo) {
  if (!organizerInfo) {
    return { name: "", email: "", phone: "" };
  }
  if (typeof organizerInfo === "object") {
    return organizerInfo;
  }
  try {
    return JSON.parse(organizerInfo);
  } catch {
    return { name: String(organizerInfo), email: "", phone: "" };
  }
}

export function defaultTournamentSettingsExtras() {
  return mergeTournamentSettings(null).settings;
}

export function mergeTournamentSettingsExtras(organizerInfo) {
  const { organizer, settings } = mergeTournamentSettings(organizerInfo);
  return { organizer, extras: settings };
}

export function buildOrganizerInfoPayload(organizer, settingsOrExtras) {
  return buildOrganizerInfoFromSettings(organizer, settingsOrExtras);
}

function toIsoDate(value) {
  if (!value) return undefined;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export function buildTournamentUpdatePayload(tournament, overrides = {}) {
  const { organizer, settings: storedSettings } = mergeTournamentSettings(
    overrides.organizerInfo ?? tournament.organizerInfo
  );
  const settings = {
    ...storedSettings,
    ...(overrides.settings || {}),
    ...(overrides.extras || {}),
  };

  return {
    name: tournament.name,
    description: tournament.description,
    entryFee: Number(overrides.entryFee ?? tournament.entryFee ?? 0),
    clubId: tournament.clubId,
    discount: tournament.discount ?? 0,
    venue: tournament.venue || "",
    location: tournament.location,
    timezone: tournament.timezone || null,
    startDate: toIsoDate(tournament.startDate),
    endDate: toIsoDate(tournament.endDate),
    registrationOpenDate: toIsoDate(tournament.registrationOpenDate),
    registrationCloseDate: toIsoDate(tournament.registrationCloseDate),
    refundDeadline: tournament.refundDeadline
      ? toIsoDate(tournament.refundDeadline)
      : null,
    refundFee: Number(tournament.refundFee ?? 0),
    duprRecorded: overrides.duprRecorded ?? tournament.duprRecorded ?? true,
    duprEnforced: overrides.duprEnforced ?? tournament.duprEnforced ?? false,
    requireSkillRating:
      overrides.requireSkillRating ?? tournament.requireSkillRating ?? false,
    status: tournament.status,
    slug: tournament.slug,
    organizerInfo: buildOrganizerInfoFromSettings(organizer, settings),
  };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatTournamentDates(start, end) {
  if (!start) return "—";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  if (Number.isNaN(s.getTime())) return "—";

  const sMon = MONTHS[s.getMonth()];
  const sDay = s.getDate();
  const sYr = s.getFullYear();

  if (!e || Number.isNaN(e.getTime())) {
    return `${sMon} ${sDay}, ${sYr}`;
  }

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${sMon} ${sDay}–${e.getDate()}, ${sYr}`;
  }

  return `${sMon} ${sDay} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${sYr}`;
}

export function formatRevenue(amount) {
  const n = Number(amount || 0);
  if (!n) return "—";
  if (n >= 1000) {
    const k = n / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `$${n}`;
}

export function hubStatusMeta(hubStatus) {
  switch (hubStatus) {
    case "active":
      return { label: "● LIVE", pill: "pill-live", dot: "live" };
    case "upcoming":
      return { label: "UPCOMING", pill: "pill-pending", dot: "upcoming" };
    case "draft":
      return { label: "DRAFT", pill: "pill-wait", dot: "draft" };
    case "completed":
      return { label: "✓ DONE", pill: "pill-done", dot: "completed" };
    default:
      return { label: hubStatus || "", pill: "pill-wait", dot: "draft" };
  }
}

export function countByHubStatus(tournaments) {
  const counts = { all: 0, active: 0, upcoming: 0, draft: 0, completed: 0 };
  const list = Array.isArray(tournaments) ? tournaments : [];
  counts.all = list.length;
  for (const t of list) {
    const key = t.hubStatus;
    if (key && counts[key] !== undefined) counts[key] += 1;
  }
  return counts;
}

export function tournamentLocationLabel(tournament) {
  const venue = tournament?.venue?.trim();
  const location = tournament?.location?.trim();
  if (venue && location) return `${venue} · ${location}`;
  return venue || location || "—";
}
