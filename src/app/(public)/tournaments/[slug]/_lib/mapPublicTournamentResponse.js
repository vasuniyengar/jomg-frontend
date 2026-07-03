import {
  PUBLIC_BRAND,
  STATIC_BANNER_BADGE,
  STATIC_BANNER_TITLE,
  STATIC_FORMAT,
  STATIC_INFO_BAR,
  STATIC_POINTS_ADVANCE,
  staticSponsorsIntro,
} from "../_content/staticPageCopy";

export function mapPublicTournamentResponse(apiData) {
  if (!apiData) return null;

  const apiDetails = apiData.tabs?.details || {};

  return {
    slug: apiData.slug,
    brandTitle: PUBLIC_BRAND.brandTitle,
    brandSubtitle: PUBLIC_BRAND.brandSubtitle,
    title: STATIC_BANNER_TITLE,
    badge: STATIC_BANNER_BADGE,
    bannerUrl: apiData.bannerUrl || "",
    volairLogoUrl: PUBLIC_BRAND.volairLogoUrl,
    infoBar: STATIC_INFO_BAR,
    venue: apiData.venue,
    organizer: apiData.organizer || {},
    tabs: {
      details: {
        about: [],
        courts: apiDetails.courtDescription || "",
        officialBall: apiDetails.officialBall || "",
        officialBallUrl: apiDetails.officialBallUrl || "",
        instructions: apiDetails.instructions || [],
        paddlePolicyText: apiDetails.paddlePolicyText || "",
        duprPolicyText: apiDetails.duprPolicyText || "",
      },
      format: STATIC_FORMAT,
      pointsAdvance: STATIC_POINTS_ADVANCE,
      divisions: apiData.tabs?.divisions || { note: "", days: [] },
      sponsors: {
        intro: staticSponsorsIntro(apiData.title),
        tiers: apiData.tabs?.sponsors?.tiers || [],
      },
      refund: apiData.tabs?.refund || {},
      livePlay: apiData.tabs?.livePlay || { enabled: false, courts: [] },
    },
  };
}

export function mergeDivisionDetail(pageData, divisionDetail, divisionId) {
  if (!pageData || !divisionDetail) return pageData;
  return {
    ...pageData,
    tabs: {
      ...pageData.tabs,
      divisions: {
        ...pageData.tabs.divisions,
        details: {
          ...(pageData.tabs.divisions.details || {}),
          [divisionId]: divisionDetail,
        },
      },
    },
  };
}
