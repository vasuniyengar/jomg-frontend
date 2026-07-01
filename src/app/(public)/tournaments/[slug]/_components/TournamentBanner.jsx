import Image from "next/image";

export default function TournamentBanner({ badge, title, bannerUrl, volairLogoUrl }) {
  return (
    <div className="cbnr">
      <img className="cbnr-img" src={bannerUrl} alt="" />
      <div className="cbnr-grad" />
      <div className="cbnr-in">
        <div>
          <div className="cbnr-eyebrow">
            <span className="cbnr-badge">{badge}</span>
          </div>
          <div className="cbnr-title">{title}</div>
          <div className="vol-under">
            <span>POWERED BY</span>
            <img className="vol-logo" src={volairLogoUrl} alt="Volair" />
          </div>
        </div>
      </div>
    </div>
  );
}
