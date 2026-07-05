/** Column headers for the Players List bulk-upload Excel template. */
export const BULK_UPLOAD_COLUMNS = [
  "name",
  "team_name",
  "gender",
  "role",
  "email",
  "phone",
  "age",
  "partner",
  "division",
  "dupr",
  "DuprID",
  "instagram",
  "facebook",
  "paymentMethod",
  "paymentStatus",
  "rosterNumber",
  "clubName",
  "pay_for_partner",
];

/** Example rows: MLP team row + doubles row. */
export const BULK_UPLOAD_SAMPLE_ROWS = [
  [
    "Alex Turner",
    "Team Thunderbolts",
    "M",
    "starter",
    "alex@example.com",
    "(512) 555-0100",
    "34",
    "-",
    "MXD 14.0",
    "4.20",
    "DUPR-12345",
    "@alexturner",
    "facebook.com/alexturner",
    "Stripe",
    "unpaid",
    "M1",
    "Austin Pickle Club",
    "no",
  ],
  [
    "Jordan Smith",
    "",
    "F",
    "",
    "jordan@example.com",
    "(512) 555-0200",
    "28",
    "Sam Lee",
    "WS 3.5",
    "3.75",
    "",
    "",
    "",
    "",
    "paid",
    "",
    "",
    "yes",
  ],
];

function pick(raw, ...keys) {
  for (const key of keys) {
    const val = raw[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return "";
}

function normalizePaymentStatus(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (v === "paid" || v === "unpaid" || v === "refunded") return v;
  return "";
}

/** If value looks like a DUPR rating (0–8), return it; otherwise null. */
function parseDuprRatingValue(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = parseFloat(String(value).trim());
  if (Number.isNaN(n) || n < 0 || n > 8) return null;
  return Math.round(n * 100) / 100;
}

/**
 * Map one Excel/CSV row to the bulk-upload API payload.
 * Supports pulled MLP template headers and legacy doubles columns.
 */
export function normalizeBulkUploadRow(raw) {
  const name = pick(raw, "name", "Name");
  if (!name) return null;

  const partner = pick(raw, "partner", "Partner");
  const payRaw = pick(raw, "pay_for_partner", "payForPartner", "Pay_for_partner")
    .toLowerCase();

  const row = {
    name,
    email: pick(raw, "email", "Email").toLowerCase(),
    gender: pick(raw, "gender", "Gender") || "M",
    age: Number(raw.age ?? raw.Age ?? 30) || 30,
    phone: pick(raw, "phone", "Phone"),
    partner: partner || "-",
    division: pick(raw, "division", "Division"),
    pay_for_partner:
      payRaw === "no" ? "no" : partner && partner !== "-" ? "yes" : "no",
  };

  const role = pick(
    raw,
    "role (starter or bench)",
    "role",
    "Role",
    "playerRole",
    "player_role"
  );
  if (role) row.role = role.toLowerCase();

  const teamName = pick(raw, "team_name", "teamName", "TeamName");
  if (teamName) row.team_name = teamName;

  const duprFromColumn = pick(raw, "dupr", "DUPR", "Dupr");
  const duprIdRaw = pick(raw, "DuprID", "duprId", "dupr_id");
  const duprFromId = parseDuprRatingValue(duprIdRaw);

  if (duprFromColumn) {
    row.dupr = duprFromColumn;
  } else if (duprFromId !== null) {
    row.dupr = String(duprFromId);
  }

  if (duprIdRaw && duprFromId === null) {
    row.duprId = duprIdRaw;
  }

  const paymentMethod = pick(raw, "paymentMethod", "payment_method", "PaymentMethod");
  if (paymentMethod) row.paymentMethod = paymentMethod;

  const paymentStatus = normalizePaymentStatus(
    pick(raw, "paymentStatus", "payment_status", "PaymentStatus")
  );
  if (paymentStatus) row.paymentStatus = paymentStatus;

  const instagram = pick(raw, "instagram", "Instagram");
  if (instagram) row.instagram = instagram;

  const facebook = pick(raw, "facebook", "Facebook");
  if (facebook) row.facebook = facebook;

  const rosterNumber = pick(raw, "rosterNumber", "roster_number", "RosterNumber");
  if (rosterNumber) row.rosterNumber = rosterNumber;

  const clubName = pick(raw, "clubName", "club_name", "ClubName");
  if (clubName) row.clubName = clubName;

  return row;
}

export function buildBulkUploadTemplateAoA() {
  return [BULK_UPLOAD_COLUMNS, ...BULK_UPLOAD_SAMPLE_ROWS];
}
