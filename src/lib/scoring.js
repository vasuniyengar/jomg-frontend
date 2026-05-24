/** Client helpers for bracket stage scoring (mirrors backend scoringRules). */

export function scoringStageKeyForRoundType(roundType) {
  const t = String(roundType || "pool").toLowerCase();
  if (t === "pool") return "pool";
  if (t === "bronze") return "bronze";
  if (t === "gold" || t === "final" || t === "round_of_2") return "gold";
  if (t === "semifinal" || t === "semifinals" || t === "round_of_4") return "semi";
  if (
    t === "quarterfinal" ||
    t === "quarterfinals" ||
    t.startsWith("round_of_")
  ) {
    return "playoff";
  }
  return "playoff";
}

export function getStageScoringLabel(bracket, roundType) {
  const key = scoringStageKeyForRoundType(roundType);
  const config = bracket?.scoringConfig;
  if (config?.[key]?.label) return config[key].label;
  if (bracket?.scoringLabels?.[key]) return bracket.scoringLabels[key];
  return null;
}

export function roundTypeLabel(type) {
  const t = String(type || "").toLowerCase();
  if (t === "pool") return "Pool Play";
  if (t === "gold" || t === "final") return "Final";
  if (t === "bronze") return "Bronze";
  if (t === "semifinal" || t === "semifinals") return "Semifinal";
  if (t === "quarterfinal" || t === "quarterfinals") return "Quarterfinal";
  if (t.startsWith("round_of_")) {
    const n = t.replace("round_of_", "");
    return `Round of ${n}`;
  }
  return type || "Match";
}
