export const MLP_GAMES = [
  { key: "wd", label: "Women's Doubles", short: "WD" },
  { key: "md", label: "Men's Doubles", short: "MD" },
  { key: "x1", label: "Mixed Doubles 1", short: "X1" },
  { key: "x2", label: "Mixed Doubles 2", short: "X2" },
];

export const DB_GAME = { key: "db", label: "Dreambreaker", short: "DB" };

export function emptyMlpMatchState(duprOn = true) {
  return {
    games: Array(5)
      .fill(null)
      .map(() => ({ a: "", b: "", saved: false, matchId: null })),
    duprOn,
    court: "",
  };
}

/** Build MLP UI state from persisted series game Match rows. */
export function hydrateFromSeriesGames(series, duprOn = true) {
  const st = emptyMlpMatchState(duprOn);
  const games = series?.games || [];
  st.court =
    series?.courtAssignment ||
    games.find((g) => g.courtAssignment)?.courtAssignment ||
    "";
  for (let i = 0; i < 5; i++) {
    const gameType = i + 1;
    const g = games.find((x) => Number(x.gameType) === gameType) || games[i];
    if (!g) continue;
    const saved = g.status === "completed";
    st.games[i] = {
      a: saved ? String(g.scoreTeam1 ?? "") : "",
      b: saved ? String(g.scoreTeam2 ?? "") : "",
      saved,
      matchId: g.matchId,
      gameType: g.gameType ?? gameType,
    };
  }
  return st;
}

export function gamesWon(st) {
  let home = 0;
  let away = 0;
  for (let i = 0; i < 4; i++) {
    const g = st.games[i];
    if (!g.saved) continue;
    const av = parseInt(g.a, 10);
    const bv = parseInt(g.b, 10);
    if (isNaN(av) || isNaN(bv)) continue;
    if (av > bv) home++;
    else if (bv > av) away++;
  }
  return { home, away };
}

export function dreambreakerActive(st) {
  const w = gamesWon(st);
  return w.home === 2 && w.away === 2;
}

export function matchClinched(st) {
  const w = gamesWon(st);
  return w.home >= 3 || w.away >= 3;
}

export function finalGamesWon(st) {
  const w = gamesWon(st);
  let home = w.home;
  let away = w.away;
  const db = st.games[4];
  if (db.saved) {
    const av = parseInt(db.a, 10);
    const bv = parseInt(db.b, 10);
    if (!isNaN(av) && !isNaN(bv)) {
      if (av > bv) home++;
      else if (bv > av) away++;
    }
  }
  return { home, away };
}

export function hydrateCompletedState(match, duprOn = true) {
  const st = emptyMlpMatchState(duprOn);
  st.court = match?.courtAssignment || "";
  const h = Number(match.scoreTeam1) || 0;
  const a = Number(match.scoreTeam2) || 0;
  let hi = 0;
  let ai = 0;
  for (let i = 0; i < 4 && (hi < h || ai < a); i++) {
    if (hi < h) {
      st.games[i].a = 11;
      st.games[i].b = 9;
      hi++;
    } else if (ai < a) {
      st.games[i].a = 9;
      st.games[i].b = 11;
      ai++;
    }
    st.games[i].saved = true;
  }
  if (h === 2 && a === 2 && st.games[4]) {
    st.games[4].a = 21;
    st.games[4].b = 19;
    st.games[4].saved = true;
  }
  return st;
}

function playerDisplayName(player) {
  if (!player) return "—";
  if (typeof player === "string") return player;
  return (
    [player.firstname, player.lastname].filter(Boolean).join(" ") || "—"
  );
}

function normalizeGender(player) {
  if (!player || typeof player === "string") return null;
  const g = String(player.gender || "").toLowerCase();
  if (g.startsWith("f")) return "female";
  if (g.startsWith("m")) return "male";
  return null;
}

/** Build WD / MD / mixed pairs from roster gender (not array order). */
export function mlpLineupFromPlayers(players = []) {
  const females = [];
  const males = [];
  const unknown = [];

  for (const p of players || []) {
    const gender = normalizeGender(p);
    if (gender === "female") females.push(p);
    else if (gender === "male") males.push(p);
    else unknown.push(p);
  }

  // Prefer known genders; fill gaps from unknown so the UI still shows names.
  while (females.length < 2 && unknown.length) females.push(unknown.shift());
  while (males.length < 2 && unknown.length) males.push(unknown.shift());

  const w1 = playerDisplayName(females[0]);
  const w2 = playerDisplayName(females[1]);
  const m1 = playerDisplayName(males[0]);
  const m2 = playerDisplayName(males[1]);

  return {
    wd: [w1, w2],
    md: [m1, m2],
    x1: [w1, m1],
    x2: [w2, m2],
  };
}

export function isMlpDivision(division, pools = []) {
  const name = `${division?.name || ""} ${division?.eventName || ""}`.toLowerCase();
  if (name.includes("mlp")) return true;
  const team = pools.flatMap((p) => p.teams || []).find((t) => (t.players || []).length >= 4);
  return Boolean(team);
}
