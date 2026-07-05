export default function TournamentBanner({ bannerUrl }) {
  if (!bannerUrl) {
    return <div className="cbnr cbnr-empty" aria-hidden="true" />;
  }

  return (
    <div className="cbnr">
      <img className="cbnr-img" src={bannerUrl} alt="" decoding="async" />
    </div>
  );
}
