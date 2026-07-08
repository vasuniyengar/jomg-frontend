export const PUBLIC_BRAND = {
  brandTitle: "JOMG PCC",
  brandSubtitle: "Pickleball Club Championship",
  brandLogoUrl: "/tournaments/jomg-logo.png",
  volairLogoUrl: "/tournaments/volair-logo.png",
};

/** Static banner copy — not derived from tournament API */
export const STATIC_BANNER_BADGE = "CLUB VS CLUB";
export const STATIC_BANNER_TITLE = "Central Texas Championship";

/** Info bar below banner — static copy from PHASE 1 reference HTML */
export const STATIC_INFO_BAR = [
  { icon: "calendar", label: "DATES", value: "AUG 8 & SEP 19" },
  { icon: "calendar", label: "AGE GROUPS", value: "MASTERS 50+ & OPEN 18+" },
  { icon: "clubs", label: "Founding Clubs", value: "14" },
  { icon: "format", label: "Format", value: "MLP Style" },
];

export const STATIC_INFO_BAR_DATE_LABEL = "DATES";
export const STATIC_INFO_BAR_AGE_GROUP_LABEL = "AGE GROUPS";
export const STATIC_CLUBS_COUNT = "14";
export const STATIC_INFO_BAR_FORMAT = {
  icon: "format",
  label: "Format",
  value: "MLP Style",
};

export function staticSponsorsIntro(tournamentTitle) {
  const name = tournamentTitle?.trim() || "This tournament";
  return `${name} is made possible by the partners below.`;
}

export function applyStaticInfoBarLabels(items) {
  let firstCalendarSeen = false;
  const processed = [];

  for (const item of items || []) {
    if (item.icon === "divisions") continue;

    if (item.icon === "clubs") {
      processed.push({ ...item, value: STATIC_CLUBS_COUNT });
      processed.push(STATIC_INFO_BAR_FORMAT);
      continue;
    }

    if (item.icon === "calendar") {
      processed.push(
        !firstCalendarSeen
          ? { ...item, label: STATIC_INFO_BAR_DATE_LABEL }
          : { ...item, label: STATIC_INFO_BAR_AGE_GROUP_LABEL }
      );
      firstCalendarSeen = true;
      continue;
    }

    processed.push(item);
  }

  if (!processed.some((item) => item.icon === "format")) {
    const clubsIndex = processed.findIndex((item) => item.icon === "clubs");
    if (clubsIndex >= 0) {
      processed.splice(clubsIndex + 1, 0, STATIC_INFO_BAR_FORMAT);
    } else {
      processed.push({
        icon: "clubs",
        label: "Founding Clubs",
        value: STATIC_CLUBS_COUNT,
      });
      processed.push(STATIC_INFO_BAR_FORMAT);
    }
  }

  return processed;
}

export const STATIC_FORMAT = {
  tag: "MLP style",
  intro:
    "Major League Pickleball format — team play across four doubles games (men's doubles, women's doubles, and two mixed doubles), plus a Dream Breaker tiebreaker if the games finish tied 2–2.",
  mlpNotes: [
    "All four games are played in every round-robin match — even if a team clinches 3–0 after three games. The fourth game matters because if two or more teams finish level on standings points, the tiebreaker is applied on total game wins vs. losses — so every game won or lost can affect final placement.",
    "In bracket/playoff knockout matches, the fourth game is not necessary if a team is already up 3–0, since advancement is decided by match win rather than total game wins.",
  ],
  mlpScoring: [
    { label: "Men's doubles", value: "1 game to 11, win by 2" },
    { label: "Women's doubles", value: "1 game to 11, win by 2" },
    { label: "Mixed doubles 1", value: "1 game to 11, win by 2" },
    { label: "Mixed doubles 2", value: "1 game to 11, win by 2" },
  ],
  dreamBreaker: [
    { label: "Scoring", value: "1 game to 21, win by 1" },
    { label: "Rotation", value: "Singles rally — 1 server switches" },
    { label: "Win on serve", value: "Team must serve to win the game" },
  ],
  teamSetup: [
    { label: "Starters", value: "2F + 2M" },
    { label: "Substitutes (optional)", value: "1F & 1M" },
    { label: "Game order", value: "Women's D → Men's D → Mixed" },
  ],
  scoringTiming: [
    { label: "Scoring type", value: "Traditional (side-out)" },
    { label: "Warm-up time", value: "3 min" },
  ],
  switchSides: [
    {
      label: "Game to 11",
      value: "Switch at 6, one minute timeout at switch or rotation",
    },
    {
      label: "Game to 21",
      value: "Switch at 11, one minute timeout at switch or rotation",
    },
  ],
  timeouts: [{ label: "Timeouts", value: "1 timeout per game per team" }],
  notes: [
    {
      label: "Substitutions",
      text: "Allowed for injury or before the next match (not between games).",
    },
    {
      label: "Coach on court",
      text: "Off — no non-playing coach during timeouts.",
    },
  ],
};

