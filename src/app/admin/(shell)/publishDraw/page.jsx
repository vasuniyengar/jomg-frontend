import { redirect } from "next/navigation";

export default function PublishDrawRedirectPage({ searchParams }) {
  const tournamentId = searchParams?.tournamentId;
  const qs = tournamentId ? `?tournamentId=${tournamentId}` : "";
  redirect(`/admin/published${qs}`);
}
