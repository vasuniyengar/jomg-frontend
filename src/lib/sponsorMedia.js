import {
  SPONSOR_TIER_KEYS,
} from "@/lib/tournamentSettings";
import { uploadTournamentMedia } from "./tournamentMedia";

export async function uploadPendingSponsorLogos(tournamentId, sponsors, pendingFilesByItemId) {
  if (!pendingFilesByItemId?.size) return sponsors;

  const tiers = { ...(sponsors?.tiers || {}) };

  for (const tierKey of SPONSOR_TIER_KEYS) {
    const items = tiers[tierKey]?.items || [];
    if (!items.length) continue;

    tiers[tierKey] = {
      items: await Promise.all(
        items.map(async (item) => {
          const pendingFile = pendingFilesByItemId.get(item.id);
          if (!pendingFile) return item;

          const result = await uploadTournamentMedia(
            tournamentId,
            pendingFile,
            "sponsor-logo"
          );
          return {
            ...item,
            logoKey: result.key,
            logoUrl: result.url,
          };
        })
      ),
    };
  }

  return { ...sponsors, tiers };
}
