import Avatar from "../shared/Avatar";

export default function DetailsTab({ data, venue, organizer }) {
  const { details } = data;

  return (
    <div className="o3-pane active">
      <div style={{ marginBottom: 18 }}>
        <div className="venue">
          <div className="vcard">
            <div className="vleft-head">
              <div>
                <div className="vname">{venue.name}</div>
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
            </div>
          </div>
          <div className="vcard">
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

      <div className="about">
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
        <div className="vcard dsec">
          <div className="sh">
            <div className="sh-title" style={{ fontSize: 26 }}>
              OFFICIAL BALL
            </div>
          </div>
          <div className="info-block">
            <div className="info-k">Official Ball</div>
            <div className="info-v">
              <b>Sriya Designs</b>{" "}
              {details.officialBall.replace(/^Sriya Designs\s*/, "")}
            </div>
          </div>
        </div>
      </div>

      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">PLAYER INSTRUCTIONS</div>
        </div>
        {details.instructions.map((block) => (
          <div className="info-block" key={block.label}>
            <div className="info-k">{block.label}</div>
            <div className="info-v">
              {block.label === "Stay & Travel" ? (
                <>
                  Hampton Inn Austin (tournament rate code: <b>APBO25</b>).
                </>
              ) : (
                block.text
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">DUPR POLICY</div>
        </div>
        {details.duprPolicy.map((block) => (
          <div className="info-block" key={block.label}>
            <div className="info-k">{block.label}</div>
            <div className="info-v">{block.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
