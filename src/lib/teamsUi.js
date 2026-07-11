import { divisionAccentColor } from "./divisionForm";
import { formatShortDate, formatTime12, toDateKey, validateDivisionForDraw } from "./drawUi";

export function resolveDivisionBracketId(row) {
  return row?.id ?? row?.raw?.id ?? row?.bracketId ?? row?.raw?.bracketId ?? null;
}

export function playerRegisteredForBracket(player, bracketId) {
  const target = String(bracketId ?? "");
  if (!target) return false;
  return (player?.events || []).some(
    (event) => String(event?.bracketId ?? "") === target
  );
}

export function mapDivisionToTeamsRow(division, index = 0) {
  const cfg = division?.scoringConfig || {};
  const formatLabel = division?.formatLabel || division?.Event?.eventName || "Division";
  const isDoubles = /double|mixed/i.test(formatLabel);
  const isMlp = /mlp/i.test(formatLabel);

  return {
    id: division.id,
    name: division.name || division.bracketName || "Division",
    format: formatLabel,
    formatShort: /pool/i.test(formatLabel) ? "Pool Play" : formatLabel,
    type: isMlp ? "MLP" : isDoubles ? "Doubles" : "Singles",
    entryWord: isDoubles || isMlp ? "teams" : "players",
    max: division.maxTeams || 0,
    players: division.registeredCount || 0,
    startDate: toDateKey(division.startDate),
    startTime: cfg.startTime || "",
    color: divisionAccentColor(division, index),
    teamsPerPool: cfg.teamsPerPool || 4,
    poolStarted: Boolean(division.poolStarted),
    drawStatus: division.poolStarted ? "published" : "none",
    minRating: division.minRating,
    maxRating: division.maxRating,
    raw: division,
  };
}

function playerName(user) {
  if (!user) return "Unknown";
  return [user.firstname, user.lastname].filter(Boolean).join(" ").trim() || "Unknown";
}

