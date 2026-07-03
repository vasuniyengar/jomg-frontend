import Avatar from "../shared/Avatar";
import RichTextContent from "../shared/RichTextContent";
import DetailsCollapsibleSection from "../shared/DetailsCollapsibleSection";
import SponsorsSection, { hasSponsorsContent } from "../shared/SponsorsSection";
import RefundSection, { hasRefundContent } from "../shared/RefundSection";
import DetailsSectionNav, { buildDetailsSections } from "../DetailsSectionNav";
import { richTextIsEmpty } from "@/lib/sanitizeRichText";

export default function DetailsTab({ data, venue, organizer }) {
  const { details, sponsors, refund } = data;
  const hasCourts = !richTextIsEmpty(details.courts);
  const hasOfficialBall = Boolean(details.officialBall?.trim());
  const hasInstructions = details.instructions?.some((block) => block.text?.trim());
  const hasPaddlePolicy = !richTextIsEmpty(details.paddlePolicyText);
  const hasDuprPolicy = !richTextIsEmpty(details.duprPolicyText);
  const hasSponsors = hasSponsorsContent(sponsors);
  const hasRefund = hasRefundContent(refund);

  const courtsTitle =
    hasCourts && hasOfficialBall
      ? "COURTS & OFFICIAL BALL"
      : hasCourts
        ? "COURTS"
        : "OFFICIAL BALL";

  const sectionNavItems = buildDetailsSections({
    hasCourts,
    hasOfficialBall,
    hasInstructions,
    hasPaddlePolicy,
    hasSponsors,
    hasDuprPolicy,
    hasRefund,
  });

  const venueContent = (
    <div style={{ marginBottom: 18 }}>
      <div className="venue">
        <div className="vcard">
          <div className="sh venue-sh">
            <div className="sh-title">VENUE</div>
          </div>
          <div className="venue-detail-name">{venue.name}</div>
          <a
            className="vmaps"
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            📍 {venue.address}{" "}
            <span className="vmaps-go">View on Google Maps ↗</span>
          </a>
        </div>
        <div className="vcard">
          <div className="sh venue-sh">
            <div className="sh-title">ORGANIZER</div>
          </div>
          <div className="vorg">
            <Avatar initials={organizer.initials} size={40} seed />
            <div>
              <div className="vorg-name">{organizer.name}</div>
              <div className="vorg-role">{organizer.role}</div>
            </div>
          </div>
          {organizer.email ? (
            <a className="vcontact" href={`mailto:${organizer.email}`}>
              ✉️ {organizer.email}
            </a>
          ) : null}
          {organizer.phone ? (
            <a className="vcontact" href={organizer.phoneHref}>
              📞 {organizer.phone}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );

  const courtsDesktop = (
    <div className="about">
      {hasCourts ? (
        <div className="vcard dsec">
          <div className="sh">
            <div className="sh-title" style={{ fontSize: 26 }}>
              COURTS
            </div>
          </div>
          <div className="info-block">
            <div className="info-k">Courts</div>
            <RichTextContent html={details.courts} />
          </div>
        </div>
      ) : null}
      {hasOfficialBall ? (
        <div className="vcard dsec">
          <div className="sh">
            <div className="sh-title" style={{ fontSize: 26 }}>
              OFFICIAL BALL
            </div>
          </div>
          <div className="info-block">
            <div className="info-k">Official Ball</div>
            <div className="info-v">
              {details.officialBallUrl ? (
                <a
                  href={details.officialBallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-deep)", fontWeight: 600 }}
                >
                  {details.officialBall}
                </a>
              ) : (
                details.officialBall
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  const courtsMobile = (
    <div className="about">
      {hasCourts ? (
        <div className="vcard dsec">
          <div className="info-block">
            <div className="info-k">Courts</div>
            <RichTextContent html={details.courts} />
          </div>
        </div>
      ) : null}
      {hasOfficialBall ? (
        <div className="vcard dsec">
          <div className="info-block">
            <div className="info-k">Official Ball</div>
            <div className="info-v">
              {details.officialBallUrl ? (
                <a
                  href={details.officialBallUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-deep)", fontWeight: 600 }}
                >
                  {details.officialBall}
                </a>
              ) : (
                details.officialBall
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="o3-pane active">
      <DetailsSectionNav sections={sectionNavItems} />

      <DetailsCollapsibleSection
        id="details-venue"
        title="VENUE & ORGANIZER"
        defaultOpen
        card={false}
        desktop={venueContent}
      >
        {venueContent}
      </DetailsCollapsibleSection>

      <DetailsCollapsibleSection id="details-about" title="ABOUT" defaultOpen>
        <div className="about-body">
          <p>
            The <b>Central Texas Championship</b> is an invite-only club-vs-club
            battle on the JOMG PCC circuit — the strongest teams in the region
            across nine skill divisions.
          </p>
          <p>
            This is <b>MLP team play</b>: every team fields its starters
            contesting men&apos;s doubles, women&apos;s doubles, two mixed games,
            and a Dream Breaker when tied 2–2.
          </p>
        </div>
      </DetailsCollapsibleSection>

      {hasCourts || hasOfficialBall ? (
        <DetailsCollapsibleSection
          id="details-courts"
          title={courtsTitle}
          titleStyle={{ fontSize: 26 }}
          className="about"
          card={false}
          desktop={courtsDesktop}
        >
          {courtsMobile}
        </DetailsCollapsibleSection>
      ) : null}

      {hasInstructions ? (
        <DetailsCollapsibleSection
          id="details-instructions"
          title="PLAYER INSTRUCTIONS"
        >
          {details.instructions
            .filter((block) => block.text?.trim())
            .map((block) => (
              <div className="info-block" key={block.label}>
                <div className="info-k">{block.label}</div>
                <div className="info-v">{block.text}</div>
              </div>
            ))}
        </DetailsCollapsibleSection>
      ) : null}

      {hasPaddlePolicy ? (
        <DetailsCollapsibleSection id="details-paddle" title="PADDLE POLICY">
          <div className="info-block">
            <RichTextContent html={details.paddlePolicyText} />
          </div>
        </DetailsCollapsibleSection>
      ) : null}

      <div className="details-mobile-only">
        <SponsorsSection data={sponsors} />
      </div>

      {hasDuprPolicy ? (
        <DetailsCollapsibleSection id="details-dupr" title="DUPR POLICY">
          <div className="info-block">
            <RichTextContent html={details.duprPolicyText} />
          </div>
        </DetailsCollapsibleSection>
      ) : null}

      <div className="details-mobile-only">
        <RefundSection data={refund} />
      </div>
    </div>
  );
}
