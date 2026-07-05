import { notFound } from "next/navigation";
import TournamentPage from "./_components/TournamentPage";
import { fetchPublicTournamentPage } from "@/lib/publicTournament";
import { mapPublicTournamentResponse } from "./_lib/mapPublicTournamentResponse";
import { mockTournamentPageData } from "./_data/mockTournamentPageData";

const DEMO_SLUG = "central-texas-championship";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const apiData = await fetchPublicTournamentPage(slug);
    if (!apiData) {
      if (slug === DEMO_SLUG) {
        return { title: `${mockTournamentPageData.title} · JOMG PCC` };
      }
      return { title: "Tournament not found · JOMG PCC" };
    }
    return {
      title: `${apiData.title} · JOMG PCC`,
      description: apiData.description || "JOMG Pickleball Club Championship",
    };
  } catch {
    return { title: "Tournament · JOMG PCC" };
  }
}

export default async function PublicTournamentPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const forcePreview = resolvedSearchParams?.preview === "1";

  let apiData;
  try {
    apiData = await fetchPublicTournamentPage(slug, { preview: forcePreview });
  } catch {
    apiData = null;
  }

  if (!apiData && slug === DEMO_SLUG) {
    return (
      <TournamentPage
        data={mockTournamentPageData}
        slug={slug}
        preview
      />
    );
  }

  if (!apiData) {
    notFound();
  }

  const data = mapPublicTournamentResponse(apiData);
  return (
    <TournamentPage
      data={data}
      slug={slug}
      preview={Boolean(apiData.preview || apiData.status === "draft")}
    />
  );
}