export const STATIC_DETAILS = {
  courts:
    "Played on Apex's championship indoor courts with cushioned surfacing and pro-grade nets.",
  officialBall:
    "Sriya Designs match ball — the official tournament ball used for every match. Tournament balls provided on court.",
  instructions: [
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
],
  duprPolicy: [
    {
      label: "50+ Masters",
      text: "DUPR is enforced but not recorded — results do not count toward official ratings.",
    },
    {
      label: "18+ Open",
      text: "DUPR is enforced and recorded — match results are submitted to DUPR and count toward official ratings.",
    },
    {
      label: "Profile Requirements",
      text: "A DUPR profile is mandatory. Duplicate profiles are not allowed, and sandbagging will not be tolerated.",
    },
    {
      label: "Players Without a Rating",
      text: "Players without a DUPR rating are not allowed in 18+. We request the club's coach to rate such players.",
    },
    {
      label: "Rating Basis",
      text: "A player's DUPR overall rating is taken into consideration — not age- or gender-based ratings.",
    },
  ],
};

export const STATIC_POINTS_ADVANCE = {
  tag: "How Teams Advance",
  intro:
    "Teams don't just advance on wins and losses. They earn standings points based on how a match is won or lost, and those points decide playoff qualification.",
  pointCards: [
    {
      points: 3,
      label: "Regulation Win",
      example: "Won the match 3–1 or 4–0",
      variant: "win",
    },
    {
      points: 2,
      label: "Dream Breaker Win",
      example: "Won 3–2 in the 2–2 tiebreaker",
      variant: "db-win",
    },
    {
      points: 1,
      label: "Dream Breaker Loss",
      example: "Lost 2–3 in the 2–2 tiebreaker",
      variant: "db-loss",
    },
    {
      points: 0,
      label: "Regulation Loss",
      example: "Lost the match 1–3 or 0–4",
      variant: "loss",
    },
  ],
  poolNote:
    "Every team plays a full round robin within its pool. A team's standings points are added up across all of its pool matches, and the teams with the most points advance to the playoff bracket.",
  dreamBreakerNote:
    "The Dream Breaker is the singles tiebreaker played only when a team match is level at 2–2. It decides who wins the match and sets the standings points above — but it does not count toward game differential tiebreakers.",
  tiebreakers: [
    {
      rank: 1,
      name: "Head-to-head result",
      desc: "Used when exactly two teams are tied — the winner of their match is seeded higher",
    },
    {
      rank: 2,
      name: "Game differential",
      desc: "Games won minus games lost across pool play (the four regular matches only)",
    },
    {
      rank: 3,
      name: "Point differential",
      desc: "Total points won minus points lost across pool play",
    },
    {
      rank: 4,
      name: "Head-to-head point differential",
      desc: "Points won minus lost in only the matches between the tied teams",
    },
    {
      rank: 5,
      name: "Coin flip",
      desc: "If every measure above is identical, the tournament director decides by random draw",
      last: true,
      tag: "Last resort",
    },
  ],
  multiTeamNote:
    "When three or more teams are tied, head-to-head often can't settle it, so game differential is used first, then point differential.",
};
