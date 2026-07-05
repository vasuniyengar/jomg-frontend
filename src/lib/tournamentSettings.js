import { parseOrganizerPayload } from "./tournaments";

export const SCORING_OPTIONS = [
  "1 game to 11, win by 1",
  "1 game to 11, win by 2",
  "1 game to 15, win by 1",
  "1 game to 15, win by 2",
  "1 game to 21, win by 1",
  "1 game to 21, win by 2",
  "Best of 3 to 11, win by 1",
  "Best of 3 to 11, win by 2",
  "Best of 3 to 15, win by 1",
  "Best of 3 to 15, win by 2",
  "Best of 3 to 21, win by 2",
  "Best of 5 to 11, win by 2",
  "Best of 5 to 15, win by 2",
  "Rally scoring to 21, win by 2",
  "Rally scoring to 25, win by 2",
  "Timed match — 20 min, point capped",
  "Timed match — 30 min, point capped",
];

export const SEEDING_METHOD_OPTIONS = [
  "DUPR Rating (highest rating = 1 seed)",
  "Pool Play Record (wins/losses)",
  "Pool Play Record + Point Differential",
  "Head-to-Head Priority",
  "Manual Assignment",
  "Random Draw",
  "Registration Order (first-come first-seeded)",
  "UTR Rating",
  "Prior Tournament Finish",
];

export const PLAY_ENV_OPTIONS = [
  "Indoor",
  "Outdoor Open",
  "Outdoor Covered",
  "Mixed Outdoor (Open & Covered)",
  "Uncovered Outdoor",
  "Mixed — Indoor & Outdoor",
  "Not Confirmed",
];

export const NET_SETUP_OPTIONS = [
  "Permanent",
  "Temporary",
  "Permanent / Temporary",
  "Unknown",
];

const ADVANCE_TIER_COLORS = [
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#3b82f6,#2563eb)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#8b5cf6,#7c3aed)",
];

export function advanceTierBadgeStyle(index) {
  return ADVANCE_TIER_COLORS[index % ADVANCE_TIER_COLORS.length];
}

let tierIdCounter = 0;
export function newTierId() {
  tierIdCounter += 1;
  return `tier-${Date.now()}-${tierIdCounter}`;
}

export function defaultPayForOption() {
  return { enabled: false, mode: "optional" };
}

export function defaultAdvanceTiers() {
  return [
    {
      id: newTierId(),
      label: "Early Bird",
      pricePerPlayer: 50,
      activeUntil: "",
    },
    {
      id: newTierId(),
      label: "Advance Rate",
      pricePerPlayer: 55,
      activeUntil: "",
    },
    {
      id: newTierId(),
      label: "Pre-Deadline",
      pricePerPlayer: 65,
      activeUntil: "",
    },
  ];
}

export function defaultBundles() {
  return [
    { id: newTierId(), divisionCount: 2, mode: "pct", value: 10 },
    { id: newTierId(), divisionCount: 3, mode: "pct", value: 15 },
  ];
}

export function defaultMlpSettings() {
  return {
    mensDoubles: "1 game to 11, win by 2",
    womensDoubles: "1 game to 11, win by 2",
    mixed1: "1 game to 11, win by 2",
    mixed2: "1 game to 11, win by 2",
    dreamBreaker: "1 game to 21, win by 1",
    rotation: "Singles rally — 1 server switches every 4 pts",
    trigger: "Only when games tied 2–2",
    rosterSize: "6 players (2M + 2F starters + 1M + 1F sub)",
    gameOrder: "Women's D → Men's D → Mixed 1 → Mixed 2",
    pointsPerGameWon: 1,
    scoringType: "Traditional (side-out)",
    warmUpMinutes: 3,
    substitutions: true,
    coachOnCourt: true,
    teamTimeouts: true,
  };
}

export function defaultMatchScoring() {
  return {
    pool: "1 game to 15, win by 2",
    playoff: "1 game to 15, win by 2",
    semi: "1 game to 15, win by 2",
    gold: "Best of 3 to 11, win by 2",
    bronze: "1 game to 15, win by 2",
  };
}

export const SPONSOR_TIER_KEYS = [
  "title",
  "ball",
  "championshipCourt",
  "hydration",
  "division",
];

export const SPONSOR_TIER_LABELS = {
  title: "Title Sponsor",
  ball: "Ball Sponsor",
  championshipCourt: "Championship Court",
  hydration: "Hydration Partner",
  division: "Division Sponsors",
};

export function newSponsorItemId() {
  tierIdCounter += 1;
  return `spon-${Date.now()}-${tierIdCounter}`;
}

