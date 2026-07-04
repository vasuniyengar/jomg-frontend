function FormatGrid({ cols, items }) {
  return (
    <div className={`fc-grid cols-${cols}`}>
      {items.map((item) => (
        <div className="fc-cell" key={item.label}>
          <div className="fc-label">{item.label}</div>
          <div className="fc-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function FormatTab({ data }) {
  const format = data;

  return (
    <div className="o3-pane active">
      <div className="format-card">
        <h2 className="sr-only">MLP-style pickleball match format details.</h2>

        <div className="fc-header">
          <span className="fc-title">Format</span>
          <span className="fc-badge">{format.tag}</span>
        </div>

        <p className="fc-intro">{format.intro}</p>

        <div className="fc-section tight">MLP game scoring</div>
        {format.mlpNote ? <p className="fc-note">{format.mlpNote}</p> : null}
        <FormatGrid cols={4} items={format.mlpScoring} />

        <div className="fc-section">Dream Breaker (tiebreaker) if necessary</div>
        <FormatGrid cols={3} items={format.dreamBreaker} />

        <div className="fc-section">Team setup</div>
        <FormatGrid cols={3} items={format.teamSetup} />

        <div className="fc-section">Scoring type &amp; timing</div>
        <FormatGrid cols={2} items={format.scoringTiming} />

        <div className="fc-section">Switch sides</div>
        <FormatGrid cols={2} items={format.switchSides} />

        <div className="fc-section">Time out per game</div>
        <FormatGrid cols={1} items={format.timeouts} />

        <div className="fc-footer">
          {format.notes.map((note) => (
            <div key={note.label}>
              <div className="fc-label">{note.label}</div>
              <div className="fc-value">{note.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
