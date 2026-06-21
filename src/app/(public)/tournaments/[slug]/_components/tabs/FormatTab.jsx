function FormatCards({ items }) {
  return (
    <div className="fmt-cards">
      {items.map((item) => (
        <div className="fmt-card" key={item.label}>
          <div className="fmt-card-k">{item.label}</div>
          <div className="fmt-card-v">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function FormatTab({ data }) {
  const format = data;

  return (
    <div className="o3-pane active">
      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">FORMAT</div>
          <span className="fmt-tag">{format.tag}</span>
        </div>
        <div className="info-v" style={{ marginBottom: 18 }}>
          {format.intro}
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">MLP Game Scoring</div>
          <div className="info-v" style={{ marginBottom: 10 }}>
            Each match is four doubles games plus an optional Dream Breaker.
          </div>
          <FormatCards items={format.mlpScoring} />
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">Dream Breaker (Tiebreaker)</div>
          <FormatCards items={format.dreamBreaker} />
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">Team Setup</div>
          <FormatCards items={format.teamSetup} />
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">Scoring Type &amp; Timing</div>
          <FormatCards items={format.scoringTiming} />
        </div>

        <div className="info-grid">
          {format.notes.map((note) => (
            <div className="info-block" key={note.label}>
              <div className="info-k">{note.label}</div>
              <div className="info-v">{note.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
