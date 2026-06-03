/** Build scoringConfig payload for division create/update APIs. */

import { DIVISION_COLORS } from "./divisions";

export const DEFAULT_DIVISION_FORM = {
  bracketName: "",
  groupId: "",
  formatId: "",
  bracketFormatId: "",
  maxTeams: "16",
  registrationFee: "",
  minAge: "",
  maxAge: "",
  minRating: "",
  maxRating: "",
  startDate: "",
  endDate: "",
  useGlobalSettings: true,
  accentColor: "#AAFF00",
  registrationOn: true,
  showPublic: true,
  duprRecorded: true,
  duprEnforced: false,
  duprCombinedMin: "",
  duprCombinedMax: "",
  skillLevel: "",
};

export function scoringConfigFromDivision(div, tournament) {
  const cfg = div?.scoringConfig || {};
  return {
    useGlobalSettings: cfg.useGlobalSettings !== false,
    accentColor: cfg.accentColor || "",
    registrationOn: cfg.registrationOn !== false,
    showPublic: cfg.showPublic !== false,
    duprRecorded:
      cfg.duprRecorded !== undefined
        ? Boolean(cfg.duprRecorded)
        : Boolean(tournament?.duprRecorded ?? true),
    duprEnforced:
      cfg.duprEnforced !== undefined
        ? Boolean(cfg.duprEnforced)
        : Boolean(tournament?.duprEnforced ?? false),
    duprCombinedMin:
      cfg.duprCombinedMin != null && cfg.duprCombinedMin !== ""
        ? String(cfg.duprCombinedMin)
        : "",
    duprCombinedMax:
      cfg.duprCombinedMax != null && cfg.duprCombinedMax !== ""
        ? String(cfg.duprCombinedMax)
        : "",
    skillLevel: cfg.skillLevel || "",
  };
}

export function buildDivisionSavePayload(form, { tournament } = {}) {
  const useGlobal = form.useGlobalSettings !== false;
  const scoringConfig = {
    useGlobalSettings: useGlobal,
    accentColor: form.accentColor || null,
    registrationOn: Boolean(form.registrationOn),
    showPublic: Boolean(form.showPublic),
    duprRecorded: Boolean(form.duprRecorded),
    duprEnforced: Boolean(form.duprEnforced),
    duprCombinedMin:
      form.duprCombinedMin !== "" && form.duprCombinedMin != null
        ? Number(form.duprCombinedMin)
        : null,
    duprCombinedMax:
      form.duprCombinedMax !== "" && form.duprCombinedMax != null
        ? Number(form.duprCombinedMax)
        : null,
    skillLevel: (form.skillLevel || "").trim(),
  };

  if (!useGlobal) {
    scoringConfig.pricingTiers = [
      {
        label: "Base",
        pricePerPlayer: Number(form.registrationFee) || 0,
      },
    ];
  }

  return {
    bracketName: form.bracketName.trim(),
    groupId: Number(form.groupId),
    formatId: Number(form.formatId),
    bracketFormatId: Number(form.bracketFormatId),
    maxTeams: Number(form.maxTeams) || 16,
    registrationFee: useGlobal
      ? Number(tournament?.entryFee ?? form.registrationFee) || 0
      : Number(form.registrationFee) || 0,
    minAge: Number(form.minAge) || 0,
    maxAge: Number(form.maxAge) || 0,
    minRating: Number(form.minRating) || 0,
    maxRating: Number(form.maxRating) || 0,
    startDate: form.startDate,
    endDate: form.endDate,
    status: "draft",
    scoringConfig,
  };
}

export function divisionAccentColor(div, index) {
  const fromConfig = div?.scoringConfig?.accentColor;
  if (fromConfig && /^#[0-9A-Fa-f]{3,8}$/.test(fromConfig)) {
    return fromConfig;
  }
  return DIVISION_COLORS[Math.max(0, index) % DIVISION_COLORS.length];
}