export function defaultSponsorTiers() {
  return {
    title: { items: [] },
    ball: { items: [] },
    championshipCourt: { items: [] },
    hydration: { items: [] },
    division: { items: [] },
  };
}

export function defaultSponsorsConfig() {
  return {
    intro: "",
    tiers: defaultSponsorTiers(),
  };
}

export function mergeSponsorsConfig(raw) {
  const defaults = defaultSponsorsConfig();
  if (!raw) return defaults;
  if (Array.isArray(raw)) {
    return { ...defaults, tiers: { ...defaults.tiers } };
  }
  const tiers = defaultSponsorTiers();
  for (const key of SPONSOR_TIER_KEYS) {
    const tier = raw.tiers?.[key];
    tiers[key] = {
      items: Array.isArray(tier?.items)
        ? tier.items.map((item) => ({
            id: item.id || newSponsorItemId(),
            name: String(item.name || "").trim(),
            url: String(item.url || "#").trim() || "#",
            logoKey: item.logoKey || item.logo || "",
            logoUrl: item.logoUrl || "",
            darkLogo: Boolean(item.darkLogo),
          }))
        : [],
    };
  }
  return {
    intro: String(raw.intro || defaults.intro),
    tiers,
  };
}

export const DEFAULT_PLAYER_INSTRUCTIONS = [
  {
    label: "Stay & Travel",
    text: "",
  },
  {
    label: "On-Site Food",
    text: "",
  },
  {
    label: "Parking & Arrival",
    text: "",
  },
  {
    label: "What to Bring",
    text: "",
  },
  {
    label: "Waiver / Liability",
    text: "",
  },
];

export const DEFAULT_PADDLE_POLICY_TEXT = `Only USAPA & UPA-A approved paddles are allowed

USA Pickleball "delisted" the following paddles; Joola: Preseus 14mm Mod TA-15, Preseus 16mm Mod TA-15, Gearbox: Pro Power Elongated, Pro Kennex: Black Ace Ovation, Black Ace Pro, and Black Ace XF which players WILL NOT be allowed to use during medal matches. Selkirk Boomstick Elongated is allowed.

Since this is an amateur-only event, we will give players the opportunity to switch paddles (or choose to forfeit) rather than default to a forfeited game as stated in the USAPA rules, especially in light of paddles with an approved stamp that are no longer on the approved list.

Our event will follow USAPA rules (see: https://usapickleball.org/what-is-pickleball/official-rules/). Players may ask any questions they have or report any violations at the tournament desk. The tournament director may use their discretion in interpreting or modifying the USAPA rules to suit the specific scenario and ensure fun/competitive play.`;

export const PLAYER_INSTRUCTION_LABELS = DEFAULT_PLAYER_INSTRUCTIONS.map(
  (block) => block.label
);

function mergePlayerInstructions(saved) {
  if (!Array.isArray(saved) || !saved.length) {
    return DEFAULT_PLAYER_INSTRUCTIONS.map((block) => ({ ...block }));
  }
  return DEFAULT_PLAYER_INSTRUCTIONS.map((defaultBlock, index) => {
    const savedBlock = saved[index];
    if (savedBlock && typeof savedBlock === "object") {
      return {
        label: defaultBlock.label,
        text: String(savedBlock.text ?? defaultBlock.text),
      };
    }
    return { ...defaultBlock };
  });
}

export function defaultTournamentInfo() {
  return {
    refundPolicy: {
      fullWindow:
        "Players or clubs receive a full refund up until the week before the tournament date. No refunds are issued after that.",
      replacement: "Players with a replacement can swap by reaching out to us.",
      questions: "Reach out to JOMG Pickleball at info@jomgpickleball.com.",
    },
    spectators: { ticketFee: 0, maxCapacity: "" },
    duprRequirementsText: "",
    duprRequirementsManual: false,
    playerInstructions: DEFAULT_PLAYER_INSTRUCTIONS.map((block) => ({ ...block })),
    sponsors: defaultSponsorsConfig(),
    organizerOverride: false,
  };
}

export function generateDuprRequirementsText(duprRecorded, duprEnforced, requireSkillRating) {
  if (duprRecorded && duprEnforced) {
    return "A verified DUPR rating is required to register. All players must have an active DUPR profile, and divisions are gated by DUPR rating. Match results will be submitted to DUPR.";
  }
  if (duprRecorded && !duprEnforced) {
    return "Open to all verified DUPR ratings. Matches count toward official DUPR ratings. Players without DUPR can sign up with a self-reported level.";
  }
  if (!duprRecorded && duprEnforced) {
    return "A verified DUPR profile is required to register, but match results will not be submitted to DUPR.";
  }
  if (requireSkillRating) {
    return "Open registration with self-reported skill level when DUPR is unavailable.";
  }
  return "Open to all skill levels. DUPR is optional for registration.";
}

