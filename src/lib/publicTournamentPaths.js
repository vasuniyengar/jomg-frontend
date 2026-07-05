export const PUBLIC_TOURNAMENT_PATH_PREFIX = "/tournaments";

export function publicTournamentPath(slug, { preview = false } = {}) {
  if (!slug) return PUBLIC_TOURNAMENT_PATH_PREFIX;
  const path = `${PUBLIC_TOURNAMENT_PATH_PREFIX}/${encodeURIComponent(slug)}`;
  return preview ? `${path}?preview=1` : path;
}

export function publicTournamentUrl(slug, { origin = "" } = {}) {
  const base = String(origin || "").replace(/\/$/, "");
  return `${base}${publicTournamentPath(slug)}`;
}
