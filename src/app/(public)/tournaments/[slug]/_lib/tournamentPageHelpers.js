export function initialsFromName(firstName, lastName) {
  return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`;
}

export function findDivisionDetail(data, divisionId) {
  return data.tabs.divisions.details?.[divisionId] ?? null;
}

export function findDivisionSummary(data, divisionId) {
  for (const day of data.tabs.divisions.days) {
    const division = day.divisions.find((d) => d.id === divisionId);
    if (division) return { day, division };
  }
  return null;
}
