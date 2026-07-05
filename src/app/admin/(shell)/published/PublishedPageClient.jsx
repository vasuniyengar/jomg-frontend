"use client";

import { useSearchParams } from "next/navigation";
import PublishedDrawsScreen from "../draw/_components/PublishedDrawsScreen";

export default function PublishedPageClient() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  return <PublishedDrawsScreen tournamentId={tournamentId} />;
}