function parseDupr(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function isGenericTeamName(name) {
  return /^Team\s+\d+$/i.test(String(name || "").trim());
}

export function teamDisplayName(team) {
  const name = team?.teamName?.trim();
  if (name && !isGenericTeamName(name)) return name;
  return null;
}

const API_STATUS_TO_UI = {
  registered: "confirmed",
  "checked-in": "confirmed",
  active: "confirmed",
  waitlist: "waitlist",
  pending_payment: "pending",
  withdrawn: "withdrawn",
  forfeited: "forfeited",
};

export function mapApiStatusToUi(apiStatus) {
  return API_STATUS_TO_UI[apiStatus] || "confirmed";
}

export function isInactiveTeamStatus(status) {
  return ["withdrawn", "forfeited", "waitlist"].includes(status);
}

export function getActiveTeamsForDraw(teams = []) {
  return teams.filter((t) => !isInactiveTeamStatus(t.status));
}

export function getOverflowTeamCount(row, teams = []) {
  const cap = row?.max || 0;
  if (cap <= 0) return 0;
  const active = getActiveTeamsForDraw(teams);
  return Math.max(0, active.length - cap);
}

export function mapApiTeamToUiTeam(apiTeam, seedIndex = 0) {
  const players = (apiTeam.players || [])
    .filter(Boolean)
    .map((u, i) => ({
    id: u.id ?? `p-${apiTeam.id}-${i}`,
    name: playerName(u),
    dupr: parseDupr(u.duprRating ?? u.rating),
    gender: String(u.gender || "M").toUpperCase().startsWith("F") ? "F" : "M",
    verified: false,
    reliability: 0,
  }));

  const combinedDupr = players.reduce((s, p) => s + (p.dupr || 0), 0);

  let poolNum = null;
  if (apiTeam.pool?.poolName) {
    const m = String(apiTeam.pool.poolName).match(/(\d+|[A-Z])/i);
    if (m) {
      const ch = m[1];
      poolNum = /^\d+$/.test(ch) ? Number(ch) : ch.toUpperCase().charCodeAt(0) - 64;
    }
  }

  const teamType =
    players.length > 2 ? "mlp" : players.length === 2 ? "doubles" : "singles";
  const incomplete = apiTeam.isComplete === false;
  const partnerNeeded =
    incomplete &&
    (teamType === "mlp" ? players.length < 4 : players.length < 2);

 return {
  id: String(apiTeam.id),
  apiId: apiTeam.id,
  teamName: apiTeam.teamName || `Team ${seedIndex + 1}`,
  players,
  subs: [],
  combinedDupr,
  combinedRel: 0,
  seed: seedIndex + 1,
  pool: poolNum,
  status: mapApiStatusToUi(apiTeam.status),
  partnerNeeded,
  forfeitReason: "",
  type: teamType,
  localOnly: false,
};
}

export function mapRegistrationToCandidate(player, bracketId) {
  const event = (player.events || []).find(
    (e) => String(e.bracketId) === String(bracketId)
  ) || player.events?.[0];

  return {
    id: player.playerId,
    playerId: player.playerId,
    name: player.name || "Unknown",
    dupr: parseDupr(player.duprRating ?? event?.duprRating),
    gender: String(player.gender || "M").toUpperCase().startsWith("F") ? "F" : "M",
    verified: Boolean(player.duprId || event?.duprId),
    duprId: player.duprId || event?.duprId || "",
    reliability: 0,
    paymentStatus: event?.paymentStatus || "unpaid",
  };
}

export function renumberSeeds(teams) {
  return teams.map((t, i) => ({ ...t, seed: i + 1 }));
}

export function reseedByDupr(teams) {
  const sorted = [...teams].sort((a, b) => (b.combinedDupr || 0) - (a.combinedDupr || 0));
  return renumberSeeds(sorted);
}

export function randomizeSeeding(teams) {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  return renumberSeeds(shuffled);
}

export function autoSuggestPools(teams, teamsPerPool = 4) {
  const poolCount = Math.max(1, Math.ceil(teams.length / teamsPerPool)) + 1;
  return teams.map((t, i) => {
    const round = Math.floor(i / poolCount);
    const idxInRound = i % poolCount;
    const poolIdx = round % 2 === 0 ? idxInRound : poolCount - 1 - idxInRound;
    return { ...t, pool: poolIdx + 1 };
  });
}

export function computeCombinedDupr(team) {
  const players = team.players || [];
  const sum = players.reduce((s, p) => s + (p.dupr || 0), 0);
  return +sum.toFixed(3);
}

export function mergeTeamsState(apiTeams, localPatch = {}) {
  const {
    teams: localTeams,
    removedApiIds = [],
    order = null,
  } = localPatch;

  let merged = (apiTeams || [])
    .filter((t) => !removedApiIds.includes(String(t.apiId ?? t.id)))
    .map((t) => ({ ...t }));

    if (localTeams?.length) {
    const apiById = new Map(merged.map((t) => [String(t.id), t]));
    for (const lt of localTeams) {
      if (lt.localOnly) {
        merged.push(lt);
      } else if (apiById.has(String(lt.id))) {
        const { status: _localStatus, ...localFields } = lt;
        apiById.set(String(lt.id), { ...apiById.get(String(lt.id)), ...localFields });
      }
    }
    merged = [...apiById.values(), ...localTeams.filter((t) => t.localOnly)];
  }

  if (order?.length) {
    const byId = new Map(merged.map((t) => [String(t.id), t]));
    const ordered = order.map((id) => byId.get(String(id))).filter(Boolean);
    const rest = merged.filter((t) => !order.includes(String(t.id)));
    merged = [...ordered, ...rest];
  }

  return renumberSeeds(merged);
}

export function validateTeamsForDraw(divisionRow, teams) {
  const activeTeams = getActiveTeamsForDraw(teams);
  const base = validateDivisionForDraw({
    ...divisionRow,
    players: activeTeams.length,
  });

  const warnings = [...base.warnings];
  const blockers = [...base.blockers];

  const isPool = (divisionRow.format || "").toLowerCase().includes("pool");
  if (isPool && activeTeams.length > 0) {
    const unassigned = activeTeams.filter((t) => !t.pool && t.status === "confirmed").length;
    if (unassigned > 0) {
      blockers.push(`${unassigned} team(s) not assigned to a pool`);
    }
  }

  const needsPartner = teams.filter((t) => t.partnerNeeded && t.status === "confirmed").length;
  if (needsPartner > 0) {
    warnings.push(`${needsPartner} team(s) need a partner`);
  }

  return { ok: blockers.length === 0, blockers, warnings };
}

export function sortDivisionsForTeams(rows) {
  return [...rows].sort((a, b) => {
    const ad = a.startDate || "9999-12-31";
    const bd = b.startDate || "9999-12-31";
    if (ad !== bd) return ad < bd ? -1 : 1;
    const at = a.startTime || "23:59";
    const bt = b.startTime || "23:59";
    if (at !== bt) return at < bt ? -1 : 1;
    return 0;
  });
}

export function divisionSelectLabel(row) {
  const n = row.teamCount ?? 0;
  const cap = row.max || 0;
  const time = row.startTime ? ` · ${formatTime12(row.startTime)}` : "";
  return `${row.name}${time} (${n}/${cap})`;
}

export function formatDivisionDay(iso) {
  return iso ? formatShortDate(iso) : "No date set";
}

export function teamStatusPillMeta(status) {
  const map = {
    pending: { label: "Pending", cls: "pillPending" },
    waitlist: { label: "Waitlist", cls: "pillWaitlist" },
    late: { label: "Late add", cls: "pillLate" },
    withdrawn: { label: "Withdrawn", cls: "pillWithdrawn" },
    forfeited: { label: "Forfeit", cls: "pillForfeit" },
  };
  return map[status] || null;
}

export function createLocalTeamFromPlayers(players, divisionRow, { partnerNeeded = false } = {}) {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const combinedDupr = players.reduce((s, p) => s + (p.dupr || 0), 0);
  return {
    id,
    apiId: null,
    teamName: `Team ${players[0]?.name || "New"}`,
    customName: null,
    players,
    subs: [],
    combinedDupr: +combinedDupr.toFixed(3),
    combinedRel: 0,
    seed: 1,
    pool: null,
    status: partnerNeeded ? "pending" : "confirmed",
    partnerNeeded,
    forfeitReason: "",
    type:
      divisionRow.type === "MLP"
        ? "mlp"
        : players.length >= 2
          ? "doubles"
          : "singles",
    localOnly: true,
  };
}
