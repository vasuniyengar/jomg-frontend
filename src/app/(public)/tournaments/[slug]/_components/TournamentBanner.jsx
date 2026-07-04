export default function TournamentBanner({ badge, bannerUrl }) {
  return (
    <div className="cbnr">
      <img className="cbnr-img" src={bannerUrl} alt="" />
      <div className="cbnr-grad" />
      <div className="cbnr-in">
        <div>
          <div className="cbnr-eyebrow">
            <span className="cbnr-badge">{badge}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
