import DetailsCollapsibleSection from "./DetailsCollapsibleSection";
import SponsorsContent, { hasSponsorsContent } from "./SponsorsContent";

export { hasSponsorsContent };

export default function SponsorsSection({ data }) {
  if (!hasSponsorsContent(data)) return null;

  return (
    <DetailsCollapsibleSection
      id="details-sponsors"
      title="A HUGE SHOUT OUT TO OUR SPONSORS"
    >
      <SponsorsContent data={data} />
    </DetailsCollapsibleSection>
  );
}
