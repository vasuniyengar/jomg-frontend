import RefundContent, { hasRefundContent } from "../shared/RefundContent";

export default function RefundTab({ data }) {
  if (!hasRefundContent(data)) {
    return (
      <div className="o3-pane active">
        <div className="vcard dsec">
          <div className="info-v">No refund policy listed yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="o3-pane active">
      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">{data.title}</div>
        </div>
        <RefundContent data={data} />
      </div>
    </div>
  );
}
