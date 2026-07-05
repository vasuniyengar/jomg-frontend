import { redirect } from "next/navigation";
import { publicTournamentPath } from "@/lib/publicTournamentPaths";

export default async function LegacyPublicTournamentRedirect({ params }) {
  const { slug } = await params;
  redirect(publicTournamentPath(slug));
}
