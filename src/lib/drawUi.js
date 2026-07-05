import { DIVISION_COLORS } from "./divisions";
import { divisionAccentColor } from "./divisionForm";

export function toDateKey(value) {
  if (!value) return "";
  const s = typeof value === "string" ? value : new Date(value).toISOString();
  return s.slice(0, 10);
}

export function formatShortDate(iso) {
  if (!iso) return "—";
  const parts = String(iso).split("-");
  if (parts.length !== 3) return iso;
  const dt = new Date(+parts[0], +parts[1] - 1, +parts[2]);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime12(hhmm) {
  if (!hhmm) return "";
  const parts = String(hhmm).split(":");
  if (parts.length < 2) return hhmm;
  const h = +parts[0];
  const m = parts[1];
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m}${ampm}`;
}

export function mapDivisionToDrawRow(division, index = 0) {
  const cfg = division?.scoringConfig || {};
  const formatLabel = division?.formatLabel || division?.Event?.eventName || "Division";
  const isDoubles = /double|mixed/i.test(formatLabel);

  return {
    id: division.id,
    name: division.name || division.bracketName || "Division",
    format: formatLabel,
    formatShort: /pool/i.test(formatLabel) ? "Pool Play" : formatLabel,
    type: isDoubles ? "Doubles" : "Singles",
    entryWord: isDoubles ? "teams" : "players",
    max: division.maxTeams || 0,
    players: division.registeredCount || 0,
    startDate: toDateKey(division.startDate),
    startTime: cfg.startTime || "",
    color: divisionAccentColor(division, index),
    seed: cfg.seedMethod || cfg.skillLevel || "DUPR",
    teamsPerPool: cfg.teamsPerPool || 4,
    teamsAdvance: cfg.teamsAdvance || 2,
    guar: cfg.gameGuarantee || 4,
    poolStarted: Boolean(division.poolStarted),
    raw: division,
  };
}

export function mergeDrawRow(row, poolData = {}) {
  const bracket = poolData.bracket ?? null;
  const hasPools = Boolean(poolData.hasPools ?? bracket?.generated);

  let drawStatus = "none";
  if (row.poolStarted) {
    drawStatus = "published";
  } else if (hasPools) {
    drawStatus = "draft";
  }

  return {
    ...row,
    drawStatus,
    bracket: bracket?.generated ? bracket : null,
    hasPools,
  };
}

function teamLabel(team, fallbackId) {
  if (!team) return "TBD";
  if (team.teamName) return team.teamName;
  return `Team ${team.id ?? fallbackId ?? "?"}`;
}

/** Map GET /api/round-robin/.../pools response into BracketPreview model. */
export function mapPoolsApiToBracket(poolsPayload) {
  const items = Array.isArray(poolsPayload) ? poolsPayload : [];
  if (!items.length) return null;

  const pools = [];
  let totalMatches = 0;
  let poolIndex = 0;

  for (const entry of items) {
    const poolRecord = entry.pool || entry;
    const rounds = entry.rounds || poolRecord.rounds || [];
    poolIndex += 1;

    const teamMap = new Map();
    const matches = [];
    let matchNum = 0;

    for (const round of rounds) {
      const roundNum = round.roundNumber ?? round.round_number ?? 1;
      for (const m of round.matches || []) {
        matchNum += 1;
        if (m.team1) teamMap.set(m.team1.id, m.team1);
        if (m.team2) teamMap.set(m.team2.id, m.team2);
        matches.push({
          id: m.id ?? `m-${poolIndex}-${matchNum}`,
          matchNumInPool: matchNum,
          round: roundNum,
          home: teamLabel(m.team1, matchNum),
          away: teamLabel(m.team2, matchNum + 1),
          status: m.status || "pending",
        });
      }
    }

    totalMatches += matches.length;
    const teams = [...teamMap.values()].map((t, i) => ({
      id: t.id,
      seed: i + 1,
      label: teamLabel(t, i + 1),
    }));

    pools.push({
      poolNum: poolIndex,
      poolName: poolRecord.poolName || `Pool ${poolIndex}`,
      teams,
      matches,
    });
  }

  if (!pools.length) return null;

  return {
    generated: true,
    kind: "pool",
    pools,
    totalMatches,
  };
}

export function deriveDrawStatus(row, bracket) {
  if (row.poolStarted) return "published";
  if (bracket?.generated) return "draft";
  return "none";
}

export function validateDivisionForDraw(row) {
  const blockers = [];
  const warnings = [];
  const n = row.players || 0;
  const cap = row.max || 0;
  const entryWord = row.entryWord === "teams" ? "team" : "player";
  const min = row.format?.toLowerCase().includes("pool")
    ? row.teamsPerPool || 4
    : 4;

  if (n > cap && cap > 0) {
    blockers.push(
      `${n} active sign-ups exceed capacity of ${cap} — move ${n - cap} to waitlist`
    );
  }
  if (n < min) {
    blockers.push(
      `Need at least ${min} active ${entryWord}s for ${row.formatShort} (have ${n})`
    );
  }
  if (n === 0) {
    blockers.push(`No registered ${entryWord}s yet`);
  }
  if (n > 0 && n < cap * 0.5 && cap >= 8) {
    warnings.push("Registration below 50% capacity");
  }
  if (row.format?.toLowerCase().includes("pool") && n > 0) {
    const tpp = row.teamsPerPool || 4;
    const poolCount = Math.ceil(n / tpp);
    const rem = n % tpp;
    if (rem !== 0 && poolCount > 1) {
      warnings.push(
        `${poolCount} pools — uneven (${poolCount - 1} of ${tpp}, 1 of ${rem})`
      );
    }
  }

  return { ok: blockers.length === 0, blockers, warnings };
}

export function drawFormatSummary(row) {
  const n = row.players || 0;
  const fmt = row.format || "";
  if (fmt.toLowerCase().includes("pool")) {
    const tpp = row.teamsPerPool || 4;
    const adv = row.teamsAdvance || 2;
    const poolCount = n > 0 ? Math.ceil(n / tpp) : 0;
    const advancing = poolCount * adv;
    let tail = "";
    if (/single elim/i.test(fmt)) tail = ` → SE${advancing}`;
    else if (/double elim/i.test(fmt)) tail = ` → DE${advancing}`;
    else if (/playoff/i.test(fmt)) tail = ` → Playoffs (${advancing})`;
    return `${n} → ${poolCount} pool${poolCount !== 1 ? "s" : ""} of ~${tpp}, top ${adv}${tail}`;
  }
  if (/single elim/i.test(fmt)) {
    let nextPow2 = 1;
    while (nextPow2 < n) nextPow2 *= 2;
    return `${n} entrants → SE${nextPow2} bracket`;
  }
  if (/double elim/i.test(fmt)) {
    let nextPow2 = 1;
    while (nextPow2 < n) nextPow2 *= 2;
    return `${n} entrants → DE${nextPow2} bracket`;
  }
  return `${n} entrants → ${fmt}`;
}

export function sortDrawDivisions(rows) {
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

export function getDrawDays(rows, filterFn) {
  const days = {};
  rows.forEach((d) => {
    if (filterFn && !filterFn(d)) return;
    if (d.startDate) days[d.startDate] = true;
  });
  return Object.keys(days).sort();
}

export function getDrawStatusCounts(rows) {
  const counts = { all: 0, ready: 0, draft: 0, published: 0, blocked: 0 };
  rows.forEach((d) => {
    const v = validateDivisionForDraw(d);
    if (d.drawStatus === "published") {
      counts.published++;
      return;
    }
    counts.all++;
    if (d.drawStatus === "draft") counts.draft++;
    else if (v.ok) counts.ready++;
    else counts.blocked++;
  });
  return counts;
}

export function applyDrawFilters(rows, { filterDay = "all", filterStatus = "all" }) {
  return rows.filter((d) => {
    if (d.drawStatus === "published") return false;
    if (filterDay !== "all" && (d.startDate || "") !== filterDay) return false;
    if (filterStatus !== "all") {
      const v = validateDivisionForDraw(d);
      let st;
      if (d.drawStatus === "draft") st = "draft";
      else if (v.ok) st = "ready";
      else st = "blocked";
      if (st !== filterStatus) return false;
    }
    return true;
  });
}

export function applyPublishedFilters(rows, filterDay = "all") {
  return rows.filter((d) => {
    if (d.drawStatus !== "published") return false;
    if (filterDay !== "all" && (d.startDate || "") !== filterDay) return false;
    return true;
  });
}

export function createMockBracket(row) {
  const n = Math.max(row.players || 4, 4);
  const tpp = row.teamsPerPool || 4;
  const poolCount = Math.max(1, Math.ceil(n / tpp));
  const pools = [];
  let teamSeed = 1;
  let totalMatches = 0;

  for (let p = 1; p <= poolCount; p++) {
    const teamsInPool = [];
    const count = p < poolCount ? tpp : n - tpp * (poolCount - 1);
    for (let t = 0; t < count; t++) {
      teamsInPool.push({
        id: `t-${row.id}-p${p}-${t}`,
        seed: teamSeed++,
        label: `Team ${teamSeed - 1}`,
      });
    }
    const matchCount = Math.max(1, (teamsInPool.length * (teamsInPool.length - 1)) / 2);
    const matches = [];
    for (let m = 1; m <= matchCount; m++) {
      const home = teamsInPool[(m - 1) % teamsInPool.length];
      const away = teamsInPool[m % teamsInPool.length];
      matches.push({
        id: `m-${row.id}-p${p}-${m}`,
        matchNumInPool: m,
        round: Math.ceil(m / Math.max(1, Math.floor(teamsInPool.length / 2))),
        home: home?.label || "TBD",
        away: away?.label || "TBD",
        status: "pending",
      });
    }
    totalMatches += matches.length;
    pools.push({ poolNum: p, teams: teamsInPool, matches });
  }

  return {
    generated: true,
    kind: "pool",
    pools,
    totalMatches,
  };
}

export function drawStatusLabel(row) {
  const v = validateDivisionForDraw(row);
  if (row.drawStatus === "published") return { label: "Published", className: "pill-done" };
  if (row.drawStatus === "draft") return { label: "Draft", className: "pillDraft" };
  if (!v.ok) return { label: "Not Ready", className: "pillNotReady" };
  return { label: "Ready", className: "pill-approved" };
}
