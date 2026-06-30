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

export const TOURNAMENT_TIMEZONE_OPTIONS = [
  { value: "", label: "Auto-detect (browser)" },
  { value: "America/New_York", label: "Eastern Time — America/New_York" },
  { value: "America/Chicago", label: "Central Time — America/Chicago" },
  { value: "America/Denver", label: "Mountain Time — America/Denver" },
  { value: "America/Phoenix", label: "Arizona Time — America/Phoenix" },
  { value: "America/Los_Angeles", label: "Pacific Time — America/Los_Angeles" },
  { value: "America/Anchorage", label: "Alaska Time — America/Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii Time — Pacific/Honolulu" },
];

export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

export function resolveTournamentTimezone(value) {
  if (value) return value;
  return getBrowserTimezone();
}

/** @returns {string|null} error message or null if valid */
export function validateTournamentDates({
  startDate,
  endDate,
  registrationOpenDate,
  registrationCloseDate,
  refundDeadline,
}) {
  if (!startDate || !endDate || !registrationOpenDate || !registrationCloseDate) {
    return null;
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const regOpen = new Date(registrationOpenDate);
  const regClose = new Date(registrationCloseDate);

  if (end < start) return "Event end must be on or after event start.";
  if (regOpen >= start) return "Registration open must be before event start.";
  if (regClose < regOpen) return "Registration close must be on or after registration open.";
  if (regClose > end) return "Registration close must be on or before event end.";
  if (refundDeadline) {
    const refund = new Date(refundDeadline);
    if (refund >= start) return "Refund deadline must be before event start.";
  }
  return null;
}

export function calendarDateString(date, timeZone) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function canStartTournamentLive(startDate, timeZone) {
  if (!startDate) {
    return {
      allowed: false,
      reason: "Set a tournament start date before going live.",
    };
  }
  const startDay = calendarDateString(startDate, timeZone);
  const [sy, sm, sd] = startDay.split("-").map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const earliestUtc = startUtc - 24 * 60 * 60 * 1000;
  const today = calendarDateString(new Date(), timeZone);
  const [ty, tm, td] = today.split("-").map(Number);
  const todayUtc = Date.UTC(ty, tm - 1, td);
  if (todayUtc < earliestUtc) {
    return {
      allowed: false,
      reason:
        "Go Live is available starting the calendar day before the tournament start date.",
    };
  }
  return { allowed: true, reason: null };
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

export async function deleteTournament(tournamentId) {
  return apiRequest(`/api/tournaments/${tournamentId}`, {
    method: "DELETE",
  });
}

export function buildWizardFormFromTournament(tournament) {
  const org = parseOrganizerPayload(tournament?.organizerInfo);
  const toInputDate = (v) => {
    if (!v) return "";
    const s = typeof v === "string" ? v : new Date(v).toISOString();
    return s.slice(0, 10);
  };
  return {
    name: tournament?.name || "",
    clubId: tournament?.clubId ? String(tournament.clubId) : "",
    slug: tournament?.slug || "",
    description: tournament?.description || "",
    organizerName: org?.name || "",
    organizerEmail: org?.email || "",
    organizerPhone: org?.phone || "",
    venue: tournament?.venue || "",
    location: tournament?.location || "",
    timezone: tournament?.timezone || "",
    startDate: toInputDate(tournament?.startDate),
    endDate: toInputDate(tournament?.endDate),
    registrationOpenDate: toInputDate(tournament?.registrationOpenDate),
    registrationCloseDate: toInputDate(tournament?.registrationCloseDate),
    refundDeadline: toInputDate(tournament?.refundDeadline),
    refundFee: tournament?.refundFee != null ? String(tournament.refundFee) : "",
    duprRecorded: tournament?.duprRecorded ?? true,
    duprEnforced: tournament?.duprEnforced ?? false,
    requireSkillRating: tournament?.requireSkillRating ?? false,
  };
}

export function buildWizardApiPayload(form, { status } = {}) {
  const slug = form.slug.trim() || slugifyTournamentName(form.name);
  return {
    name: form.name.trim(),
    clubId: Number(form.clubId),
    slug,
    description: form.description.trim(),
    venue: form.venue.trim(),
    location: form.location.trim(),
    timezone: form.timezone || null,
    startDate: toIsoDate(form.startDate),
    endDate: toIsoDate(form.endDate),
    registrationOpenDate: toIsoDate(form.registrationOpenDate),
    registrationCloseDate: toIsoDate(form.registrationCloseDate),
    refundDeadline: form.refundDeadline ? toIsoDate(form.refundDeadline) : null,
    refundFee: form.refundFee ? Number(form.refundFee) : 0,
    duprRecorded: form.duprRecorded,
    duprEnforced: form.duprEnforced,
    requireSkillRating: form.requireSkillRating,
    ...(status ? { status } : {}),
    organizerInfo: {
      name: form.organizerName.trim(),
      email: form.organizerEmail.trim(),
      phone: form.organizerPhone.trim() || "",
    },
  };
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
    status: overrides.status ?? tournament.status,
    slug: overrides.slug ?? tournament.slug,
    tournamentTumbnail:
      overrides.tournamentTumbnail ?? tournament.tournamentTumbnail ?? null,
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

export function displayStatus(status, settingsConfirmed = false) {
  switch (status) {
    case "draft":
      return settingsConfirmed ? "Draft" : "Draft";
    case "active":
      return "Published";
    case "ongoing":
      return "Live";
    case "completed":
      return "Completed";
    default:
      return status || "Draft";
  }
}

export function statusBadgeClass(status) {
  switch (status) {
    case "active":
      return "tsb-published";
    case "ongoing":
      return "tsb-live";
    case "completed":
      return "tsb-completed";
    default:
      return "tsb-draft";
  }
}

export async function pushTournamentSettingsApi(tournamentId, payload) {
  const response = await apiRequest(
    `/api/tournaments/${tournamentId}/settings/push`,
    {
      method: "POST",
      body: payload,
    }
  );
  return response?.data;
}

export function tournamentLocationLabel(tournament) {
  const venue = tournament?.venue?.trim();
  const location = tournament?.location?.trim();
  if (venue && location) return `${venue} · ${location}`;
  return venue || location || "—";
}
