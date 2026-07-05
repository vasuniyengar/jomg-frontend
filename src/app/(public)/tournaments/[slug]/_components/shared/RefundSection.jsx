import DetailsCollapsibleSection from "./DetailsCollapsibleSection";
import RefundContent, { hasRefundContent } from "./RefundContent";

export { hasRefundContent };

export default function RefundSection({ data }) {
  if (!hasRefundContent(data)) return null;

  return (
    <DetailsCollapsibleSection
      id="details-refund"
      title={data.title || "REFUND POLICY"}
    >
      <RefundContent data={data} />
    </DetailsCollapsibleSection>
  );
}