export function stripHtmlForValidation(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function defaultTournamentSettings() {
  return {
    masterPush: false,
    numCourts: 8,
    playEnv: "",
    netSetup: "Permanent",
    courtDescription: "",
    paddlePolicyText: DEFAULT_PADDLE_POLICY_TEXT,
    officialBall: "",
    officialBallUrl: "",
    paymentPhone: "",
    zelleUsername: "",
    venmoUsername: "",
    settingsConfirmed: false,
    settingsConfirmedAt: null,
    sectionPush: {
      pricing: false,
      playRules: false,
      dupr: false,
    },
    pricing: {
      payForPartner: defaultPayForOption(),
      payForTeam: defaultPayForOption(),
      advanceTiers: defaultAdvanceTiers(),
      bundles: defaultBundles(),
      prizes: {
        first: "",
        second: "",
        third: "",
        medalsAwards: true,
      },
    },
    playRules: {
      mlpFormat: true,
      mlp: defaultMlpSettings(),
      matchScoring: defaultMatchScoring(),
      scoringType: "Traditional (side-out)",
      suddenDeathAt: "",
      suddenDeathWinAt: "",
      warmUpMinutes: 3,
      seedingMethod: SEEDING_METHOD_OPTIONS[0],
      autoGeneratePools: true,
      tiebreakerTo5: false,
      switchSidesAtHalf: false,
      top1SeedBye: false,
      top12AdvanceToSemis: false,
      allowRefereeRequests: false,
      bronzeMatch: false,
    },
    notifications: {
      matchNotifications: true,
      liveScoring: true,
      emailNotifications: true,
      courtAssignmentText: false,
    },
    visibility: {
      publicTournamentPage: true,
      privateOnly: false,
      showDivisionsPublicly: true,
      spectatorScoreboard: true,
      passwordProtected: false,
      registrationPassword: "",
      waitlistEnabled: true,
    },
    tournamentInfo: defaultTournamentInfo(),
  };
}

function mergePayFor(src, defaults) {
  return {
    enabled: src?.enabled ?? defaults.enabled,
    mode: src?.mode === "mandatory" ? "mandatory" : "optional",
  };
}

function mergeAdvanceTiers(src, defaults) {
  const list = Array.isArray(src) ? src : defaults;
  return list.map((t, i) => ({
    id: t.id || newTierId(),
    label: t.label ?? defaults[i]?.label ?? `Tier ${i + 1}`,
    pricePerPlayer: Number(t.pricePerPlayer ?? t.price ?? defaults[i]?.pricePerPlayer ?? 0),
    activeUntil: t.activeUntil ?? t.activeUntil ?? "",
  }));
}

function mergeBundles(src, defaults) {
  const list = Array.isArray(src) ? src : defaults;
  return list.map((b, i) => ({
    id: b.id || newTierId(),
    divisionCount: Number(b.divisionCount ?? b.count ?? defaults[i]?.divisionCount ?? 2),
    mode: b.mode === "flat" ? "flat" : "pct",
    value: Number(b.value ?? defaults[i]?.value ?? 0),
  }));
}


function mergePrizeValue(value) {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : "";
}

export function mergeTournamentSettings(organizerInfo) {
  const parsed = parseOrganizerPayload(organizerInfo);
  const defaults = defaultTournamentSettings();

  const settings = {
    masterPush: parsed.masterPush ?? defaults.masterPush,
    numCourts: parsed.numCourts ?? defaults.numCourts,
    playEnv: parsed.playEnv ?? defaults.playEnv,
    netSetup: parsed.netSetup ?? defaults.netSetup,
    courtDescription: parsed.courtDescription ?? defaults.courtDescription,
    paddlePolicyText: (() => {
      const raw = String(parsed.paddlePolicyText ?? "");
      return raw.trim() ? raw : defaults.paddlePolicyText;
    })(),
    officialBall: parsed.officialBall ?? defaults.officialBall,
    officialBallUrl: parsed.officialBallUrl ?? defaults.officialBallUrl,
    paymentPhone: parsed.paymentPhone ?? defaults.paymentPhone,
    zelleUsername: parsed.zelleUsername ?? defaults.zelleUsername,
    venmoUsername: parsed.venmoUsername ?? defaults.venmoUsername,
    settingsConfirmed: parsed.settingsConfirmed ?? defaults.settingsConfirmed,
    settingsConfirmedAt: parsed.settingsConfirmedAt ?? defaults.settingsConfirmedAt,
    sectionPush: {
      pricing: parsed.sectionPush?.pricing ?? defaults.sectionPush.pricing,
      playRules: parsed.sectionPush?.playRules ?? defaults.sectionPush.playRules,
      dupr: parsed.sectionPush?.dupr ?? defaults.sectionPush.dupr,
    },
    pricing: {
      payForPartner: mergePayFor(parsed.pricing?.payForPartner, defaults.pricing.payForPartner),
      payForTeam: mergePayFor(parsed.pricing?.payForTeam, defaults.pricing.payForTeam),
      advanceTiers: mergeAdvanceTiers(
        parsed.pricing?.advanceTiers,
        defaults.pricing.advanceTiers
      ),
      bundles: mergeBundles(parsed.pricing?.bundles, defaults.pricing.bundles),
      prizes: {
        first: mergePrizeValue(parsed.pricing?.prizes?.first),
        second: mergePrizeValue(parsed.pricing?.prizes?.second),
        third: mergePrizeValue(parsed.pricing?.prizes?.third),
        medalsAwards:
          parsed.pricing?.prizes?.medalsAwards ?? defaults.pricing.prizes.medalsAwards,
      },
    },
    playRules: {
      mlpFormat: parsed.playRules?.mlpFormat ?? defaults.playRules.mlpFormat,
      mlp: { ...defaults.playRules.mlp, ...(parsed.playRules?.mlp || {}) },
      matchScoring: {
        ...defaults.playRules.matchScoring,
        ...(parsed.playRules?.matchScoring || {}),
      },
      scoringType: parsed.playRules?.scoringType ?? defaults.playRules.scoringType,
      suddenDeathAt: parsed.playRules?.suddenDeathAt ?? defaults.playRules.suddenDeathAt,
      suddenDeathWinAt:
        parsed.playRules?.suddenDeathWinAt ?? defaults.playRules.suddenDeathWinAt,
      warmUpMinutes: Number(
        parsed.playRules?.warmUpMinutes ?? defaults.playRules.warmUpMinutes
      ),
      seedingMethod: parsed.playRules?.seedingMethod ?? defaults.playRules.seedingMethod,
      autoGeneratePools:
        parsed.playRules?.autoGeneratePools ?? defaults.playRules.autoGeneratePools,
      tiebreakerTo5: parsed.playRules?.tiebreakerTo5 ?? defaults.playRules.tiebreakerTo5,
      switchSidesAtHalf:
        parsed.playRules?.switchSidesAtHalf ?? defaults.playRules.switchSidesAtHalf,
      top1SeedBye: parsed.playRules?.top1SeedBye ?? defaults.playRules.top1SeedBye,
      top12AdvanceToSemis:
        parsed.playRules?.top12AdvanceToSemis ?? defaults.playRules.top12AdvanceToSemis,
      allowRefereeRequests:
        parsed.playRules?.allowRefereeRequests ?? defaults.playRules.allowRefereeRequests,
      bronzeMatch: parsed.playRules?.bronzeMatch ?? defaults.playRules.bronzeMatch,
    },
    notifications: {
      ...defaults.notifications,
      ...(parsed.notifications || {}),
    },
    visibility: {
      ...defaults.visibility,
      ...(parsed.visibility || {}),
    },
    tournamentInfo: {
      ...defaults.tournamentInfo,
      ...(parsed.tournamentInfo || {}),
      refundPolicy: {
        ...defaults.tournamentInfo.refundPolicy,
        ...(parsed.tournamentInfo?.refundPolicy || {}),
      },
      spectators: {
        ...defaults.tournamentInfo.spectators,
        ...(parsed.tournamentInfo?.spectators || {}),
      },
      playerInstructions: mergePlayerInstructions(
        parsed.tournamentInfo?.playerInstructions
      ),
      sponsors: mergeSponsorsConfig(parsed.tournamentInfo?.sponsors),
    },
  };

  return {
    organizer: {
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
    },
    settings,
  };
}

export function buildOrganizerInfoFromSettings(organizer, settings) {
  return {
    name: organizer.name,
    email: organizer.email,
    phone: organizer.phone || "",
    ...settings,
  };
}

export function computeBundleSavingsPreview(baseFee, bundle) {
  const base = Number(baseFee) || 0;
  const count = Number(bundle.divisionCount) || 2;
  const rawTotal = base * count;
  const value = Number(bundle.value) || 0;

  if (bundle.mode === "flat") {
    const pays = value;
    const saves = Math.max(0, rawTotal - pays);
    return `At $${base}/div: bundle price $${pays.toFixed(2)}${
      saves > 0
        ? ` (saves $${saves.toFixed(2)})`
        : ""
    }`;
  }

  const discount = (rawTotal * value) / 100;
  const pays = rawTotal - discount;
  return `At $${base}/div: pays $${pays.toFixed(2)} (saves $${discount.toFixed(2)})`;
}