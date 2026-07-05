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
      .map(() => ({ a: "", b: "", saved: false })),
    duprOn,
    court: "",
  };
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

export function mlpLineupFromPlayers(players = []) {
  const names = players.map((p) => {
    if (!p) return "—";
    if (typeof p === "string") return p;
    return [p.firstname, p.lastname].filter(Boolean).join(" ") || "—";
  });
  const pick = (i) => names[i] || "—";
  return {
    wd: [pick(0), pick(1)],
    md: [pick(2), pick(3)],
    x1: [pick(0), pick(2)],
    x2: [pick(1), pick(3)],
  };
}

export function isMlpDivision(division, pools = []) {
  const name = `${division?.name || ""} ${division?.eventName || ""}`.toLowerCase();
  if (name.includes("mlp")) return true;
  const team = pools.flatMap((p) => p.teams || []).find((t) => (t.players || []).length >= 4);
  return Boolean(team);
}
