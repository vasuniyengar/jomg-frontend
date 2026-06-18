import PlayoffBracketScreen from "./_components/PlayoffBracketScreen";

export const metadata = {
  title: "Playoff Bracket",
};

export default async function PlayoffBracketPage({ searchParams }) {
  const { tournamentId } = await searchParams;
  return <PlayoffBracketScreen tournamentId={tournamentId} />;
}