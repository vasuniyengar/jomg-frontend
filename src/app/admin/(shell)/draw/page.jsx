"use client";

import { useSearchParams } from "next/navigation";
import RoundRobinPoolsPage from "./_components/GenerateDrawScreen";

export default function DrawPage() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  if (!tournamentId) {
    return <p>No tournament selected.</p>;
  }

  return <RoundRobinPoolsPage tournamentId={tournamentId} />;
}