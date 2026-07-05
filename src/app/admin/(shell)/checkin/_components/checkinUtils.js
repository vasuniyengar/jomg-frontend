export function flattenRegistrations(players, bracketId) {
  const rows = [];
  for (const p of players || []) {
    for (const ev of p.events || []) {
      if (bracketId && String(ev.bracketId) !== String(bracketId)) continue;
      rows.push({
        playerId: p.playerId,
        name: p.name,
        email: p.email,
        bracketId: ev.bracketId,
        bracketName: ev.bracketName,
        eventId: ev.eventId,
        checkInStatus: ev.checkInStatus,
        checkInTime: ev.checkInTime,
        registrationId: ev.registrationId,
        partnerId: ev.partnerId || null,
        partnerName: ev.partnerName || null,
        partnerCheckInStatus: ev.partnerCheckInStatus || null,
      });
    }
  }
  return rows;
}

export function playerIdsForTeamCheckIn(row) {
  const ids = [row.playerId];
  if (
    row.partnerId &&
    row.partnerCheckInStatus !== "checked_in"
  ) {
    ids.push(row.partnerId);
  }
  return ids;
}

export function filterCheckInRows(rows, search) {
  const q = search.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.bracketName.toLowerCase().includes(q) ||
      (r.partnerName && r.partnerName.toLowerCase().includes(q))
  );
}

export function groupRowsByDivision(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.bracketId)) {
      map.set(r.bracketId, {
        bracketId: r.bracketId,
        bracketName: r.bracketName,
        players: [],
      });
    }
    map.get(r.bracketId).players.push(r);
  }
  return [...map.values()].sort((a, b) =>
    a.bracketName.localeCompare(b.bracketName)
  );
}

export function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const DIVISION_COLORS = [
  "#AAFF00",
  "#5B8CFF",
  "#FFD700",
  "#FF6B6B",
  "#F472B6",
  "#888888",
  "#ef4444",
];

export function divisionAccentColor(bracketId) {
  const id = Number(bracketId) || 0;
  return DIVISION_COLORS[Math.abs(id) % DIVISION_COLORS.length];
}

/** One card per player for kiosk grid (may have multiple division registrations). */
export function uniquePlayersFromRows(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.playerId)) {
      map.set(r.playerId, {
        playerId: r.playerId,
        name: r.name,
        email: r.email,
        registrations: [],
      });
    }
    map.get(r.playerId).registrations.push(r);
  }
  return [...map.values()].map((p) => {
    const allIn = p.registrations.every((r) => r.checkInStatus === "checked_in");
    const anyIn = p.registrations.some((r) => r.checkInStatus === "checked_in");
    const checkInTime = p.registrations.find((r) => r.checkInTime)?.checkInTime;
    return {
      ...p,
      checkedIn: allIn,
      partiallyCheckedIn: anyIn && !allIn,
      checkInTime,
    };
  });
}

export function filterKioskPlayers(players, search) {
  const q = search.trim().toLowerCase();
  if (!q) return players;
  return players.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.registrations.some(
        (r) =>
          r.bracketName.toLowerCase().includes(q) ||
          (r.partnerName && r.partnerName.toLowerCase().includes(q))
      )
  );
}
