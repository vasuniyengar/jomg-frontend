function FormatGrid({ cols, items }) {
  return (
    <div className={`fc-grid cols-${cols}`}>
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
        <h2 className="sr-only">MLP-style pickleball match format details.</h2>

        <div className="sh">
          <div className="sh-title">FORMAT</div>
          <span className="fmt-tag">{format.tag}</span>
        </div>

        <div className="about-body" style={{ marginBottom: 18 }}>
          <p>{format.intro}</p>
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">MLP game scoring</div>
          <div className="about-body" style={{ marginBottom: 10 }}>
            {(format.mlpNotes || []).map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
          <FormatGrid cols={4} items={format.mlpScoring} />
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">Dream Breaker (tiebreaker) if necessary</div>
          <FormatGrid cols={3} items={format.dreamBreaker} />
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">Team setup</div>
          <FormatGrid cols={3} items={format.teamSetup} />
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">Scoring type &amp; timing</div>
          <FormatGrid cols={2} items={format.scoringTiming} />
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">Switch sides</div>
          <FormatGrid cols={2} items={format.switchSides} />
        </div>

        <div className="fmt-group">
          <div className="fmt-glabel">Time out per game</div>
          <FormatGrid cols={1} items={format.timeouts} />
        </div>

        <div className="fc-footer">
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
