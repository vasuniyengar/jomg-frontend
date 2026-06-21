function PickleballIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" fill="var(--accent)" />
      <g fill="var(--surface2)">
        <circle cx="12" cy="6.5" r="1.3" />
        <circle cx="8.2" cy="9" r="1.3" />
        <circle cx="15.8" cy="9" r="1.3" />
        <circle cx="6.5" cy="13.5" r="1.3" />
        <circle cx="17.5" cy="13.5" r="1.3" />
        <circle cx="9" cy="17" r="1.3" />
        <circle cx="15" cy="17" r="1.3" />
      </g>
    </svg>
  );
}

export default function PointsAdvanceTab({ data }) {
  return (
    <div className="o3-pane active">
      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">STANDINGS POINTS</div>
          <span className="fmt-tag">{data.tag}</span>
        </div>
        <div className="info-v" style={{ marginBottom: 6 }}>
          {data.intro}
        </div>

        <div className="sp-cards">
          {data.pointCards.map((card) => (
            <div className={`sp-card ${card.variant}`} key={card.label}>
              <div className="sp-pts">
                <span className="sp-num">{card.points}</span>
                <span className="sp-unit">points</span>
              </div>
              <div className="sp-label">{card.label}</div>
              <div className="sp-eg">{card.example}</div>
            </div>
          ))}
        </div>

        <div className="info-v" style={{ marginTop: 14 }}>
          {data.poolNote}
        </div>

        <div className="sp-note">
          <span className="sp-note-ic">
            <PickleballIcon />
          </span>
          <div className="sp-note-b">
            <b>How the Dream Breaker counts.</b> {data.dreamBreakerNote}
          </div>
        </div>

        <div className="fmt-group" style={{ marginTop: 22 }}>
          <div className="fmt-glabel">Tiebreakers — Applied In Order</div>
          <div className="info-v" style={{ marginBottom: 4 }}>
            If two or more teams finish level on standings points, seeding is
            decided by working down this list until the tie is broken:
          </div>
          <div className="tb-steps">
            {data.tiebreakers.map((step) => (
              <div
                className={`tb-step${step.last ? " tb-step-last" : ""}`}
                key={step.rank}
              >
                <div className={`tb-rank${step.last ? " tb-rank-last" : ""}`}>
                  {step.rank}
                </div>
                <div className="tb-body">
                  <div className="tb-name">
                    {step.name}
                    {step.tag ? <span className="tb-tag">{step.tag}</span> : null}
                  </div>
                  <div className="tb-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="info-v" style={{ marginTop: 10, fontSize: 13 }}>
            {data.multiTeamNote}
          </div>
        </div>
      </div>
    </div>
  );
}
