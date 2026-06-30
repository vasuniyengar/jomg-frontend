export function isMlpDivision(division) {
  if (!division) return false;
  const name = String(division.name || division.bracketName || "").toLowerCase();
  const eventName = String(division.eventName || "").toLowerCase();
  return /mlp/.test(name) || /mlp/.test(eventName);
}

export function mlpGenderBalanceError(players) {
  const males = (players || []).filter((p) =>
    String(p.gender || "").toLowerCase().startsWith("m")
  ).length;
  const females = (players || []).filter((p) =>
    String(p.gender || "").toLowerCase().startsWith("f")
  ).length;
  if (males < 2 || females < 2) {
    return "MLP teams require at least 2 male and 2 female players";
  }
  return null;
}
