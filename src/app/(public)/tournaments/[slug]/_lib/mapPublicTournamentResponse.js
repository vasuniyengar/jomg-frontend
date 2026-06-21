import {
  PUBLIC_BRAND,
  STATIC_DETAILS,
  STATIC_POINTS_ADVANCE,
  staticSponsorsIntro,
} from "../_content/staticPageCopy";

export function mapPublicTournamentResponse(apiData) {
  if (!apiData) return null;

  return {
    slug: apiData.slug,
    brandTitle: PUBLIC_BRAND.brandTitle,
    brandSubtitle: PUBLIC_BRAND.brandSubtitle,
    title: apiData.title,
    badge: apiData.badge,
    bannerUrl: apiData.bannerUrl || "",
    volairLogoUrl: PUBLIC_BRAND.volairLogoUrl,
    infoBar: apiData.infoBar || [],
    venue: apiData.venue,
    organizer: {
      ...apiData.organizer,
      email: apiData.organizer?.email || "",
    },
    tabs: {
      details: {
        about: [],
        courts: STATIC_DETAILS.courts,
        officialBall: STATIC_DETAILS.officialBall,
        instructions: STATIC_DETAILS.instructions,
        duprPolicy: STATIC_DETAILS.duprPolicy,
      },
      format: apiData.tabs?.format || {},
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
