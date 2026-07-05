"use client";

import { useSearchParams } from "next/navigation";
import GenerateDrawScreen from "./_components/GenerateDrawScreen";

export default function DrawPageClient() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");

  return <GenerateDrawScreen tournamentId={tournamentId} />;
}
