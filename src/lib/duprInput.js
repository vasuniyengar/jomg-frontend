export const INDIVIDUAL_DUPR_MAX = 8;
export const COMBINED_DUPR_MAX = 99.99;

export function sanitizeDuprInput(raw, { maxDecimals = 2 } = {}) {
  let value = String(raw ?? "").replace(/[^\d.]/g, "");
  const dotIndex = value.indexOf(".");

  if (dotIndex !== -1) {
    const whole = value.slice(0, dotIndex);
    const fraction = value.slice(dotIndex + 1).replace(/\./g, "");
    value = `${whole}.${fraction.slice(0, maxDecimals)}`;
  }

  return value;
}

export function formatDuprField(value) {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n) || n === 0) return "";
  return n.toFixed(2);
}

function parseDuprDecimal(value, max) {
  if (value === "" || value == null) return null;
  const n = parseFloat(String(value).trim());
  if (Number.isNaN(n) || n < 0 || n > max) return null;
  return Math.round(n * 100) / 100;
}

export function parseIndividualDupr(value) {
  return parseDuprDecimal(value, INDIVIDUAL_DUPR_MAX);
}

export function parseCombinedDupr(value) {
  return parseDuprDecimal(value, COMBINED_DUPR_MAX);
}
