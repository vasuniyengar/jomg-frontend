"use client";

import { useSearchParams } from "next/navigation";
import ManageTeamsScreen from "./_components/ManageTeamsScreen";

export default function TeamsPageClient() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  return <ManageTeamsScreen tournamentId={tournamentId} />;
}
