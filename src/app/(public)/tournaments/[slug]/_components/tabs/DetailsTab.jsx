import Avatar from "../shared/Avatar";

export default function DetailsTab({ data, venue, organizer }) {
  const { details } = data;
  const hasCourts = Boolean(details.courts?.trim());
  const hasOfficialBall = Boolean(details.officialBall?.trim());
  const hasInstructions = details.instructions?.some((block) => block.text?.trim());
  const hasDuprPolicy = Boolean(details.duprPolicyText?.trim());

  return (
    <div className="o3-pane active">
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

      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">ABOUT</div>
        </div>
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
      </div>

      {hasCourts || hasOfficialBall ? (
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
                <div className="info-v">{details.courts}</div>
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
      ) : null}

      {hasInstructions ? (
        <div className="vcard dsec">
          <div className="sh">
            <div className="sh-title">PLAYER INSTRUCTIONS</div>
          </div>
          {details.instructions
            .filter((block) => block.text?.trim())
            .map((block) => (
              <div className="info-block" key={block.label}>
                <div className="info-k">{block.label}</div>
                <div className="info-v">{block.text}</div>
              </div>
            ))}
        </div>
      ) : null}

      {hasDuprPolicy ? (
        <div className="vcard dsec">
          <div className="sh">
            <div className="sh-title">DUPR POLICY</div>
          </div>
          <div className="info-block">
            <div className="info-v">{details.duprPolicyText} </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
