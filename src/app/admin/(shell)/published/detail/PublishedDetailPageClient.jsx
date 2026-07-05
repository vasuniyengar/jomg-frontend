"use client";

import { useSearchParams } from "next/navigation";
import PublishedDrawDetailScreen from "../../draw/_components/PublishedDrawDetailScreen";

export default function PublishedDetailPageClient() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");
  const divisionId = searchParams.get("divisionId");

  return (
    <PublishedDrawDetailScreen
      tournamentId={tournamentId}
      divisionId={divisionId}
    />
  );
}
