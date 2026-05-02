export default function ComingSoon({ name }) {
  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title-group">
          <div className="page-title">{name}</div>
          <div className="page-sub">Coming soon</div>
        </div>
      </div>
      <div className="content">
        <div className="empty">
          <div className="empty-icon">🚧</div>
          <div className="empty-title">Under construction</div>
          <p>This section will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
}
