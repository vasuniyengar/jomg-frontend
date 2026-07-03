import SponsorsContent, { hasSponsorsContent } from "../shared/SponsorsContent";

export default function SponsorsTab({ data }) {
  if (!hasSponsorsContent(data)) {
    return (
      <div className="o3-pane active">
        <div className="vcard dsec">
          <div className="info-v">No sponsors listed yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="o3-pane active">
      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">A HUGE SHOUT OUT TO OUR SPONSORS</div>
        </div>
        <SponsorsContent data={data} />
      </div>
    </div>
  );
}
