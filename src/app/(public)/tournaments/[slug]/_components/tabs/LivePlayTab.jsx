import CourtCard from "../shared/CourtCard";

export default function LivePlayTab({ data }) {
  return (
    <div className="o3-pane active">
      <div className="live-banner">
        <span className="live-dot" />
        <span className="live-banner-t">{data.bannerText}</span>
      </div>
      <div className="court-grid">
        {data.courts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </div>
  );
}
